import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Card.scss';
import Carte from '@assets/icons/carte/carte.svg';

const Card = ({
    activeRegion,
    descriptionRef
}) => {
    return (
        <div className='card'>
            <section
                className={`description ${activeRegion ? 'is-active' : ''}`}
            >

                {/* =================================
                    Logo carte (si aucune région active)
                ================================= */}
                <div className="card_logo">
                    {!activeRegion && (
                        <img
                            src={Carte}
                            alt="Icône carte"
                        />
                    )}
                </div>

                {/* =================================
                    Contenu conditionnel
                ================================= */}
                {activeRegion ? (

                    <>
                        <section className='card_content'>

                            <h2 className='card_title'>
                                {activeRegion.title}
                            </h2>
                            <p className='card_description' ref={descriptionRef}>
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

                    <p>
                        Survolez un point sur la carte pour afficher sa description.
                    </p>

                )}

            </section>
        </div>
    );
};

Card.propTypes = {
    activeRegion: PropTypes.object,
    descriptionRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ])
};

export default Card;