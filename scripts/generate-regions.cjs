const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

/* =========================================================
   CONFIGURATION
========================================================= */

/*
 * CREATE_BACKUP :
 *
 * true : avant de réécrire un fichier de région, une copie
 *        de sauvegarde est créée (exemple : chiloe.js.bak).
 *
 * La sauvegarde n'a lieu que si le fichier est réellement
 * réécrit (contenu différent).
 */
const CREATE_BACKUP = true;

/*
 * FORCE_RECONVERT :
 *
 * false : seules les images modifiées sont reconverties
 *         (la miniature est régénérée uniquement si
 *         l'original est plus récent qu'elle).
 *
 * true  : toutes les images sont reconverties, même si
 *         les miniatures existantes sont à jour.
 */
const FORCE_RECONVERT = false;

/*
 * Chaque région définit :
 * - name : nom affiché dans les données
 * - dir  : nom réel du dossier dans public/assets/images
 */
const REGIONS = {
    santiago: {
        name: "Santiago de Chile",
        dir: "santiago",
    },
    chiloe: {
        name: "Chiloé",
        dir: "chiloe",
    },
    patagonie: {
        name: "Patagonie",
        dir: "patagonie",
    },
    puertowilliams: {
        name: "Puerto Williams",
        dir: "puertowilliams",
    },
    torresdelpaine: {
        name: "Torres del Paine",
        dir: "torresdelpaine",
    },
    puntarenas: {
        name: "Punta Arenas",
        dir: "punta_arenas",
    },
};

/* =========================================================
   MÉTADONNÉES DE RÉGION

   RÈGLE ABSOLUE :

   La partie du fichier située avant "photos:" n'est JAMAIS
   modifiée lorsqu'elle existe. Ces lignes servent uniquement
   de secours : elles sont réécrites dans le fichier
   uniquement si les champs ont disparu du fichier existant.

   Pour modifier subtitle, background ou quote, éditez
   directement le fichier de région : vos modifications
   seront conservées telles quelles à chaque exécution.
========================================================= */

const REGION_METADATA = {
    chiloe: [
        `  subtitle: "Entre terre et océan",`,
        "  background: `${BASE_PATH}assets/images/chiloe/background/background-chiloe.webp`,",
        `  quote: {`,
        `        text: "Il pleuvait ; il pleuvait sur les îles. Ainsi le territoire demeurait tel une main verte, tel un gant dont les doigts flottaient parmi les algues marines. ",`,
        `        original: "Llovía; llovía en las islas. Así se mantenía el territorio como una mano verde, como un guante cuyos dedos flotaban entre algas marinas. ",`,
        `        author: "Pablo Neruda",`,
        `        source: "Hacia las islas, Canto General, 1950",`,
        `    },`,
    ],
};

/* =========================================================
   DIMENSIONS DES MINIATURES

   Le ratio d'origine est conservé et les images
   ne sont pas agrandies.
========================================================= */

const THUMB_MAX_WIDTH = 1000;
const THUMB_MAX_HEIGHT = 1000;
const WEBP_QUALITY = 82;

const IMAGE_EXTENSIONS = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
]);

// Le script doit rester dans le dossier scripts/ du projet.
const imagesRoot = path.resolve(
    __dirname,
    "../public/assets/images"
);

const outputRoot = path.resolve(
    __dirname,
    "../src/data/regions"
);

const IMPORT_LINE = 'import { BASE_PATH } from "@/config";';

/* =========================================================
   OUTILS
========================================================= */

function isImageFile(file) {
    return IMAGE_EXTENSIONS.has(
        path.extname(file).toLowerCase()
    );
}

/*
 * Normalisation pour la détection des doublons dans /full :
 * espaces, underscores et casse neutralisés.
 */
function normalizeFilename(filename) {
    return path
        .parse(filename)
        .name
        .trim()
        .replace(/[_]+/g, " ")
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("fr");
}

/*
 * Assainit le nom de la miniature générée :
 * "CHILOE 10.webp" -> "CHILOE_10.webp"
 */
function sanitizeThumbName(basename) {
    return basename
        .trim()
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_");
}

