import { useEffect, useState } from "react";
import './TypewriterTitle.scss';

export default function TypewriterTitle({
    text,
    speed = 120,
    startDelay = 2000,
}) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) {
            setCount(text.length);
            return;
        }

        let interval = null;
        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                setCount((c) => {
                    if (c >= text.length) {
                        clearInterval(interval);
                        return c;
                    }
                    return c + 1;
                });
            }, speed);
        }, startDelay);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [text, speed, startDelay]);

    const isTyping = count < text.length;

    return (
        <h1 aria-label={text}>
            <span aria-hidden="true">{text.slice(0, count)}</span>
            {isTyping && <span className="caret" aria-hidden="true" />}
        </h1>
    );
}