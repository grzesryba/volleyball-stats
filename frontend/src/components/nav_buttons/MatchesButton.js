import React, {useState} from "react";
import {Link} from "react-router-dom";


function MatchesButton() {
    return (
        <nav style={{
            backgroundColor: "#222",
            color: "white",
            padding: "10px",
            display: "flex",
            gap: "20px"
        }}>
            <Link to="/matches" style={{color: "white", textDecoration: "none"}}>🏐 Mecze</Link>
        </nav>
    );
}

export default MatchesButton;

