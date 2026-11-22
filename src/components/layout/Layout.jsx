import { useLayoutEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import ScrollToTop from "@/components/ScrollToTop";

export default function Layout() {

    const layoutRef = useRef(null);

    // Hauteur de la navbar
    // =======================================

    useLayoutEffect(() => {

        const container = layoutRef.current;

        if (!container) return;

        let observedNavbar = null;
        let resizeObserver = null;


        // Mise à jour de la hauteur
        // ===================================

        const updateNavbarHeight = () => {

            if (!observedNavbar?.isConnected) {

                container.style.setProperty(
                    "--navbar-height",
                    "0px"
                );

                return;
            }

            const height =
                observedNavbar.getBoundingClientRect().height;

            container.style.setProperty(
                "--navbar-height",
                `${height}px`
            );
        };


        // Synchronisation de la navbar
        // ===================================

        const syncNavbar = () => {

            const navbar = document.querySelector(
                ".navbar-container"
            );

            if (navbar === observedNavbar) return;

            resizeObserver?.disconnect();

            observedNavbar = navbar;

            if (!navbar) {

                updateNavbarHeight();

                return;
            }

            resizeObserver = new ResizeObserver(
                updateNavbarHeight
            );

            resizeObserver.observe(navbar);

            updateNavbarHeight();
        };


        // Initialisation
        // ===================================

        syncNavbar();



        // ===================================

        const mutationObserver = new MutationObserver(
            syncNavbar
        );

        mutationObserver.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );



        // Redimensionnement de la fenêtre
        // ===================================

        window.addEventListener(
            "resize",
            updateNavbarHeight
        );



        // Nettoyage
        // ===================================

        return () => {

            mutationObserver.disconnect();

            resizeObserver?.disconnect();

            window.removeEventListener(
                "resize",
                updateNavbarHeight
            );
        };

    }, []);


    return (

        <div
            ref={layoutRef}
            className="layout"
        >
            <ScrollToTop />
            <Navbar />

            <main>
                <Outlet />
            </main>

            <Footer />

        </div>
    );
}