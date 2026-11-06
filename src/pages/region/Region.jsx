import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useRef
} from "react";

import { useParams } from "react-router-dom";
import { BASE_PATH } from "@/config";
import { regions } from "../../data/regions";
import Gallery3D from "../../components/Gallery3D/Gallery3D";
import "./Region.scss";


function Region() {

    const { regionId } = useParams();
    const region = regions.find((r) => r.id === regionId);

    // Extraire `photos` ici, avant de l'utiliser dans les fonctions
    const { name, subtitle, quote, photos = [], background } = region || {};

    // Fond dédié si la région en déclare un, sinon fond général
    const backgroundImage = `url("${background
        ?? `${BASE_PATH}assets/backgroundImage/BACKGROUND.webp`
        }")`;


    // =======================================
    // Référence du conteneur principal
    // =======================================

    const regionRef = useRef(null);


    // =======================================
    // Hauteur de la navbar
    // =======================================

    useLayoutEffect(() => {

        const navbar = document.querySelector('.navbar-container');
        const container = regionRef.current;

        if (!container) return;

        const updateNavbarHeight = () => {

            const height = navbar
                ? navbar.getBoundingClientRect().height
                : 0;

            container.style.setProperty(
                '--navbar-height',
                `${height}px`
            );
        };

        // Première mesure
        updateNavbarHeight();

        // Observer les changements de hauteur de la navbar
        const resizeObserver = navbar
            ? new ResizeObserver(updateNavbarHeight)
            : null;

        if (resizeObserver && navbar) {
            resizeObserver.observe(navbar);
        }

        // Écoute des redimensionnements
        window.addEventListener(
            'resize',
            updateNavbarHeight
        );

        return () => {

            resizeObserver?.disconnect();

            window.removeEventListener(
                'resize',
                updateNavbarHeight
            );
        };

    }, []);


    // =======================================
    // État de la modale
    // =======================================

    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    // =======================================
    // Référence de l'overlay (élément passé
    // en plein écran) et état du plein écran
    // =======================================

    const overlayRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);


    // =======================================
    // Bascule plein écran / fenêtré
    // =======================================

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            overlayRef.current?.requestFullscreen();
        }
    };


    // =======================================
    // Suivi de l'état plein écran
    // =======================================

    useEffect(() => {

        const onFullscreenChange = () =>
            setIsFullscreen(Boolean(document.fullscreenElement));

        document.addEventListener(
            "fullscreenchange",
            onFullscreenChange
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                onFullscreenChange
            );
        };

    }, []);


    // Fonction pour ouvrir la modale avec une photo
    const openModal = (index) => {
        setSelectedPhotoIndex(index);
        setIsModalOpen(true);
    };


    // Fonction pour fermer la modale
    const closeModal = () => {
        setIsModalOpen(false);
    };


    // Fonction pour naviguer vers la photo précédente ou suivante

    const goToPrevPhoto = () => {
        setSelectedPhotoIndex((currentIndex) =>
            (currentIndex - 1 + photos.length) % photos.length
        );
    };

    const goToNextPhoto = () => {
        setSelectedPhotoIndex((currentIndex) =>
            (currentIndex + 1) % photos.length
        );
    };


    // Gestion des touches clavier
    useEffect(() => {

        const handleKeyDown = (e) => {

            if (!isModalOpen) return;

            if (e.key === "ArrowLeft") {
                goToPrevPhoto();

            } else if (e.key === "ArrowRight") {
                goToNextPhoto();

            } else if (e.key === "Escape") {
                closeModal();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, [isModalOpen, selectedPhotoIndex, photos.length]);


    if (!region) {
        return <div>Région introuvable : {regionId}</div>;
    }

    // =======================================
    // Navigation tactile : balayage horizontal
    // (mobile : remplace les flèches)
    // =======================================

    const touchStartRef = useRef(null);


    const handleTouchStart = (e) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    };


    const handleTouchEnd = (e) => {

        if (touchStartRef.current === null) return;

        const deltaX =
            e.changedTouches[0].clientX - touchStartRef.current.x;
        const deltaY =
            e.changedTouches[0].clientY - touchStartRef.current.y;

        touchStartRef.current = null;

        // Mouvement majoritairement vertical : ignoré
        if (Math.abs(deltaX) < Math.abs(deltaY)) return;

        // Balayage trop court : ignoré
        const SWIPE_THRESHOLD = 50;

        if (deltaX < -SWIPE_THRESHOLD) {
            goToNextPhoto();   // balayage vers la gauche : suivante
        } else if (deltaX > SWIPE_THRESHOLD) {
            goToPrevPhoto();   // balayage vers la droite : précédente
        }
    };

    return (

        <div
            ref={regionRef}
            className="region-container"
            style={{
                "--region-background-image": backgroundImage
            }}
        >

            <div className='region-container-description'>

                <h1>{name}</h1>
                <h2>{subtitle}</h2>

                {quote && (
                    <blockquote className="region-quote">

                        <p className="region-quote-text">
                            « {quote.text} »

                            <footer className="region-quote-footer">
                                — {quote.author}, {quote.source}
                            </footer>
                        </p>

                    </blockquote>
                )}

            </div>


            {/* Galerie de photos */}

            <div className="region-gallery-3d">

                <Gallery3D
                    photos={photos}
                    onPhotoClick={openModal}
                />

            </div>


            {/* Modale avec carrousel */}

            {
                isModalOpen && selectedPhotoIndex !== null && (

                    <div
                        ref={overlayRef}
                        className="modal-overlay"
                        onClick={closeModal}
                    >
                        {/* Bouton Précédent */}

                        <button
                            type="button"
                            className="modal-nav modal-prev"
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevPhoto();
                            }}
                            aria-label="Photo précédente"
                        >
                            &#10094;
                        </button>


                        <div
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >

                            {/* Image en plein écran */}

                            <img
                                key={photos[selectedPhotoIndex].id}
                                src={
                                    photos[selectedPhotoIndex].fullSrc ||
                                    photos[selectedPhotoIndex].previewSrc
                                }
                                alt={
                                    photos[selectedPhotoIndex].alt ||
                                    "Photo en plein écran"
                                }
                                className="modal-image"
                            />

                            {/* Bouton plein écran */}

                            <button
                                type="button"
                                className="btn-fullscreen"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFullscreen();
                                }}
                                aria-label={
                                    isFullscreen
                                        ? "Quitter le plein écran"
                                        : "Afficher en plein écran"
                                }
                            />

                            {/* Bouton de fermeture */}

                            <button
                                type="button"
                                className="modal-close"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeModal();
                                }}
                                aria-label="Fermer la visionneuse"
                            />

                            {/* compteur */}

                            <div className="modal-info">

                                <div
                                    className="modal-dots"
                                    role="group"
                                    aria-label="Position dans la galerie"
                                >
                                    {photos.map((photo, index) => (
                                        <button
                                            key={photo.id}
                                            type="button"
                                            className={
                                                index === selectedPhotoIndex
                                                    ? "modal-dash active"
                                                    : "modal-dash"
                                            }
                                            onClick={() => setSelectedPhotoIndex(index)}
                                            aria-label={`Afficher la photo ${index + 1}`}
                                            aria-current={
                                                index === selectedPhotoIndex ? "true" : undefined
                                            }
                                        />
                                    ))}
                                </div>

                            </div>

                        </div>


                        {/* Bouton Suivant */}

                        <button
                            type="button"
                            className="modal-nav modal-next"
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNextPhoto();
                            }}
                            aria-label="Photo suivante"
                        >
                            &#10095;
                        </button>
                    </div>
                )
            }

        </div>
    );
}

export default Region;