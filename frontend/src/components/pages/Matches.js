import React, {useEffect, useState} from "react";
import HomeButton from "../nav_buttons/HomeButton";
import {useNavigate} from "react-router-dom";
import NewMatchConfigWindow from "./NewMatchConfigWindow";

function Matches() {
    const [matches, setMatches] = useState([]);
    const [openNewMatch, setOpenNewMatch] = useState(false)
    const navigate = useNavigate();

    const fetchMatches = async () => {
        const res = await fetch("http://127.0.0.1:8000/matches");
        const data = await res.json();
        setMatches(data);
    };

    useEffect(() => {
        fetchMatches();
    }, []);


    const handleSaveNewMatch = async (matchConfig) => {
        console.log("Info o nowym meczu:", matchConfig);
        matchConfig['team_A_id'] = matchConfig.team_id

        const res = await fetch("http://127.0.0.1:8000/matches/start", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(matchConfig),
        });

        const data = await res.json();

        if (res.ok && data.match_id) {
            console.log("✅ Nowy mecz ID:", data.match_id);
            localStorage.removeItem(`match_state_${data.match_id}`);
            localStorage.removeItem(`match_state_${data.match_id}_config`);
            navigate(`/match/${data.match_id}`, {state: {matchConfig}});
        } else {
            console.error("❌ Błąd przy tworzeniu meczu:", data);
        }
    };

    return (
        <div>
            <HomeButton/>
            <button onClick={() => setOpenNewMatch(true)}>Nowy mecz</button>
            <ul>
                {matches.map((m) => (
                    <li key={m.id}>{m.team_A_id} vs {m.team_B_id || 'noname'} - {m.match_date}</li>
                ))}
            </ul>

            <NewMatchConfigWindow
                isOpen={openNewMatch}
                onClose={() => setOpenNewMatch(false)}
                handleSave={handleSaveNewMatch}
            />

        </div>
    );
}

export default Matches;
