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
    onClick,
}) {

    // =======================================
    // Référence du label
    // =======================================

    const labelRef = useRef(null);


    // =======================================
    // Longueur de la ligne
    // =======================================

    const [lineLength, setLineLength] = useState(0);


    // =======================================
    // Calcul de la ligne
    // =======================================

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

            const labelLeft =
                labelRect.left -
                overlayRect.left;


            // Distance entre le point fixe
            // et le label

            const distance =
                labelLeft - anchorPoint.x;


            setLineLength(
                Math.max(0, distance)
            );
        };


        updateLineLength();


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


    return (

        <div
            ref={labelRef}

            className="region-label-container"

            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform:
                    'translate(-50%, -50%)',
            }}

            // Desktop
            onMouseEnter={onHover}
            onMouseLeave={onLeave}

            // Mobile
            onClick={onClick}
        >

            {/* =================================
                Ligne
            ================================= */}

            <div
                className={`region-line region-line--${lineDirection}`}

                style={{
                    '--line-length':
                        `${lineLength}px`,

                    '--line-color':
                        lineColor,
                }}
            />


            {/* =================================
                Label
            ================================= */}

            <NavLink
                to={`/region/${id}`}
                className="region-label-link"

                onClick={onClick}
            >

                <span className="region-label">
                    {name}
                </span>

            </NavLink>

        </div>
    );
}