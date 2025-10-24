import React, {useState} from "react";
import {Link} from "react-router-dom";


function MyTeamsButton() {
    return (
        <nav style={{
            backgroundColor: "#222",
            color: "white",
            padding: "10px",
            display: "flex",
            gap: "20px"
        }}>
            <Link to="/teams" style={{color: "white", textDecoration: "none"}}>🏐 Drużyny</Link>
        </nav>
    );
}

export default MyTeamsButton;

