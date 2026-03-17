import React from "react";
import {Link} from "react-router-dom";
import "../styles/home.css"

function NavCard({to, icon, title, description}) {
    return (
        <Link to={to} className="nav-card">
            <span className="card-icon">{icon}</span>
            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>
        </Link>
    );
}

function Home() {
    return (
        <div className="home-container">
            <h1 className="home-title">Volleyball Stats</h1>
            <p className="home-subtitle">
                Analizuj swoją grę, zapisuj statystyki, wygrywaj mecze
            </p>

            <div className="home-cards">
                <NavCard
                    to="/teams"
                    icon="🏋️"
                    title="Drużyny"
                    description="Zarządzaj składem, dodawaj zawodników"
                />
                <NavCard
                    to="/matches"
                    icon="🏐"
                    title="Mecze"
                    description="Przeglądaj historię, twórz nowe spotkania"
                />
                {/*<NavCard*/}
                {/*    to="/matches"*/}
                {/*    icon="➕"*/}
                {/*    title="Nowy mecz"*/}
                {/*    description="Rozpocznij nowy mecz i zbieraj statystyki"*/}
                {/*/>*/}
            </div>
        </div>
    );
}

export default Home;