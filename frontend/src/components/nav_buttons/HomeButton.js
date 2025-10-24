import React from "react";
import Home from "../pages/Home";
import {Link} from "react-router-dom";

function HomeButton() {
    return (
        <nav style={{
            backgroundColor: "#222",
            color: "white",
            padding: "10px",
            display: "flex",
            gap: "20px"
        }}>
            <Link to="/" style={{color: "white", textDecoration: "none"}}>🏐 Home</Link>
        </nav>
    );
}

export default HomeButton;
