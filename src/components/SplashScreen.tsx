'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Hide the splash screen after 3 seconds
        const timer = setTimeout(() => {
            setShow(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="splash-fullscreen">
            <div className="splash-bg-text">26</div>

            <div className="splash-header-left">KOHINOOR</div>
            <div className="splash-header-right">Est. 2026</div>

            <div className="splash-content">
                <div className="splash-top-line">
                    <span className="line"></span>
                    <span className="text">K & J</span>
                    <span className="line"></span>
                </div>

                <p className="splash-subtitle-small">Y O U R &nbsp; J O U R N E Y &nbsp; S T A R T S &nbsp; N O W</p>

                <h1 className="splash-main-title">
                    Welcome to<br />
                    <span className="gold-text">Kohinoor</span>
                </h1>

                <p className="splash-bottom-tag">Where Your Billing Experience Begins</p>
            </div>
        </div>
    );
}
