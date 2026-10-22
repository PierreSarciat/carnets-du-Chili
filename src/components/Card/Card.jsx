import React, { useLayoutEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Card.scss';

import Carte from '@assets/icons/carte/carte.svg?react';


const Card = ({
    activeRegion,
    descriptionRef,
    className = '',
}) => {

    // Photo précédente, conservée le temps de l'animation de sortie
    const [outgoingPhoto, setOutgoingPhoto] = useState(null);

    // Source de la photo affichée lors du rendu précédent
    const previousPhotoRef = useRef(null);

    useLayoutEffect(() => {

        const previousSrc = previousPhotoRef.current;
        const currentSrc = activeRegion?.photo_home?.previewSrc ?? null;

        // Si la photo change, l'ancienne devient la photo sortante
        if (previousSrc && previousSrc !== currentSrc) {
            setOutgoingPhoto(previousSrc);
        }

        previousPhotoRef.current = currentSrc;

    }, [activeRegion]);

    // Retrait de la photo sortante une fois son animation terminée
    const handleOutgoingEnd = () => setOutgoingPhoto(null);


    return (
        <div
            id="region-card"
            className={`card ${className}`}
        >

            <section
                className={`description ${activeRegion ? 'is-active' : ''}`}
            >

                {/* =================================
                    Contenu conditionnel
                ================================= */}

                {activeRegion ? (

                    <>

                        <section
                            className="card_content"
                            key={activeRegion?.id}
                        >

                            <h2 className="card_title">
                                {activeRegion.title}
                            </h2>

                            <p
                                className="card_description"
                                ref={descriptionRef}
                            >
                                {activeRegion.description}
                            </p>

                            <NavLink
                                to={`/region/${activeRegion.id}`}
                                className="card_link"
                            >
                                <h3>
                                    Explorer la région
                                </h3>
                            </NavLink>

                        </section>


                        {activeRegion?.photo_home?.previewSrc && (

                            <div className="card_photo_stack">

                                {/* Photo sortante : animée puis retirée */}

                                {outgoingPhoto && (

                                    <img
                                        className="card_photo card_photo--outgoing"
                                        src={outgoingPhoto}
                                        alt=""
                                        aria-hidden="true"
                                        onAnimationEnd={handleOutgoingEnd}
                                    />

                                )}

                                {/* Photo entrante : remontée à chaque changement */}

                                <img
                                    key={activeRegion.photo_home.previewSrc}
                                    className="card_photo card_photo--incoming"
                                    src={activeRegion.photo_home.previewSrc}
                                    alt={activeRegion.photo_home.alt || ''}
                                />

                            </div>

                        )}

                    </>

                ) : (

                    <>

                        {/* =================================
                            Logo carte (si aucune région active)
                        ================================= */}

                        <div className="card_logo">

                            <Carte
                                className="card_logo__icon"
                                aria-label="Icône carte"
                            />

                        </div>

                    </>

                )}

            </section>

        </div>
    );
};


Card.propTypes = {

    activeRegion: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,

        photo_home: PropTypes.shape({
            previewSrc: PropTypes.string,
            alt: PropTypes.string
        })
    }),

    descriptionRef: PropTypes.shape({
        current: PropTypes.any
    })

};


export default Card;