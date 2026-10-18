import { useEffect, useRef, useState } from 'react';
import './TypewriterTitle.scss';


export default function TypewriterTitle({
    text,
    startDelay = 2000,
    typingSpeed = 120,
    skip = false,
    onComplete,
}) {

    // =======================================
    // États
    // =======================================

    const [displayedText, setDisplayedText] =
        useState(skip ? text : '');

    const [isComplete, setIsComplete] =
        useState(skip);

    const [isTyping, setIsTyping] =
        useState(!skip);



    // =======================================
    // Références
    // =======================================

    // Garde contre le double appel
    // de onComplete en StrictMode
    const completeRef = useRef(skip);



    // =======================================
    // Frappe
    // =======================================

    useEffect(() => {

        // Annulation : texte complet,
        // achèvement immédiat

        if (skip) {

            setDisplayedText(text);
            setIsComplete(true);
            setIsTyping(false);

            if (!completeRef.current) {
                completeRef.current = true;
                onComplete?.();
            }

            return;
        }


        // Frappe normale
        completeRef.current = false;

        setDisplayedText('');
        setIsComplete(false);
        setIsTyping(true);


        let index = 0;
        let interval = null;
        let timeout = null;


        const startTyping = () => {

            interval = setInterval(() => {

                index++;

                setDisplayedText(
                    text.slice(0, index)
                );

                if (index >= text.length) {

                    clearInterval(interval);
                    setIsTyping(false);
                    setIsComplete(true);

                    if (!completeRef.current) {
                        completeRef.current = true;
                        onComplete?.();
                    }
                }

            }, typingSpeed);
        };


        timeout = setTimeout(
            startTyping,
            startDelay
        );


        return () => {

            clearTimeout(timeout);
            clearInterval(interval);
        };

    }, [skip, text]);



    // =======================================
    // Rendu
    // =======================================

    return (

        // Conservez ici votre balisage
        // et vos classes existants

        <h1 className="typewriter">

            <span className="typewriter__visible">
                {displayedText}
            </span>

            {isTyping && (
                <span
                    className="caret"
                    aria-hidden="true"
                />
            )}

        </h1>
    );
}