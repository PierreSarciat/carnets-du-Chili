import React, { useEffect, useRef, useState } from 'react';
import './InteractiveMap.scss';

import { RegionLabel } from '@components/RegionLabel/RegionLabel';

import chileMap from '@assets/images/chile-map/chile-map.svg';
import roseDesVents from '@assets/images/rose-des-vents/rose-des-vents.png';

import { BASE_PATH } from '@/config';


export function InteractiveMap({ onRegionHover }) {

    // =====================================================
    // Références
    // =====================================================

    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const overlayRef = useRef(null);


    // =====================================================
    // Position réelle des points d'ancrage
    //
    // Exemple :
    // {
    //     chiloe: {
    //         x: 135,
    //         y: 380
    //     }
    // }
    // =====================================================

    const [anchorPositions, setAnchorPositions] = useState({});


    // =====================================================
    // Données des régions
    // =====================================================

    const regions = [

        {
            id: 'chiloe',
            name: 'Chiloé',

            // Position du label
            x: 69,
            y: 65,

            // Point fixe sur l'image
            // à exprimer en % de l'image
            anchorX: 36,
            anchorY: 65,

            title: 'Chiloé',

            description:
                "Ancré au sud-ouest du Chili, dans les îles éparses du Pacifique, Chiloé est un monde à part. Ici, les fjords serpentent entre des collines verdoyantes. L’archipel, bercé par l’isolement et le mystère, préserve une culture unique, où les églises en bois coloré, les maisons sur pilotis et les récits du *Caleuche* tissent une toile envoûtante entre réalité et rêve.",

            photo_home: {
                previewSrc:
                    `${BASE_PATH}assets/images/chiloe/thumb/CHILOE_6.webp`,
                alt: 'CHILOÉ',
            },
        },


        {
            id: 'patagonie',
            name: 'Patagonie',

            // Position du label
            x: 72,
            y: 75,

            // Point fixe sur l'image
            anchorX: 40,
            anchorY: 10,

            title: 'Patagonie',

            description:
                "Le grand souffle du Sud : véritable continent rude et sauvage, jalonné de parcs nationaux, sa côte n'est qu'un dédale d'îles, de lagunes et de fjords.",

            photo_home: {
                previewSrc:
                    `${BASE_PATH}assets/images/patagonie/thumb/PATAGONIE 35.webp`,
                alt: 'Patagonie',
            },
        },


        {
            id: 'puertowilliams',
            name: 'Puerto Williams',

            // Position du label
            x: 77,
            y: 96,

            // Point fixe sur l'image
            anchorX: 60,
            anchorY: 96,

            title: 'Puerto Williams',

            description:
                "Ville la plus australe du globe, Puerto Williams sert de point de départ pour explorer les paysages extrêmes de l’Antarctique et du cap Horn, dans une ambiance unique alliant isolement, culture maritime et panoramas à couper le souffle.",

            photo_home: {
                previewSrc:
                    `${BASE_PATH}assets/images/puertowilliams/thumb/PUERTO WILLIAMS 8.webp`,
                alt: 'Puerto Williams',
            },
        },


        {
            id: 'torresdelpaine',
            name: 'Torres del Paine',

            // Position du label
            x: 77,
            y: 86,

            // Point fixe sur l'image
            anchorX: 42,
            anchorY: 200,

            title: 'TORRES DEL PAINE',

            description:
                "Célèbre pour ses tours de granit impressionnantes, ce parc national, classé au patrimoine mondial de l'UNESCO, recèle des glaciers grandioses, des rivières d'un bleu étincelant et une faune sauvage exceptionnelle.",

            photo_home: {
                previewSrc:
                    `${BASE_PATH}assets/images/torresdelpaine/thumb/TORRES DEL PAINE 2.webp`,
                alt: 'TORRES DEL PAINE',
            },
        },
    ];


    // =====================================================
    // Calcul des positions réelles des points
    // =====================================================

    useEffect(() => {

        const image = imageRef.current;
        const overlay = overlayRef.current;

        if (!image || !overlay) return;


        const updateAnchorPositions = () => {

            const imageRect = image.getBoundingClientRect();
            const overlayRect = overlay.getBoundingClientRect();

            const newPositions = {};


            regions.forEach((region) => {

                // Position X du point dans l'image
                const anchorX =
                    (imageRect.left - overlayRect.left) +
                    (imageRect.width * region.anchorX / 100);

                // Position Y du point dans l'image
                const anchorY =
                    (imageRect.top - overlayRect.top) +
                    (imageRect.height * region.anchorY / 100);


                newPositions[region.id] = {
                    x: anchorX,
                    y: anchorY,
                };
            });


            setAnchorPositions(newPositions);
        };


        // Première mesure
        updateAnchorPositions();


        // Observer les changements de taille
        const resizeObserver = new ResizeObserver(() => {
            updateAnchorPositions();
        });


        resizeObserver.observe(image);
        resizeObserver.observe(overlay);


        // Mise à jour lorsque l'image est chargée
        image.addEventListener('load', updateAnchorPositions);


        return () => {

            resizeObserver.disconnect();

            image.removeEventListener(
                'load',
                updateAnchorPositions
            );
        };

    }, []);


    // =====================================================
    // Rendu
    // =====================================================

    return (

        <div
            className="interactive-map-container"
            ref={containerRef}
        >

            <div className="interactive-map-outer-border">

                <div className="interactive-map-inner-border">

                    {/* Rose des vents */}

                    <img
                        src={roseDesVents}
                        alt="Rose des vents"
                        className="rose-des-vents"
                    />


                    {/* Carte */}

                    <img
                        ref={imageRef}
                        src={chileMap}
                        alt="Carte du Chili"
                        className="chile-map-image"
                    />


                    {/* Overlay */}

                    <div
                        className="regions-overlay"
                        ref={overlayRef}
                    >

                        {regions.map((region) => {

                            const anchorPoint =
                                anchorPositions[region.id];


                            return (

                                <RegionLabel
                                    key={region.id}

                                    id={region.id}
                                    name={region.name}

                                    x={region.x}
                                    y={region.y}

                                    anchorPoint={anchorPoint}

                                    lineColor="#B89A73"

                                    onHover={() =>
                                        onRegionHover(region)
                                    }

                                    onLeave={() =>
                                        onRegionHover(null)
                                    }
                                />
                            );
                        })}

                    </div>

                </div>

            </div>

        </div>
    );
}