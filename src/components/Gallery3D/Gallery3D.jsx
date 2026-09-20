import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Canvas,
    useFrame,
    useLoader
} from "@react-three/fiber";

import { OrbitControls } from "@react-three/drei";

import * as THREE from "three";

import "./Gallery3D.scss";


/* =========================================================
   COMPOSANT PHOTO 3D

   Chaque photo :
   - est placée sur un cercle de 360°
   - reste parfaitement plate
   - est orientée vers le centre du cercle
========================================================= */

function Photo3D({
    photo,
    index,
    totalPhotos,
    onPhotoClick,
    reducedMotion
}) {

    const meshRef = useRef(null);


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

    const radius = 10.5;

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

        if (!meshRef.current) {
            return;
        }


        const mesh =
            meshRef.current;


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

        mesh.position.x +=
            (
                targetX -
                mesh.position.x
            ) * interpolation;


        // -----------------------------------
        // Position Y
        // -----------------------------------

        mesh.position.y +=
            (
                targetY -
                mesh.position.y
            ) * interpolation;


        // -----------------------------------
        // Position Z
        // -----------------------------------

        mesh.position.z +=
            (
                targetZ -
                mesh.position.z
            ) * interpolation;


        // -----------------------------------
        // Rotation Y
        // -----------------------------------

        mesh.rotation.y +=
            (
                targetRotationY -
                mesh.rotation.y
            ) * interpolation;


        mesh.rotation.x = 0;

        mesh.rotation.z = 0;


        // -----------------------------------
        // Échelle
        // -----------------------------------

        const currentScale =
            mesh.scale.x;


        const newScale =
            currentScale +
            (
                targetScale -
                currentScale
            ) * interpolation;


        mesh.scale.set(
            newScale,
            newScale,
            newScale
        );


        // -----------------------------------
        // Opacité
        // -----------------------------------

        if (mesh.material) {

            mesh.material.opacity +=
                (
                    targetOpacity -
                    mesh.material.opacity
                ) * interpolation;
        }

    });


    // =======================================
    // Rendu
    // =======================================

    return (

        <mesh
            ref={meshRef}

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
                PHOTO PLANE PARFAITEMENT PLAT
            ================================= */}

            <planeGeometry
                args={[
                    2.5,
                    3.5
                ]}
            />


            <meshBasicMaterial
                map={texture}

                transparent

                opacity={targetOpacity}

                side={THREE.DoubleSide}

                toneMapped={false}
            />

        </mesh>
    );
}


/* =========================================================
   COMPOSANT SCÈNE 3D

   Affiche toutes les photos sur le cercle.
========================================================= */

function GalleryScene({
    photos,
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

                    totalPhotos={
                        photos.length
                    }

                    onPhotoClick={
                        onPhotoClick
                    }

                    reducedMotion={
                        reducedMotion
                    }
                />

            ))}

        </>
    );
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
    // Rendu
    // =======================================

    return (

        <div className="gallery3d">


            <Canvas

                camera={{
                    position: [0, 0, 17],
                    fov: 60,
                    near: 0.2,
                    far: 500,
                }}

                dpr={[1, 2]}

                gl={{
                    antialias: true,
                    alpha: true
                }}

            >

                <ambientLight
                    intensity={0.5}
                />


                <pointLight
                    position={[
                        10,
                        10,
                        10
                    ]}
                />


                {/* =================================
                    CONTRÔLES
                ================================= */}

                <OrbitControls

                    enableZoom={true}

                    enablePan={false}

                    enableRotate={true}

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

                    onPhotoClick={
                        onPhotoClick
                    }

                    reducedMotion={
                        reducedMotion
                    }

                />

            </Canvas>


            {/* =================================================
               BOUTON PRÉCÉDENT
            ================================================= */}

            <button

                type="button"

                className="
                    gallery3d-button
                    gallery3d-prev
                "

                onClick={() => {

                    setCurrentIndex(
                        (
                            currentIndex -
                            1 +
                            photos.length
                        ) % photos.length
                    );

                }}

                aria-label="Photo précédente"

            >

                &#10094;

            </button>


            {/* =================================================
               BOUTON SUIVANT
            ================================================= */}

            <button

                type="button"

                className="
                    gallery3d-button
                    gallery3d-next
                "

                onClick={() => {

                    setCurrentIndex(
                        (
                            currentIndex +
                            1
                        ) % photos.length
                    );

                }}

                aria-label="Photo suivante"

            >

                &#10095;

            </button>


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