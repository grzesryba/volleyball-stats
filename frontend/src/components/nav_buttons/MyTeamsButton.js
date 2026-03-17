import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./navigation.css";

function MyTeamsButton() {
  const location = useLocation();
  const isActive = location.pathname === "/teams";

  return (
    <Link to="/teams" className={`nav-link ${isActive ? "active" : ""}`}>
      <span className="nav-icon">🏋️</span>
      <span>Drużyny</span>
    </Link>
  );
}

export default MyTeamsButton;