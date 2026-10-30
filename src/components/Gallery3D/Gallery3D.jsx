import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Canvas,
    useFrame,
    useLoader,
    useThree
} from "@react-three/fiber";

import { OrbitControls } from "@react-three/drei";

import * as THREE from "three";

import "./Gallery3D.scss";


/* =========================================================
   PARAMÈTRES DU CARROUSEL
========================================================= */

// Distance fixe voulue entre deux photos voisines.
// Doit être supérieure à la largeur du plan (2.5)
// pour éviter tout chevauchement.

const PHOTO_SPACING = 3.2;

// Distance supplémentaire entre le bord du cercle
// et la position de repos de la caméra.

const CAMERA_MARGIN = 7;

// Dimensions du plan photo.

const PHOTO_WIDTH = 2.5;
const PHOTO_HEIGHT = 3.5;

// Paramètres de l'ombre projetée derrière chaque photo :
// dépassement du plan d'ombre autour de la photo,
// décalage de l'ombre (x, y), retrait en profondeur,
// et intensité (opacité).

const SHADOW_MARGIN = 0.1;
const SHADOW_OFFSET_X = 0.05;
const SHADOW_OFFSET_Y = -0.07;
const SHADOW_OFFSET_Z = 0.5;
const SHADOW_OPACITY = 0.08;


/* =========================================================
   RAYON ADAPTATIF

   Garantit un espacement constant entre deux photos
   quel que soit leur nombre :
   distance = 2 × radius × sin(π / totalPhotos)
========================================================= */

function computeGalleryRadius(totalPhotos) {
    return PHOTO_SPACING /
        (2 * Math.sin(Math.PI / totalPhotos));
}


/* =========================================================
   PHOTO 3D

   Une photo posée sur le cercle, orientée vers le centre,
   accompagnée d'un plan d'ombre en retrait.
========================================================= */

function Photo3D({
    photo,
    index,
    totalPhotos,
    radius,
    onPhotoClick,
    reducedMotion
}) {

    const groupRef = useRef(null);
    const materialRef = useRef(null);


    // =======================================
    // Texture
    // =======================================

    const texture = useLoader(
        THREE.TextureLoader,
        photo.previewSrc || photo.thumbnailSrc
    );


    // =======================================
    // Configuration du cercle
    // =======================================

    const totalAngle = Math.PI * 2;

    const photoAngle =
        (index / totalPhotos) * totalAngle;


    // =======================================
    // Position de la photo
    // =======================================

    const targetX =
        Math.sin(photoAngle) * radius;

    const targetY = 0;

    const targetZ =
        Math.cos(photoAngle) * radius;


    // =======================================
    // Orientation vers le centre
    // =======================================

    const targetRotationY =
        photoAngle + Math.PI;


    // =======================================
    // État visuel
    // =======================================

    const targetScale = 1.0;

    const targetOpacity = 1.0;


    // =======================================
    // Animation
    // =======================================

    useFrame(() => {

        if (!groupRef.current) {
            return;
        }

        const group = groupRef.current;


        // -----------------------------------
        // Vitesse d'interpolation
        // -----------------------------------

        const interpolation =
            reducedMotion
                ? 1
                : 0.16;


        // -----------------------------------
        // Position X
        // -----------------------------------

        group.position.x +=
            (
                targetX -
                group.position.x
            ) * interpolation;


        // -----------------------------------
        // Position Y
        // -----------------------------------

        group.position.y +=
            (
                targetY -
                group.position.y
            ) * interpolation;


        // -----------------------------------
        // Position Z
        // -----------------------------------

        group.position.z +=
            (
                targetZ -
                group.position.z
            ) * interpolation;


        // -----------------------------------
        // Rotation Y
        // -----------------------------------

        group.rotation.y +=
            (
                targetRotationY -
                group.rotation.y
            ) * interpolation;

        group.rotation.x = 0;

        group.rotation.z = 0;


        // -----------------------------------
        // Échelle
        // -----------------------------------

        const currentScale =
            group.scale.x;

        const newScale =
            currentScale +
            (
                targetScale -
                currentScale
            ) * interpolation;

        group.scale.set(
            newScale,
            newScale,
            newScale
        );


        // -----------------------------------
        // Opacité de la photo
        // -----------------------------------

        if (materialRef.current) {

            materialRef.current.opacity +=
                (
                    targetOpacity -
                    materialRef.current.opacity
                ) * interpolation;
        }

    });


    // =======================================
    // Rendu
    // =======================================

    return (

        <group
            ref={groupRef}

            position={[
                targetX,
                targetY,
                targetZ
            ]}

            rotation={[
                0,
                targetRotationY,
                0
            ]}

            onClick={(event) => {

                event.stopPropagation();

                onPhotoClick(index);
            }}
        >

            {/* =================================
                OMBRE

                Plan noir légèrement plus grand
                que la photo, décalé vers le bas
                et en retrait derrière elle.
            ================================= */}

            <mesh
                position={[
                    SHADOW_OFFSET_X,
                    SHADOW_OFFSET_Y,
                    SHADOW_OFFSET_Z
                ]}
            >

                <planeGeometry
                    args={[
                        PHOTO_WIDTH + SHADOW_MARGIN * 2,
                        PHOTO_HEIGHT + SHADOW_MARGIN * 2
                    ]}
                />

                <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={SHADOW_OPACITY}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                />

            </mesh>


            {/* =================================
                PHOTO
            ================================= */}

            <mesh>

                <planeGeometry
                    args={[
                        PHOTO_WIDTH,
                        PHOTO_HEIGHT
                    ]}
                />

                <meshBasicMaterial
                    ref={materialRef}
                    map={texture}
                    transparent
                    opacity={targetOpacity}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                />

            </mesh>

        </group>
    );
}


