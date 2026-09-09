import React from 'react';
import './InteractiveMap.scss';
import { RegionLabel } from '@components/RegionLabel/RegionLabel';
import chileMap from '@assets/images/chile-map/chile-map.svg';
import roseDesVents from '@assets/images/rose-des-vents/rose-des-vents.png';
import { BASE_PATH } from "@/config";

export function InteractiveMap({ onRegionHover }) {
    const regions = [
        {
            id: 'chiloe',
            name: 'Chiloé',
            x: 69,
            y: 65,
            lineLength: 135,
            title: "Chiloé",
            description: "Ancré au sud-ouest du Chili, dans les îles éparses du Pacifique, Chiloé est un monde à part. Ici, les fjords serpentent entre des collines verdoyantes. L’archipel, bercé par l’isolement et le mystère, préserve une culture unique, où les églises en bois coloré, les maisons sur pilotis et les récits du *Caleuche* tissent une toile envoûtante entre réalité et rêve.",
            photo_home:
            {
                "previewSrc": `${BASE_PATH}assets/images/chiloe/thumb/CHILOE_6.webp`,
                "alt": "CHILOE  6 "
            },
        },
        {
            id: 'patagonie',
            name: 'Patagonie',
            title: "Patagonie",
            description: "Le grand soufle du Sud: véritable continent rude et sauvage, jalonné de parcs nationaux, sa côte n' est qu'un dédale d' îles, de lagunes et de fjords. ",
            photo_home:
            {
                "previewSrc": "${BASE_PATH}/assets/images/patagonie/thumb/PATAGONIE 35.webp",
                "alt": "CHILOE  6 "
            },
            x: 72,
            y: 75,
            lineLength: 120,
        },
        {
            id: 'puertowilliams',
            name: 'Puerto Williams',
            title: "Puerto Williams",
            photo_home:
            {
                "previewSrc": "/assets/images/puertowilliams/thumb/PUERTO WILLIAMS 8.webp",
                "alt": "CHILOE  6 "
            },
            description: "Ville la plus australe du globe, Puerto Williams sert de point de départ pour explorer les paysages extrêmes de l’Antarctique et du cap Horn, dans une ambiance unique alliant isolement, culture maritime et panoramas à couper le souffle.",
            x: 77,
            y: 96,
            lineLength: 60,
        },
        {
            id: 'torresdelpaine',
            name: 'Torres del Paine',
            title: "TORRES DEL PAINE",
            description: "Célèbre pour ses tours de granit impressionnantes, ce parc national, classé au patrimoine mondial de l'UNESCO, recèle des glaciers grandioses, des rivières d'un bleu étincelant et une faune sauvage exceptionnelle.",
            photo_home:
            {
                "previewSrc": "/assets/images/torresdelpaine/thumb/TORRES DEL PAINE 2.webp",
                "alt": "CHILOE  6 "
            },
            x: 77,
            y: 86,
            lineLength: 117,
        },
    ];

    return (
        <div className="interactive-map-container">
            <div className="interactive-map-outer-border">
                <div className="interactive-map-inner-border">
                    <img
                        src={roseDesVents}
                        alt="Rose des vents"
                        className="rose-des-vents"
                    />

                    <img
                        src={chileMap}
                        alt="Carte du Chili"
                        className="chile-map-image"
                    />

                    <div className="regions-overlay">
                        {regions.map((region) => (
                            <RegionLabel
                                key={region.id}
                                id={region.id}
                                name={region.name}
                                x={region.x}
                                y={region.y}
                                lineLength={region.lineLength}
                                lineColor="#B89A73"
                                onHover={() => onRegionHover(region)}

                            />
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}