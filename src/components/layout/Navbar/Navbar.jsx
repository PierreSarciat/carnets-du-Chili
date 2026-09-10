import { NavLink, useLocation } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import "./Navbar.scss";
import CompassRose from "@assets/icons/rose-des-vents.png";

export default function Navbar() {
    const navRef = useRef(null);
    const borderRef = useRef(null);
    const [activeLink, setActiveLink] = useState(null);
    const location = useLocation();

    // Fonction pour déplacer la bordure sous le lien actif
    const moveBorder = (element, withTransition = false) => {
        if (!element || !borderRef.current || !navRef.current) return;

        // Applique ou retire la transition
        if (withTransition) {
            borderRef.current.style.transition = "left 0.35s ease, width 0.35s ease";
        } else {
            borderRef.current.style.transition = "none";
        }

        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = element.getBoundingClientRect();

        borderRef.current.style.left = `${linkRect.left - navRect.left}px`;
        borderRef.current.style.width = `${linkRect.width}px`;
    };

    // Met à jour la bordure lors du changement de route ou de redimensionnement
    useEffect(() => {
        const activeLink = navRef.current?.querySelector("a.active");
        if (activeLink) {
            setActiveLink(activeLink);
            moveBorder(activeLink, true); // Active la transition pour les changements de lien
        }

        // Écouteur pour le redimensionnement
        const handleResize = () => {
            if (activeLink) {
                moveBorder(activeLink, false); // Désactive la transition pour le redimensionnement
            }
        };

        window.addEventListener("resize", handleResize);

        // Nettoyage : retire l'écouteur lors du démontage
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [location.pathname, activeLink]);

    return (
        <header className="navbar-container">
            <NavLink to="/" className="incipit">
                <div className="logo-container">
                    <img
                        src={CompassRose}
                        alt="Rose des vents"
                        className="logo"
                    />
                </div>
                <div className="logo-texte">
                    <h1>CHILI</h1>
                    <p>Terres de contrastes</p>
                </div>
            </NavLink>

            <nav className="navbar" ref={navRef}>
                <ul className="navbar-links">
                    <li>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            ACCUEIL
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/galerie"
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            GALERIE
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/region/chiloe"
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            CHILOÉ
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/region/patagonie"
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            PATAGONIE
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/region/puertowilliams"
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            PUERTO WILLIAMS
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/region/torresdelpaine"
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            TORRES DEL PAINE
                        </NavLink>
                    </li>
                </ul>
                <div ref={borderRef} className="navbar-border" />
            </nav>
        </header>
    );
}