/* =========================================================
   COMPOSANT SCÈNE 3D

   Affiche toutes les photos sur le cercle.
========================================================= */

function GalleryScene({
    photos,
    radius,
    onPhotoClick,
    reducedMotion
}) {

    return (

        <>

            {photos.map((photo, index) => (

                <Photo3D
                    key={photo.id}

                    photo={photo}

                    index={index}

                    totalPhotos={photos.length}

                    radius={radius}

                    onPhotoClick={onPhotoClick}

                    reducedMotion={reducedMotion}
                />

            ))}

        </>

    );
}


/* =========================================================
   CAMÉRA ADAPTATIVE

   Repositionne l'observateur à l'extérieur du cercle
   dès que le rayon change (c'est-à-dire dès que le
   nombre de photos change).
========================================================= */

function CameraAdjuster({ radius }) {

    const { camera } = useThree();


    useEffect(() => {

        // Distance entre le centre et
        // l'observateur : rayon + marge
        // de sécurité.

        const distance =
            radius + CAMERA_MARGIN;

        camera.position.set(
            0,
            0,
            distance
        );

        // Le plan lointain s'adapte pour
        // éviter les coupures d'affichage
        // (clipping) sur les grands cercles.

        camera.far = distance * 4;

        camera.updateProjectionMatrix();

    }, [camera, radius]);


    return null;
}


/* =========================================================
   COMPOSANT GALERIE 3D
========================================================= */

function Gallery3D({
    photos,
    onPhotoClick
}) {

    // =======================================
    // Accessibilité
    // =======================================

    const [
        reducedMotion,
        setReducedMotion
    ] = useState(false);


    useEffect(() => {

        const mediaQuery =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

        const updatePreference = () => {

            setReducedMotion(
                mediaQuery.matches
            );
        };

        updatePreference();

        mediaQuery.addEventListener(
            "change",
            updatePreference
        );

        return () => {

            mediaQuery.removeEventListener(
                "change",
                updatePreference
            );
        };

    }, []);


    // =======================================
    // Index actuel
    // =======================================

    const [
        currentIndex,
        setCurrentIndex
    ] = useState(0);


    // =======================================
    // Vérification des données
    // =======================================

    if (!photos || photos.length === 0) {
        return null;
    }


    // =======================================
    // Rayon du cercle
    // =======================================

    const radius =
        computeGalleryRadius(photos.length);


    // =======================================
    // Distance caméra
    // =======================================

    const cameraDistance =
        radius + CAMERA_MARGIN;


    // =======================================
    // Rendu
    // =======================================

    return (

        <div className="gallery3d">

            <Canvas

                camera={{
                    position: [
                        0,
                        0,
                        cameraDistance
                    ],
                    fov: 60,
                    near: 0.2,
                    far: cameraDistance * 4,
                }}

                dpr={[1, 2]}

                gl={{
                    antialias: true,
                    alpha: true
                }}

            >

                <ambientLight intensity={0.5} />

                <pointLight
                    position={[10, 10, 10]}
                />


                {/* =================================
                    CAMÉRA ADAPTATIVE
                ================================= */}

                <CameraAdjuster

                    radius={radius}

                />


                {/* =================================
                    CONTRÔLES
                ================================= */}

                <OrbitControls

                    enableZoom={true}

                    enablePan={false}

                    enableRotate={true}

                    // Verrouillage de la distance :
                    // l'observateur ne peut jamais
                    // pénétrer dans le cercle.

                    minDistance={radius + 2}

                    maxDistance={
                        radius +
                        CAMERA_MARGIN * 4
                    }

                    minPolarAngle={
                        Math.PI / 2 - 0.1
                    }

                    maxPolarAngle={
                        Math.PI / 2 + 0.1
                    }

                    autoRotate={false}

                    autoRotateSpeed={0.5}

                />


                {/* =================================
                    PHOTOS
                ================================= */}

                <GalleryScene

                    photos={photos}

                    radius={radius}

                    onPhotoClick={onPhotoClick}

                    reducedMotion={reducedMotion}

                />

            </Canvas>



            {/* =================================================
               COMPTEUR
            ================================================= */}

            <div

                className="gallery3d-counter"

                aria-live="polite"

            >

                {currentIndex + 1}
                {" / "}
                {photos.length}

            </div>

        </div>
    );
}

export default Gallery3D;