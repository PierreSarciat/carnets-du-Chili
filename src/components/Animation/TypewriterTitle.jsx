import { useEffect, useRef, useState } from "react";
import "./TypewriterTitle.scss";

export default function TypewriterTitle({
    text,
    speed = 120,
    startDelay = 2000,
    onComplete,
}) {
    const [count, setCount] = useState(0);

    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    // =======================================
    // Écriture avec vitesse variable
    // =======================================

    useEffect(() => {
        let timeoutId = null;
        let cancelled = false;
        let currentCount = 0;

        setCount(0);

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        // Respecte la préférence de réduction des animations
        if (prefersReducedMotion) {
            setCount(text.length);
            return;
        }

        // Calcule un délai variable selon le caractère
        const getRandomDelay = (character) => {
            const variation = 0.4 + Math.random() * 1.8;

            return Math.round(speed * variation);
        };

        // Écrit les caractères successivement
        const typeNextCharacter = () => {
            if (cancelled || currentCount >= text.length) {
                return;
            }

            const character = text[currentCount];
            const delay = getRandomDelay(character);

            timeoutId = window.setTimeout(() => {
                if (cancelled) return;

                currentCount += 1;
                setCount(currentCount);

                typeNextCharacter();
            }, delay);
        };

        // Délai avant le début de l'écriture
        timeoutId = window.setTimeout(() => {
            if (cancelled || text.length === 0) return;

            currentCount = 1;
            setCount(1);

            typeNextCharacter();
        }, startDelay);

        return () => {
            cancelled = true;

            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [text, speed, startDelay]);

    // =======================================
    // Signale la fin de la frappe
    // =======================================

    useEffect(() => {
        if (count === text.length && text.length > 0) {
            onCompleteRef.current?.();
        }
    }, [count, text]);

    const isTyping = count < text.length;

    // =======================================
    // Rendu
    // =======================================

    return (
        <h1 className="typewriter" aria-label={text}>
            <span
                className="typewriter__visible"
                aria-hidden="true"
            >
                {text.slice(0, count)}

                {isTyping && (
                    <span
                        className="caret"
                        aria-hidden="true"
                    />
                )}
            </span>
        </h1>
    );
}