function slugify(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getPhotoId(region, config, basename) {
    const filenameSlug = slugify(basename);

    const regionSlugs = [
        slugify(region),
        slugify(config.dir),
        slugify(config.name),
    ].filter(Boolean);

    if (
        regionSlugs.some(
            (regionSlug) =>
                filenameSlug === regionSlug ||
                filenameSlug.startsWith(`${regionSlug}-`)
        )
    ) {
        return filenameSlug;
    }

    return `${slugify(region)}-${filenameSlug}`;
}

const REGION_PREFIXES = {
    santiago: /^santiago[\s_-]*(de[\s_-]*chile)?[\s_]*/i,
    chiloe: /^chilo[eé]\s*/i,
    patagonie: /^patagonie\s*/i,
    puertowilliams: /^puerto[\s_-]*williams\s*/i,
    torresdelpaine: /^torres[\s_-]*del[\s_-]*paine\s*/i,
    puntarenas: /^punta[\s_-]*arenas\s*/i,
};

function getPhotoTitle(region, config, basename) {
    const normalizedName = basename
        .trim()
        .replace(/[_]+/g, " ")
        .replace(/\s+/g, " ");

    const prefix = REGION_PREFIXES[region];
    const suffix = prefix
        ? normalizedName.replace(prefix, "").trim()
        : normalizedName;

    return suffix ? `${config.name} ${suffix}` : config.name;
}

/* =========================================================
   PRÉSERVATION DE LA ZONE DE MÉTADONNÉES

   RÈGLE ABSOLUE :

   Tout ce qui précède "photos:" dans le fichier existant est
   recopié À L'IDENTIQUE : subtitle, background, quote, ou
   toute autre propriété ajoutée manuellement.

   Le contenu de REGION_METADATA est utilisé UNIQUEMENT si
   les champs attendus ont disparu du fichier existant
   (restauration de secours).

   Si la structure du fichier n'est pas reconnaissable,
   le fichier n'est JAMAIS réécrit.
========================================================= */

/*
 * Extrait la zone de métadonnées : toutes les lignes
 * situées avant la ligne "photos: [".
 *
 * Retourne null si la structure du fichier n'est pas
 * reconnaissable : dans ce cas, le fichier n'est JAMAIS
 * réécrit.
 */
function extractHeader(existingContent, region) {
    const lines = existingContent.split("\n");

    const photosLineIndex = lines.findIndex((line) =>
        /^\s*photos\s*:\s*\[/.test(line)
    );

    if (photosLineIndex === -1) {
        return null;
    }

    const header = lines.slice(0, photosLineIndex).join("\n");

    /*
     * Sécurité : le fichier doit correspondre à la région
     * traitée. Sinon, il n'est pas touché.
     */
    if (!header.includes(`const ${region}`)) {
        return null;
    }

    return header;
}

/*
 * Vérifie que les champs définis dans REGION_METADATA
 * sont bien présents dans la zone extraite du fichier.
 *
 * S'ils sont présents : le fichier est recopié tel quel,
 * même si son contenu diffère de REGION_METADATA.
 *
 * S'il en manque : la zone a été perdue auparavant,
 * elle est restaurée depuis REGION_METADATA.
 */
function metadataIsIntact(header, region) {
    const metadataLines = REGION_METADATA[region];

    if (!metadataLines) {
        return true;
    }

    return metadataLines
        .map((line) => line.match(/^\s*(\w+)\s*:/))
        .filter(Boolean)
        .every((match) => header.includes(`${match[1]}:`));
}

/*
 * Header de secours : utilisé uniquement lorsque le fichier
 * n'existe pas encore ou que sa zone de métadonnées a été
 * perdue.
 */
function buildFallbackHeader(region, config) {
    const metadataLines =
        REGION_METADATA[region] || [
            `    subtitle: "",`,
            `    description: "",`,
        ];

    return [
        `const ${region} = {`,
        `    id: "${region}",`,
        `    name: "${config.name}",`,
        ...metadataLines,
    ].join("\n");
}

/*
 * Garantit l'import de BASE_PATH en tête de fichier,
 * sans jamais le dupliquer.
 */
function ensureImport(header) {
    if (header.includes(IMPORT_LINE)) {
        return header;
    }

    console.warn("Import BASE_PATH absent : réinsertion automatique.");

    return IMPORT_LINE + "\n\n" + header;
}

/* =========================================================
   ÉCRITURE DU FICHIER DE RÉGION

   RÈGLE INCRÉMENTIELLE :

   Le fichier n'est réécrit QUE si le contenu généré diffère
   du contenu actuel du fichier. Si rien n'a changé (ni les
   images, ni les métadonnées), le fichier est laissé
   intact : aucune écriture, aucune sauvegarde, la date de
   modification du fichier est préservée.
========================================================= */

async function writeRegionFile(region, config, entries) {
    const outputFile = path.join(
        outputRoot,
        `${region}.js`
    );

    let existingContent = null;

    try {
        existingContent = await fs.readFile(outputFile, "utf8");
    } catch {
        existingContent = null;
    }

    let header;

    /* -----------------------------------------------
       CAS 1 : le fichier existe et sa structure
       est reconnaissable.
    ----------------------------------------------- */

    if (existingContent) {
        const extractedHeader = extractHeader(existingContent, region);

        if (extractedHeader === null) {
            /*
             * Structure non reconnaissable :
             * le fichier est laissé INTACT.
             */
            console.warn(
                `Structure non reconnue : fichier laissé intact -> ${outputFile}`
            );
            return false;
        }

        if (metadataIsIntact(extractedHeader, region)) {
            /*
             * La zone de métadonnées est recopiée
             * À L'IDENTIQUE : aucune modification,
             * même si le contenu diffère de
             * REGION_METADATA.
             */
            header = ensureImport(extractedHeader);

            console.log("Métadonnées préservées telles quelles.");
        } else {
            /*
             * Les champs ont disparu du fichier
             * (écrasement antérieur) :
             * restauration depuis REGION_METADATA.
             */
            header = ensureImport(buildFallbackHeader(region, config));

            console.warn(
                "Métadonnées absentes du fichier : " +
                    "restauration depuis REGION_METADATA."
            );
        }
    }

    /* -----------------------------------------------
       CAS 2 : le fichier n'existe pas encore.
    ----------------------------------------------- */

    else {
        header = ensureImport(buildFallbackHeader(region, config));

        console.log("Nouveau fichier de région : header par défaut.");
    }

    const photosBlock = [
        "",
        "  photos: [",
        entries.join("\n"),
        "  ]",
        "};",
        "",
        `export default ${region};`,
        "",
    ].join("\n");

    const newContent = header + "\n" + photosBlock;

    /* -----------------------------------------------
       RÈGLE INCRÉMENTIELLE :
       contenu identique -> fichier laissé intact.
    ----------------------------------------------- */

    if (existingContent !== null && newContent === existingContent) {
        console.log(
            `Aucun changement : fichier laissé intact -> ${outputFile}`
        );
        return true;
    }

    /* -----------------------------------------------
       Sauvegarde, uniquement si réécriture effective.
    ----------------------------------------------- */

    if (CREATE_BACKUP && existingContent !== null) {
        await fs.copyFile(outputFile, outputFile + ".bak");

        console.log(`Sauvegarde créée : ${outputFile}.bak`);
    }

    await fs.writeFile(outputFile, newContent, "utf8");

    console.log(
        `✅ Données générées : ${outputFile} (${entries.length} photo(s))`
    );

    return true;
}

/* =========================================================
   CONVERSION DES IMAGES /full -> /thumb

   RÈGLE INCRÉMENTIELLE :

   Une miniature est régénérée UNIQUEMENT si :
   - elle n'existe pas encore, ou
   - l'original de /full a été modifié plus récemment
     qu'elle (comparaison des dates de modification).

   Une image intacte n'est ni relue, ni reconvertie.
========================================================= */

async function convertImage(fullPath, thumbnailPath) {
    await sharp(fullPath)
        .rotate() // Respecte l'orientation EXIF de la photo.
        .resize({
            width: THUMB_MAX_WIDTH,
            height: THUMB_MAX_HEIGHT,
            fit: "inside",
            withoutEnlargement: true,
        })
        .webp({
            quality: WEBP_QUALITY,
            effort: 5,
        })
        .toFile(thumbnailPath);
}

async function isUpToDate(fullPath, thumbnailPath) {
    const thumbStat = await fs
        .stat(thumbnailPath)
        .catch(() => null);

    if (thumbStat === null) {
        return false;
    }

    const fullStat = await fs.stat(fullPath);

    return thumbStat.mtimeMs >= fullStat.mtimeMs;
}

/* =========================================================
   TRAITEMENT D'UNE RÉGION
========================================================= */

async function generateRegion(region, config) {
    const regionDir = config.dir;

    const thumbDir = path.join(
        imagesRoot,
        regionDir,
        "thumb"
    );

    const fullDir = path.join(
        imagesRoot,
        regionDir,
        "full"
    );

    try {
        await fs.access(fullDir);
    } catch {
        console.warn(`❌ Dossier full absent : ${fullDir}`);
        return null;
    }

    // Le dossier thumb est créé automatiquement s'il n'existe pas.
    await fs.mkdir(thumbDir, { recursive: true });

    const fullFiles = (await fs.readdir(fullDir))
        .filter(isImageFile)
        .sort((a, b) => a.localeCompare(b));

    if (fullFiles.length === 0) {
        console.warn(`⚠️ Aucune image dans : ${fullDir}`);
        return null;
    }

    const entries = [];
    const generatedWebpFiles = new Set();
    const usedBasenames = new Set();

    let convertedCount = 0;
    let upToDateCount = 0;

    for (const fullFile of fullFiles) {
        const basename = path
            .parse(fullFile)
            .name
            .trim()
            .replace(/\s+/g, " ");

        /*
         * Deux fichiers de /full ayant le même nom (espaces et
         * underscores indifférents) produiraient la même
         * miniature WebP.
         */
        const normalizedBasename = normalizeFilename(fullFile);

        if (usedBasenames.has(normalizedBasename)) {
            console.warn(
                `⚠️ Nom en doublon ignoré pour ${region} : ${fullFile}`
            );
            continue;
        }
        usedBasenames.add(normalizedBasename);

        /*
         * Le nom de la miniature est assaini afin de ne jamais
         * réintroduire d'espaces dans les URLs.
         */
        const thumbnailFile =
            `${sanitizeThumbName(basename)}.webp`;

        const fullPath = path.join(fullDir, fullFile);
        const thumbnailPath = path.join(thumbDir, thumbnailFile);

        /* -----------------------------------------------
           CONVERSION UNIQUEMENT SI NÉCESSAIRE
        ----------------------------------------------- */

        const needsConversion =
            FORCE_RECONVERT ||
            !(await isUpToDate(fullPath, thumbnailPath));

        if (needsConversion) {
            try {
                await convertImage(fullPath, thumbnailPath);

                convertedCount += 1;

                console.log(
                    `✅ ${regionDir}/${thumbnailFile} créé ou actualisé`
                );
            } catch (error) {
                console.error(
                    `❌ Échec de conversion de ${fullFile} : ${error.message}`
                );

                continue;
            }
        } else {
            upToDateCount += 1;
        }

        /*
         * La miniature existe (créée ou déjà présente) :
         * elle est protégée contre le nettoyage et
         * référencée dans les données.
         */
        generatedWebpFiles.add(thumbnailFile.toLowerCase());

        /* -----------------------------------------------
           Entrée de données, au même format que le
           script de génération (chemins préfixés par
           ${BASE_PATH}, identifiants et titres
           identiques).
        ----------------------------------------------- */

        const dataBasename = basename
            .replace(/[_]+/g, " ")
            .replace(/\s+/g, " ");

        const id = getPhotoId(region, config, dataBasename);
        const title = getPhotoTitle(region, config, dataBasename);

        const relativeThumb =
            `assets/images/${regionDir}/thumb/${thumbnailFile}`;
        const relativeFull =
            `assets/images/${regionDir}/full/${fullFile}`;

        entries.push(
            [
                "    {",
                `      id: ${JSON.stringify(id)},`,
                "      thumbnailSrc: `${BASE_PATH}" + relativeThumb + "`,",
                "      previewSrc: `${BASE_PATH}" + relativeThumb + "`,",
                "      fullSrc: `${BASE_PATH}" + relativeFull + "`,",
                `      title: ${JSON.stringify(title)},`,
                `      alt: ${JSON.stringify(title)}`,
                "    },",
            ].join("\n")
        );
    }

    console.log(
        `${regionDir} : ${convertedCount} image(s) convertie(s), ` +
            `${upToDateCount} déjà à jour.`
    );

    /*
     * Supprime les anciens WebP qui ne correspondent plus à
     * une image présente dans /full. Les éventuels JPG/PNG déjà
     * présents dans /thumb ne sont pas supprimés.
     */
    const existingThumbFiles = await fs.readdir(thumbDir);

    for (const file of existingThumbFiles) {
        if (
            path.extname(file).toLowerCase() === ".webp" &&
            !generatedWebpFiles.has(file.toLowerCase())
        ) {
            await fs.unlink(path.join(thumbDir, file));
            console.log(`🗑️ Ancien WebP supprimé : ${regionDir}/thumb/${file}`);
        }
    }

    return entries;
}

/* =========================================================
   POINT D'ENTRÉE
========================================================= */

async function main() {
    await fs.mkdir(outputRoot, { recursive: true });

    for (const [region, config] of Object.entries(REGIONS)) {
        console.log(`\n--- Traitement de ${region} ---`);

        const entries = await generateRegion(region, config);

        if (entries === null) {
            continue;
        }

        if (entries.length === 0) {
            console.warn(
                `⚠️ Aucune miniature générée pour ${region} : ` +
                    `fichier de données laissé intact.`
            );
            continue;
        }

        await writeRegionFile(region, config, entries);
    }

    console.log("\nTerminé : seuls les fichiers modifiés ont été actualisés.");
}

main().catch((error) => {
    console.error("Erreur pendant la génération :", error);
    process.exitCode = 1;
});