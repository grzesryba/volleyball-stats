import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./navigation.css";

function MatchesButton() {
  const location = useLocation();
  const isActive = location.pathname === "/matches";

  return (
    <Link to="/matches" className={`nav-link ${isActive ? "active" : ""}`}>
      <span className="nav-icon">📋</span>
      <span>Mecze</span>
    </Link>
  );
}

export default MatchesButton;