import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./navigation.css";

function HomeButton() {
  const location = useLocation();
  const isActive = location.pathname === "/";

  return (
    <Link to="/" className={`nav-link ${isActive ? "active" : ""}`}>
      <span className="nav-icon">🏐</span>
      <span>Home</span>
    </Link>
  );
}

export default HomeButton;