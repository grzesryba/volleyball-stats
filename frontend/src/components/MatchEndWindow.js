import React, {useState} from "react";
import {useNavigate} from "react-router-dom";


function MatchEndWindow({onClose, finalScore, endMatch, match_id}) {
    const [step, setStep] = useState("confirm");
    const navigate = useNavigate();

    const handleConfirmEnd = () => {
        setStep("summary");
    };

    const handleViewStats = () => {
        endMatch()
        navigate(`/stats/${match_id}`);
    };

    const handleExitToMatches = () => {
        endMatch()
        navigate("/matches");
    };

    return (
        <div className="overlayStyle">
            <div className="modalStyle">
                {step === "confirm" && (
                    <>
                        <h2>Czy na pewno chcesz zakończyć mecz?</h2>
                        <p>Wynik zostanie zapisany, a dalsze punkty nie będą możliwe.</p>
                        <div style={buttonRow}>
                            <button
                                className="btn"
                                onClick={handleConfirmEnd}
                                style={{background: "crimson"}}
                            >
                                Tak, zakończ mecz
                            </button>
                            <button className="btn" onClick={onClose}>
                                Anuluj
                            </button>
                        </div>
                    </>
                )}

                {step === "summary" && (
                    <>
                        <h2>Mecz zakończony</h2>
                        <div style={scoreBox}>
                            <div>
                                <strong>Team A:</strong> {finalScore.teamA} ({finalScore.setsA})
                            </div>
                            <div>
                                <strong>Team B:</strong> {finalScore.teamB} ({finalScore.setsB})
                            </div>
                        </div>

                        <div style={buttonRow}>
                            <button className="btn" onClick={handleViewStats}>
                                Zobacz statystyki
                            </button>
                            <button
                                className="btn"
                                style={{background: "crimson"}}
                                onClick={handleExitToMatches}
                            >
                                Wyjdź
                            </button>
                            <button className="btn" onClick={onClose}>
                                Anuluj
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default MatchEndWindow;

const buttonRow = {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "20px",
};

const scoreBox = {
    marginTop: "16px",
    marginBottom: "16px",
    fontSize: "18px",
    background: "#f4f4f4",
    borderRadius: "8px",
    padding: "10px",
};
