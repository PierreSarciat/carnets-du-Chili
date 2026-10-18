import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import BorderWithDot from '@components/BorderWithDot/BorderWithDot';
import Card from '@components/Card/Card';
import TypewriterTitle from "@/components/Animation/TypewriterTitle";
import './Home.scss';


function Home() {

    // =======================================
    // États
    // =======================================

    const [activeRegion, setActiveRegion] = useState(null);

    const [titleDone, setTitleDone] = useState(false);



    // =======================================
    // Références
    // =======================================

    const homeRef = useRef(null);

    const descriptionRef = useRef(null);


    // =======================================
    // Hauteur de la navbar
    // =======================================

    useEffect(() => {

        const navbar =
            document.querySelector('.navbar-container');

        if (!navbar || !homeRef.current) {
            return;
        }


        const updateNavbarHeight = () => {

            const height =
                navbar.getBoundingClientRect().height;

            homeRef.current.style.setProperty(
                '--navbar-height',
                `${height}px`
            );
        };


        // Première mesure
        updateNavbarHeight();


        // Observer les changements de hauteur
        const resizeObserver =
            new ResizeObserver(
                updateNavbarHeight
            );

        resizeObserver.observe(navbar);


        window.addEventListener(
            'resize',
            updateNavbarHeight
        );


        return () => {

            resizeObserver.disconnect();

            window.removeEventListener(
                'resize',
                updateNavbarHeight
            );
        };

    }, []);




    return (

        <div
            ref={homeRef}
            className="global"
        >

            <div className="intro">

                {/* =================================
                    Présentation
                ================================= */}

                <section className="presentation">

                    <TypewriterTitle
                        text="CARNETS DU CHILI"
                        onComplete={() => setTitleDone(true)}
                    />

                    <BorderWithDot
                        variant="title"
                        className={titleDone ? 'is-visible' : ''}
                    />

                    <p>
                        Sur plus de 4 300 kilomètres, le Chili déploie une symphonie de paysages à couper le souffle : déserts arides, fjords mystérieux, volcans majestueux et steppes infinies du Sud.
                    </p>

                    <p>
                        Du désert d'Atacama, l'un des plus secs au monde, à la Terre de Feu, en passant par la cordillère des Andes et l'île enchantée de Chiloé, ce pays austral incarne l'eau, le feu et la glace dans une harmonie parfaite.
                    </p>

                    <p>
                        Sa géographie, d'une singularité envoûtante, semble tout droit sortie de l'imagination d'un artiste qui aurait cédé aux élans les plus fous de sa créativité.
                    </p>

                    <BorderWithDot className="animation-fade-blur-in" variant="home" />

                </section>


                {/* =================================
                    Description
                ================================= */}

                <Card className="animation-fade-blur-in"
                    activeRegion={activeRegion}
                    descriptionRef={descriptionRef}
                />

            </div>


            {/* =================================
                Carte
            ================================= */}

            <section className="map-section animation-fade-blur-in">

                <InteractiveMap
                    onRegionHover={setActiveRegion}
                />

            </section>

        </div>
    );
}


export default Home;