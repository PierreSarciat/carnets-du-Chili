import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import { NavLink } from 'react-router-dom';

import './RegionLabel.scss';


export function RegionLabel({
    id,
    name,
    x,
    y,
    lineDirection = 'left',
    anchorPoint,
    lineColor = '#B89A73',
    onHover,
    onLeave,
}) {

    // =====================================================
    // Référence du label
    // =====================================================

    const labelRef = useRef(null);


    // =====================================================
    // Longueur calculée de la ligne
    // =====================================================

    const [lineLength, setLineLength] = useState(0);


    // =====================================================
    // Calcul de la distance entre :
    //
    // point fixe sur la carte
    // et bord gauche du label
    // =====================================================

    useEffect(() => {

        const label = labelRef.current;

        if (!label || !anchorPoint) {
            return;
        }


        const overlay =
            label.closest('.regions-overlay');

        if (!overlay) {
            return;
        }


        const updateLineLength = () => {

            const labelRect =
                label.getBoundingClientRect();

            const overlayRect =
                overlay.getBoundingClientRect();


            // Position du bord gauche du label
            // par rapport à l'overlay

            const labelLeft =
                labelRect.left -
                overlayRect.left;


            // Distance entre le point de la carte
            // et le bord gauche du label

            const distance =
                labelLeft - anchorPoint.x;


            setLineLength(
                Math.max(0, distance)
            );
        };


        // Première mesure
        updateLineLength();


        // Observer les changements de taille
        const resizeObserver =
            new ResizeObserver(() => {
                updateLineLength();
            });


        resizeObserver.observe(label);
        resizeObserver.observe(overlay);


        window.addEventListener(
            'resize',
            updateLineLength
        );


        return () => {

            resizeObserver.disconnect();

            window.removeEventListener(
                'resize',
                updateLineLength
            );
        };

    }, [anchorPoint]);


    // =====================================================
    // Rendu
    // =====================================================

    return (

        <div
            ref={labelRef}

            className="region-label-container"

            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
            }}

            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >

            {/* Ligne */}

            <div
                className={`region-line region-line--${lineDirection}`}

                style={{
                    '--line-length': `${lineLength}px`,
                    '--line-color': lineColor,
                }}
            />


            {/* Label */}

            <NavLink
                to={`/region/${id}`}
                className="region-label-link"
            >

                <span className="region-label">
                    {name}
                </span>

            </NavLink>

        </div>
    );
}