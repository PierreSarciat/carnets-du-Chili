const fs = require("fs");
const path = require("path");

/* =========================================================
   CONFIGURATION
========================================================= */

/*
 * RENAME_FILES :
 *
 * true  : les fichiers contenant des espaces sont renommés
 *         sur le disque ("CHILOE 6.webp" -> "CHILOE_6.webp").
 *
 * false : aucun fichier n'est modifié, seules les données
 *         sont régénérées à partir des noms existants.
 */
const RENAME_FILES = true;

/*
 * CREATE_BACKUP :
 *
 * true : avant de réécrire un fichier de région, une copie
 *        de sauvegarde est créée (exemple : chiloe.js.bak).
 */
const CREATE_BACKUP = true;

/*
 * Chaque région définit :
 * - name : nom affiché dans les données
 * - dir  : nom réel du dossier dans public/assets/images
 */
const REGIONS = {
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
   de secours : elles sont réécrites dans le fichier uniquement
   si les champs ont disparu du fichier existant.

   Pour modifier subtitle, background ou quote, éditez
   directement le fichier de région : vos modifications
   seront conservées telles quelles à chaque exécution.

   Exemple pour une autre région :
   //
   // patagonie: [
   //     `  subtitle: "Le grand souffle du Sud",`,
   //     `  description: "...",`,
   // ],
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
   CHEMINS
========================================================= */

const imagesRoot = path.resolve(
    __dirname,
    "../public/assets/images"
);

const outputRoot = path.resolve(
    __dirname,
    "../src/data/regions"
);

/*
 * Fichiers de données susceptibles de référencer
 * des noms de fichiers images.
 *
 * Après renommage, les occurrences des anciens noms
 * y sont automatiquement remplacées par les nouveaux.
 */
const REFERENCE_FILES = [
    path.resolve(__dirname, "../src/data/regions.js"),
];

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

const IMPORT_LINE = 'import { BASE_PATH } from "@/config";';

/* =========================================================
   OUTILS
========================================================= */

/*
 * Normalisation pour le matching /thumb <-> /full :
 * espaces, underscores, casse et extension neutralisés.
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
   ASSAINISSEMENT DES NOMS DE FICHIERS

   "CHILOE  6 .webp"      -> "CHILOE_6.webp"
   "punta_arenas _5.webp" -> "punta_arenas_5.webp"
   "CHILOE19.webp"        -> inchangé
========================================================= */

function sanitizeFilename(filename) {
    const parsed = path.parse(filename);

    const cleanName = parsed.name
        .trim()
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_");

    return cleanName + parsed.ext;
}

/*
 * Renomme les fichiers d'un dossier.
 *
 * renames : Map partagée (ancien nom -> nouveau nom)
 * utilisée ensuite pour mettre à jour les fichiers
 * de référence.
 */
function sanitizeDirectory(dir, renames) {
    if (!fs.existsSync(dir)) {
        return 0;
    }

    const files = fs
        .readdirSync(dir)
        .filter((file) => IMAGE_EXTENSIONS.test(file));

    if (files.length === 0) {
        return 0;
    }

    const existingNames = new Set(fs.readdirSync(dir));
    let renamedCount = 0;

    for (const file of files) {
        const newName = sanitizeFilename(file);

        if (newName === file) {
            continue;
        }

        /*
         * Sécurité : ne jamais écraser un fichier existant.
         * En cas de collision, le renommage est annulé
         * et signalé pour traitement manuel.
         */
        if (existingNames.has(newName)) {
            console.warn(
                `Conflit de nom dans ${dir} :` +
                    ` "${file}" -> "${newName}" existe déjà.` +
                    ` Renommage ignoré.`
            );
            continue;
        }

        fs.renameSync(
            path.join(dir, file),
            path.join(dir, newName)
        );

        existingNames.delete(file);
        existingNames.add(newName);

        renames.set(file, newName);
        renamedCount += 1;

        console.log(`Renommé : ${file} -> ${newName}`);
    }

    return renamedCount;
}

/*
 * Met à jour les fichiers de données (regions.js, etc.)
 * en remplaçant chaque ancien nom de fichier par le nouveau.
 */
function updateReferenceFiles(renames) {
    for (const referenceFile of REFERENCE_FILES) {
        if (!fs.existsSync(referenceFile)) {
            continue;
        }

        let content = fs.readFileSync(referenceFile, "utf8");
        let changed = false;

        for (const [oldName, newName] of renames) {
            if (content.includes(oldName)) {
                content = content.split(oldName).join(newName);
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(referenceFile, content, "utf8");
            console.log(`Références mises à jour : ${referenceFile}`);
        }
    }
}

/* =========================================================
   LECTURE DES DOSSIERS
========================================================= */

function listImageFiles(dir) {
    if (!fs.existsSync(dir)) {
        return null;
    }

    return fs
        .readdirSync(dir)
        .filter((file) => IMAGE_EXTENSIONS.test(file))
        .sort((a, b) =>
            a.localeCompare(b, "fr", {
                numeric: true,
                sensitivity: "base",
            })
        );
}

/* =========================================================
   GÉNÉRATION DU TABLEAU PHOTOS
========================================================= */

function buildPhotoEntries(region, config) {
    const regionDir = config.dir;

    const thumbDir = path.join(imagesRoot, regionDir, "thumb");
    const fullDir = path.join(imagesRoot, regionDir, "full");

    const thumbFiles = listImageFiles(thumbDir);

    if (!thumbFiles) {
        console.error(`Dossier thumb absent : ${thumbDir}`);
        return null;
    }

    if (!fs.existsSync(fullDir)) {
        console.warn(`Dossier full absent : ${fullDir}`);
    }

    const fullFiles = listImageFiles(fullDir) || [];

    const fullFilesByName = new Map();

    for (const fullFile of fullFiles) {
        const key = normalizeFilename(fullFile);

        if (!fullFilesByName.has(key)) {
            fullFilesByName.set(key, fullFile);
        }
    }

    const usedIds = new Set();
    const entries = [];

    for (const thumbFile of thumbFiles) {
        const basename = path
            .parse(thumbFile)
            .name
            .trim()
            .replace(/[_]+/g, " ")
            .replace(/\s+/g, " ");

        const matchingFullFile =
            fullFilesByName.get(normalizeFilename(thumbFile)) || null;

        const id = getPhotoId(region, config, basename);
        const title = getPhotoTitle(region, config, basename);

        if (usedIds.has(id)) {
            console.warn(`Identifiant en double (${region}) : ${id}`);
        }
        usedIds.add(id);

        if (!matchingFullFile) {
            console.warn(
                `Image originale introuvable dans /full pour : ${thumbFile}`
            );
        }

        const relativeThumb =
            `assets/images/${regionDir}/thumb/${thumbFile}`;

        const relativeFull = matchingFullFile
            ? `assets/images/${regionDir}/full/${matchingFullFile}`
            : "";

        entries.push(
            [
                "    {",
                `      id: ${JSON.stringify(id)},`,
                "      thumbnailSrc: `${BASE_PATH}" + relativeThumb + "`,",
                "      previewSrc: `${BASE_PATH}" + relativeThumb + "`,",
                "      fullSrc: " +
                    (relativeFull
                        ? "`${BASE_PATH}" + relativeFull + "`"
                        : `""`) +
                    ",",
                `      title: ${JSON.stringify(title)},`,
                `      alt: ${JSON.stringify(title)}`,
                "    },",
            ].join("\n")
        );
    }

    return entries;
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

function buildRegionFile(region, config, entries, existingContent) {
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
            return null;
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

    return header + "\n" + photosBlock;
}

/* =========================================================
   POINT D'ENTRÉE
========================================================= */

fs.mkdirSync(outputRoot, { recursive: true });

const allRenames = new Map();

for (const [region, config] of Object.entries(REGIONS)) {
    const regionDir = config.dir;
    const regionRoot = path.join(imagesRoot, regionDir);

    /* -----------------------------------------------
       1. ASSAINISSEMENT DES NOMS DE FICHIERS
    ----------------------------------------------- */

    if (RENAME_FILES) {
        for (const subDir of ["thumb", "full", "background"]) {
            sanitizeDirectory(
                path.join(regionRoot, subDir),
                allRenames
            );
        }
    }

    /* -----------------------------------------------
       2. RÉGÉNÉRATION DU FICHIER DE RÉGION
    ----------------------------------------------- */

    const entries = buildPhotoEntries(region, config);

    if (!entries) {
        continue;
    }

    if (entries.length === 0) {
        console.warn(`Aucune image trouvée dans ${regionDir}/thumb`);
        continue;
    }

    const outputFile = path.join(outputRoot, `${region}.js`);

    const existingContent = fs.existsSync(outputFile)
        ? fs.readFileSync(outputFile, "utf8")
        : null;

    const fileContent = buildRegionFile(
        region,
        config,
        entries,
        existingContent
    );

    if (fileContent === null) {
        console.warn(
            `Structure non reconnue : fichier laissé intact -> ${outputFile}`
        );
        continue;
    }

    /* -----------------------------------------------
       Sauvegarde du fichier existant
    ----------------------------------------------- */

    if (CREATE_BACKUP && fs.existsSync(outputFile)) {
        const backupFile = outputFile + ".bak";

        fs.copyFileSync(outputFile, backupFile);

        console.log(`Sauvegarde créée : ${backupFile}`);
    }

    fs.writeFileSync(outputFile, fileContent, "utf8");

    console.log(
        `${config.name} : ${entries.length} photo(s) mise(s) à jour -> ${outputFile}`
    );
}

/* -----------------------------------------------
   3. MISE À JOUR DES FICHIERS DE RÉFÉRENCE
----------------------------------------------- */

if (RENAME_FILES && allRenames.size > 0) {
    updateReferenceFiles(allRenames);

    console.log(
        `\n${allRenames.size} fichier(s) renommé(s) sur le disque.`
    );
} else {
    console.log("\nAucun renommage effectué.");
}