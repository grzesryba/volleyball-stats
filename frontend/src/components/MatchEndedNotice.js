import {useEffect, useState} from "react";

function MatchEndedNotice() {
    const [showNotice, setShowNotice] = useState(false);

    useEffect(() => {
        const ended = localStorage.getItem("matchEnded");
        if (ended === "true") {
            setShowNotice(true);
        }
    }, []);

    const handleClose = () => {
        setShowNotice(false);
        localStorage.removeItem("matchEnded");
    };

    if (!showNotice) return null;

    return (
        <div className="notice-overlay" onClick={handleClose}>
            <div className="notice-box" onClick={(e) => e.stopPropagation()}>
                <h3>Mecz zakończony 🏁</h3>
                <p>Ten mecz został już zakończony. Nie możesz wprowadzać dalszych zmian.</p>
                <button onClick={handleClose}>OK</button>
            </div>
        </div>
    );
}

export default MatchEndedNotice;
