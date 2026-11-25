import { NavLink, useLocation } from "react-router-dom";
import { useRef, useEffect, useLayoutEffect, useState } from "react";

import "./Navbar.scss";
import CompassRose from "@assets/icons/rose-des-vents.png";


export default function Navbar() {

    // =======================================
    // Route actuelle
    // =======================================

    const location = useLocation();


    // =======================================
    // États
    // =======================================

    const [activeLink, setActiveLink] = useState(null);

    const [menuOpen, setMenuOpen] = useState(false);

    const [navbarMounted, setNavbarMounted] = useState(() =>
        location.pathname !== "/" ||
        window.matchMedia("(max-width: 1050px)").matches
    );

    // =======================================
    // Animation d'apparition : uniquement à la
    // première arrivée sur l'accueil de la session
    // =======================================

    const [playReveal, setPlayReveal] = useState(() =>
        location.pathname === "/" &&
        sessionStorage.getItem("skip-home-intro") !== "true"
    );

    // =======================================
    // Classe d'apparition conditionnelle
    // =======================================

    const animationClass =
        playReveal && location.pathname === "/"
            ? "animation-fade-blur-in"
            : "";


    // =======================================
    // Préchargement de la rose des vents
    // =======================================

    useEffect(() => {

        const image = new Image();

        image.src = CompassRose;

    }, []);


    // =======================================
    // Annulation de l'animation d'accueil
    // =======================================

    const cancelHomeIntro = () => {

        // Cas navigation depuis une autre page
        sessionStorage.setItem(
            "skip-home-intro",
            "true"
        );

        // Cas clic déjà sur l'accueil
        window.dispatchEvent(
            new CustomEvent("home:cancel-intro")
        );
    };


    // =======================================
    // Références
    // =======================================

    const navRef = useRef(null);

    const borderRef = useRef(null);

    const borderInitializedRef = useRef(false);


    // =======================================
    // Montage différé de la Navbar
    // Accueil desktop uniquement
    // =======================================

    useEffect(() => {

        const MOBILE_BREAKPOINT = "(max-width: 1050px)";

        const mediaQuery = window.matchMedia(
            MOBILE_BREAKPOINT
        );

        const DELAY = 15;

        let timer = null;


        // ===================================
        // Montage immédiat si nécessaire
        // ===================================

        if (!navbarMounted) {

            // Page régionale ou autre route
            if (location.pathname !== "/") {

                setNavbarMounted(true);

            }

            // Format mobile
            else if (mediaQuery.matches) {

                setNavbarMounted(true);
            }

            // ===================================
            // Accueil desktop : délai de 15 secondes
            // ===================================

            else {

                timer = window.setTimeout(() => {

                    setNavbarMounted(true);

                }, DELAY * 1000);
            }
        }


        // =======================================
        // Passage desktop → mobile
        // =======================================

        const handleBreakpointChange = (event) => {

            if (event.matches) {

                if (timer !== null) {

                    window.clearTimeout(timer);
                }

                setNavbarMounted(true);
            }
        };


        mediaQuery.addEventListener(
            "change",
            handleBreakpointChange
        );


        // =======================================
        // Nettoyage
        // =======================================

        return () => {

            if (timer !== null) {

                window.clearTimeout(timer);
            }

            mediaQuery.removeEventListener(
                "change",
                handleBreakpointChange
            );
        };

    }, [location.pathname, navbarMounted]);


    // =======================================
    // Mise à jour de l'animation selon la route
    // Joue uniquement à la première arrivée sur
    // l'accueil de la session (drapeau absent)
    // =======================================

    useEffect(() => {

        setPlayReveal(
            location.pathname === "/" &&
            sessionStorage.getItem("skip-home-intro") !== "true"
        );

    }, [location.pathname]);


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

    useLayoutEffect(() => {

        // Attendre que la navbar soit montée
        if (!navbarMounted) return;


        // ===================================
        // Position initiale de la bordure
        // ===================================

        const active =
            navRef.current?.querySelector("a.active");


        if (active) {

            setActiveLink(active);

            // Première position sans transition :
            // la bordure apparaît directement sous le lien actif.
            // Les changements de route suivants restent animés.
            moveBorder(
                active,
                borderInitializedRef.current
            );

            borderInitializedRef.current = true;
        }


        // ===================================
        // Recalcul après chargement des polices
        // ===================================

        let cancelled = false;

        document.fonts.ready.then(() => {

            if (cancelled) return;

            const currentActive =
                navRef.current?.querySelector("a.active");

            if (currentActive) {
                moveBorder(currentActive, false);
            }

        });


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

            cancelled = true;

            window.removeEventListener(
                "resize",
                handleResize
            );
        };

    }, [location.pathname, navbarMounted]);


    // =======================================
    // Fermer le menu lorsque la route change
    // =======================================

    useEffect(() => {

        setMenuOpen(false);

    }, [location.pathname, navbarMounted]);


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
    // Aucun montage avant le déclenchement
    // =======================================

    if (!navbarMounted) {

        return null;
    }


    // =======================================
    // Rendu
    // =======================================

    return (

        <header className={`navbar-container ${animationClass}`}>


            {/* =================================
                Logo
            ================================= */}

            <NavLink
                to="/"
                className={`incipit ${animationClass}`}
                onClick={cancelHomeIntro}
            >

                <div className="logo-container">

                    <img
                        src={CompassRose}
                        alt="rose des vents"
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
                className={`hamburger ${animationClass} ${menuOpen ? "is-open" : ""}`}

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
                            onClick={cancelHomeIntro}
                        >
                            ACCUEIL
                        </NavLink>
                    </li>


                    <li>
                        <NavLink to="/galerie">
                            GALERIE
                        </NavLink>
                    </li>


                    <li>
                        <NavLink to="/region/santiago">
                            SANTIAGO DE CHILE
                        </NavLink>
                    </li>


                    <li>
                        <NavLink to="/region/chiloe">
                            CHILOÉ
                        </NavLink>
                    </li>


                    <li>
                        <NavLink to="/region/patagonie">
                            PATAGONIE
                        </NavLink>
                    </li>


                    <li>
                        <NavLink to="/region/puertowilliams">
                            PUERTO WILLIAMS
                        </NavLink>
                    </li>


                    <li>
                        <NavLink to="/region/puntarenas">
                            PUNTA ARENAS
                        </NavLink>
                    </li>


                    <li>
                        <NavLink to="/region/torresdelpaine">
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