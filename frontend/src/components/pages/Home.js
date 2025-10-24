import React from "react";
import MyTeamsButton from "../nav_buttons/MyTeamsButton";
import MatchesButton from "../nav_buttons/MatchesButton";

function Home() {
    return (
        <div>
            <h1>Volleyball Stats – Strona główna</h1>
            <p>Witaj! Wybierz sekcję z menu, aby rozpocząć.</p>
            <MyTeamsButton/>
            <MatchesButton/>
        </div>
    );
}

export default Home;
