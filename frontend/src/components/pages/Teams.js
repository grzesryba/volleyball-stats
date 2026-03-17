import React, {useState, useEffect} from "react";
import TeamModal from "./TeamModal";
import HomeButton from "../nav_buttons/HomeButton";
import "../styles/teams.css";

function Teams() {
    const [teams, setTeams] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);

    const fetchTeams = async () => {
        try {
            const res = await fetch("/api/teams");
            const data = await res.json();
            setTeams(data);
        } catch (err) {
            console.error("Błąd pobierania drużyn", err);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleAddTeam = async (teamData) => {
        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(teamData),
            });
            await res.json();
            await fetchTeams();
        } catch (err) {
            console.error("Błąd dodawania drużyny", err);
        }
    };

    const handleEditTeam = async (teamData) => {
        try {
            const res = await fetch(`/api/teams/${teamData.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(teamData),
            });
            await res.json();
            await fetchTeams();
        } catch (err) {
            console.error("Błąd edycji drużyny", err);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm("Czy na pewno usunąć tę drużynę?")) return;
        try {
            const res = await fetch(`/api/teams/${teamId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                await fetchTeams();
            }
        } catch (err) {
            console.error("Błąd usuwania drużyny", err);
        }
    };

    return (
        <div className="teams-container">
            <div className="teams-header">
                <h2>Moje drużyny</h2>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditingTeam(null);
                        setModalOpen(true);
                    }}
                >
                    ➕ Dodaj drużynę
                </button>
            </div>

            <div className="teams-grid">
                {teams.map((team) => (
                    <div key={team.id} className="team-card">
                        <div className="team-card-header">
                            <h3>{team.name}</h3>
                            <div className="team-card-actions">
                                <button
                                    className="icon-button"
                                    onClick={() => {
                                        setEditingTeam(team);
                                        setModalOpen(true);
                                    }}
                                    title="Edytuj"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="icon-button"
                                    onClick={() => handleDeleteTeam(team.id)}
                                    title="Usuń"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <p>Liczba zawodników: <span className="player-count">{team.length || 0}</span></p>
                        {/* Jeśli API zwraca datę utworzenia, można dodać: */}
                        {/* <p>Utworzona: {new Date(team.created_at).toLocaleDateString()}</p> */}
                    </div>
                ))}
                {teams.length === 0 && (
                    <p style={{color: "#64748b", gridColumn: "1/-1", textAlign: "center"}}>
                        Brak drużyn. Dodaj pierwszą!
                    </p>
                )}
            </div>

            <TeamModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingTeam(null);
                }}
                onSave={editingTeam ? handleEditTeam : handleAddTeam}
                existingTeam={editingTeam}
            />
        </div>
    );
}

export default Teams;