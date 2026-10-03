import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Card.scss';

import Carte from '@assets/icons/carte/carte.svg?react';


const Card = ({
    activeRegion,
    descriptionRef
}) => {

    return (
        <div className="card">

            <section
                className={`description ${activeRegion ? 'is-active' : ''}`}
            >

                {/* =================================
                    Contenu conditionnel
                ================================= */}

                {activeRegion ? (

                    <>

                        <section className="card_content">

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

                            <img
                                src={activeRegion.photo_home.previewSrc}
                                alt={activeRegion.photo_home.alt || ''}
                                className="card_photo"
                            />

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