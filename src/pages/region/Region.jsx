import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { regions } from "../../data/regions";
import Gallery3D from "../../components/Gallery3D/Gallery3D";
import "./Region.scss";

function Region() {
    const { regionId } = useParams();
    const region = regions.find((r) => r.id === regionId);

    // Extraire `photos` ici, avant de l'utiliser dans les fonctions
    const { name, subtitle, quote, photos = [] } = region || {};

    // État pour gérer la modale et la photo sélectionnée
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fonction pour ouvrir la modale avec une photo
    const openModal = (index) => {
        setSelectedPhotoIndex(index);
        setIsModalOpen(true);
    };

    // Fonction pour fermer la modale
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Fonction pour naviguer vers la photo précédente
    const goToPrevPhoto = () => {
        if (selectedPhotoIndex > 0) {
            setSelectedPhotoIndex(selectedPhotoIndex - 1);
        }
    };

    // Fonction pour naviguer vers la photo suivante
    const goToNextPhoto = () => {
        if (selectedPhotoIndex < photos.length - 1) {
            setSelectedPhotoIndex(selectedPhotoIndex + 1);
        }
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

    return (
        <div className="region-container">
            <div className='region-container-description'>
                <h1>{name}</h1>
                <h2>{subtitle}</h2>

                {quote && (
                    <blockquote className="region-quote">
                        <p className="region-quote-text">« {quote.text} »
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
                    <div className="modal-overlay" onClick={closeModal}>
                        <div
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Bouton de fermeture */}
                            <button className="modal-close" onClick={closeModal}>
                                &times;
                            </button>

                            {/* Bouton Précédent */}
                            <button
                                className="modal-nav modal-prev"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPrevPhoto();
                                }}
                                disabled={selectedPhotoIndex === 0}
                            >
                                &#10094;
                            </button>
                            <p>{photos[selectedPhotoIndex].fullSrc}</p>
                            {/* Image en plein écran */}
                            <img
                                src={photos[selectedPhotoIndex].fullSrc || photos[selectedPhotoIndex].previewSrc}
                                alt={photos[selectedPhotoIndex].alt || "Photo en plein écran"}
                                className="modal-image"
                            />

                            {/* Bouton Suivant */}
                            <button
                                className="modal-nav modal-next"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNextPhoto();
                                }}
                                disabled={selectedPhotoIndex === photos.length - 1}
                            >
                                &#10095;
                            </button>

                            {/* Informations de la photo */}
                            <div className="modal-info">
                                <h3>{photos[selectedPhotoIndex].title}</h3>
                                <p>{photos[selectedPhotoIndex].description}</p>
                                {photos[selectedPhotoIndex].technicalNotes && (
                                    <p className="technical-notes">
                                        {photos[selectedPhotoIndex].technicalNotes}
                                    </p>
                                )}
                                <p>
                                    {selectedPhotoIndex + 1} / {photos.length}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default Region;