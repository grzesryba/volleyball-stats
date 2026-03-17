import React from "react";
import "../styles/new_match_config_window.css";

function FirstServeChose({isOpen, onChoose, onClose}) {
    if (!isOpen) return null;

    return (
        <div className="overlayStyle">
            <div className="modalStyle" style={{maxWidth: "450px", textAlign: "center"}}>
                <h2 style={{marginTop: 0, color: "#1e293b"}}>Kto rozpoczyna zagrywkę?</h2>
                <p style={{color: "#64748b", marginBottom: "2rem"}}>
                    Wybierz drużynę, która będzie serwowała jako pierwsza.
                </p>
                <div style={{display: "flex", gap: "1rem", justifyContent: "center"}}>
                    <button className="btn-primary" onClick={() => onChoose("A")}>
                        Moja drużyna
                    </button>
                    <button className="btn-primary" onClick={() => onChoose("B")}>
                        Przeciwnicy
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FirstServeChose;