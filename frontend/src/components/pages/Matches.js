import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import NewMatchConfigWindow from "./NewMatchConfigWindow";
import "../styles/matches.css";

function Matches() {
    const [matches, setMatches] = useState([]);
    const [openNewMatch, setOpenNewMatch] = useState(false);
    const navigate = useNavigate();

    const fetchMatches = async () => {
        try {
            const res = await fetch("/api/matches");
            const data = await res.json();
            setMatches(data);
        } catch (err) {
            console.error("Błąd pobierania meczów:", err);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const handleSaveNewMatch = async (matchConfig) => {
        matchConfig["team_A_id"] = matchConfig.team_id;

        try {
            const res = await fetch("/api/matches/start", {
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
        } catch (err) {
            console.error("Błąd sieci:", err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Brak daty";
        const date = new Date(dateString);
        return date.toLocaleDateString("pl-PL");
    };

    const getMatchStatus = (match) => {
        if (match.winner) return "finished";
        return "ongoing";
    };

    return (
        <div className="matches-container">
            <div className="matches-header">
                <h2>Twoje mecze</h2>
                <button className="btn-new-match" onClick={() => setOpenNewMatch(true)}>
                    <span>➕</span> Nowy mecz
                </button>
            </div>

            {matches.length === 0 ? (
                <p style={{textAlign: "center", color: "#64748b"}}>
                    Brak rozegranych meczów. Rozpocznij nowy!
                </p>
            ) : (
                <div className="matches-grid">
                    {matches.map((match) => (
                        <div key={match.id} className="match-card">
                            <div className="match-date">
                                <span>📅</span> {formatDate(match.match_date)}
                            </div>
                            <div className="match-teams">
                                <span className="match-team">{match.team_A_name || "Team A"}</span>
                                <span className="match-score">
                  {match.score_A ?? 0} : {match.score_B ?? 0}
                </span>
                                <span className="match-team">{match.team_B_name || "Team B"}</span>
                            </div>
                            <div className="match-status">
                <span className={`status-badge ${getMatchStatus(match)}`}>
                  {getMatchStatus(match) === "finished" ? "Zakończony" : "W trakcie"}
                </span>
                                {getMatchStatus(match) === "ongoing" && (
                                    <button
                                        className="status-badge"
                                        onClick={() => navigate(`/match/${match.id}`)}
                                    >
                                        Kontynuuj
                                    </button>
                                )}
                                {getMatchStatus(match) === "finished" && (
                                    <button
                                        className="status-badge"
                                        onClick={() => navigate(`/stats/${match.id}`)}
                                    >
                                        Statystyki
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NewMatchConfigWindow
                isOpen={openNewMatch}
                onClose={() => setOpenNewMatch(false)}
                handleSave={handleSaveNewMatch}
            />
        </div>
    );
}

export default Matches;