import { NavLink, useLocation } from "react-router-dom";
import { useRef, useEffect, useState } from "react";

import "./Navbar.scss";

import CompassRose from "@assets/icons/rose-des-vents.png";


export default function Navbar() {

    // =======================================
    // Références
    // =======================================

    const navRef = useRef(null);
    const borderRef = useRef(null);


    // =======================================
    // États
    // =======================================

    const [activeLink, setActiveLink] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);


    // =======================================
    // Route actuelle
    // =======================================

    const location = useLocation();


    // =======================================
    // Déplacement de la bordure
    // =======================================

    const moveBorder = (
        element,
        withTransition = false
    ) => {

        if (
            !element ||
            !borderRef.current ||
            !navRef.current
        ) {
            return;
        }


        if (withTransition) {

            borderRef.current.style.transition =
                "left 0.35s ease, width 0.35s ease";

        } else {

            borderRef.current.style.transition =
                "none";
        }


        const navRect =
            navRef.current.getBoundingClientRect();

        const linkRect =
            element.getBoundingClientRect();


        borderRef.current.style.left =
            `${linkRect.left - navRect.left}px`;

        borderRef.current.style.width =
            `${linkRect.width}px`;
    };


    // =======================================
    // Mise à jour de la bordure active
    // =======================================

    useEffect(() => {

        const active =
            navRef.current?.querySelector("a.active");


        if (active) {

            setActiveLink(active);

            moveBorder(active, true);
        }


        // ===================================
        // Redimensionnement
        // ===================================

        const handleResize = () => {

            const currentActive =
                navRef.current?.querySelector("a.active");


            if (currentActive) {

                moveBorder(
                    currentActive,
                    false
                );
            }
        };


        window.addEventListener(
            "resize",
            handleResize
        );


        return () => {

            window.removeEventListener(
                "resize",
                handleResize
            );
        };

    }, [location.pathname]);


    // =======================================
    // Fermer le menu lorsque la route change
    // =======================================

    useEffect(() => {

        setMenuOpen(false);

    }, [location.pathname]);


    // =======================================
    // Fermer avec la touche Escape
    // =======================================

    useEffect(() => {

        const handleEscape = (event) => {

            if (
                event.key === "Escape" &&
                menuOpen
            ) {
                setMenuOpen(false);
            }
        };


        document.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };

    }, [menuOpen]);


    // =======================================
    // Rendu
    // =======================================

    return (

        <header className="navbar-container">


            {/* =================================
                Logo
            ================================= */}

            <NavLink
                to="/"
                className="incipit"
            >

                <div className="logo-container">

                    <img
                        src={CompassRose}
                        alt="Rose des vents"
                        className="logo"
                    />

                </div>


                <div className="logo-texte">

                    <h1>CHILI</h1>

                    <p>
                        Terres de contrastes
                    </p>

                </div>

            </NavLink>


            {/* =================================
                Bouton hamburger
            ================================= */}

            <button
                type="button"

                className={`hamburger ${menuOpen ? "is-open" : ""
                    }`}

                onClick={() =>
                    setMenuOpen((previous) => !previous)
                }

                aria-label={
                    menuOpen
                        ? "Fermer le menu"
                        : "Ouvrir le menu"
                }

                aria-expanded={menuOpen}
            >

                <span></span>
                <span></span>
                <span></span>

            </button>


            {/* =================================
                Navigation
            ================================= */}

            <nav
                className={`navbar ${menuOpen ? "is-open" : ""
                    }`}
                ref={navRef}
            >

                <ul className="navbar-links">

                    <li>
                        <NavLink
                            to="/"
                            end
                        >
                            ACCUEIL
                        </NavLink>
                    </li>


                    <li>
                        <NavLink
                            to="/galerie"
                        >
                            GALERIE
                        </NavLink>
                    </li>


                    <li>
                        <NavLink
                            to="/region/chiloe"
                        >
                            CHILOÉ
                        </NavLink>
                    </li>


                    <li>
                        <NavLink
                            to="/region/patagonie"
                        >
                            PATAGONIE
                        </NavLink>
                    </li>


                    <li>
                        <NavLink
                            to="/region/puertowilliams"
                        >
                            PUERTO WILLIAMS
                        </NavLink>
                    </li>


                    <li>
                        <NavLink
                            to="/region/torresdelpaine"
                        >
                            TORRES DEL PAINE
                        </NavLink>
                    </li>

                </ul>


                {/* =================================
                    Barre active
                ================================= */}

                <div
                    ref={borderRef}
                    className="navbar-border"
                />

            </nav>

        </header>
    );
}