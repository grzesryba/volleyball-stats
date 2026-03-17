import React, {useEffect, useState} from "react";
import "../styles/teams.css";
import "../styles/new_match_config_window.css";

function TeamModal({isOpen, onClose, onSave, existingTeam}) {
    const [teamName, setTeamName] = useState("");
    const [players, setPlayers] = useState([]);
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const res = await fetch("/api/positions");
                const data = await res.json();
                setPositions(data);
            } catch (err) {
                console.error("Błąd pobierania pozycji", err);
            }
        };

        const fetchPlayers = async () => {
            if (!existingTeam) return;
            try {
                const res = await fetch(`/api/players_team/${existingTeam.id}`);
                const data = await res.json();
                setPlayers(data);
            } catch (err) {
                console.error("Błąd pobierania zawodników", err);
            }
        };

        if (isOpen) {
            fetchPositions();
            if (existingTeam) {
                setTeamName(existingTeam.name);
                fetchPlayers();
            } else {
                setTeamName("");
                setPlayers([]);
            }
        }
    }, [existingTeam, isOpen]);

    const addPlayer = () => {
        setPlayers([...players, {name: "", surname: "", position_id: "", number: ""}]);
    };

    const updatePlayer = (index, field, value) => {
        const newPlayers = [...players];
        newPlayers[index][field] = value;
        setPlayers(newPlayers);
    };

    const removePlayer = (index) => {
        setPlayers(players.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        const teamData = {
            name: teamName,
            players: players,
        };
        if (existingTeam) {
            teamData.id = existingTeam.id;
        }
        await onSave(teamData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="overlayStyle">
            <div className="modalStyle">
                <h2>{existingTeam ? "Edytuj drużynę" : "Nowa drużyna"}</h2>

                <div style={{marginBottom: "1.5rem"}}>
                    <label htmlFor="teamName">Nazwa drużyny:</label>
                    <input
                        id="teamName"
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="np. AZS Warszawa"
                        className="modal-input"
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "12px",
                            border: "1px solid #cbd5e1",
                            marginTop: "0.5rem"
                        }}
                    />
                </div>

                <h3 style={{marginBottom: "1rem"}}>Zawodnicy</h3>

                <div className="players-list" style={{maxHeight: "300px", overflowY: "auto", marginBottom: "1rem"}}>
                    {players.map((player, index) => (
                        <div key={index} className="player-row" style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginBottom: "0.75rem",
                            alignItems: "center",
                            flexWrap: "wrap"
                        }}>
                            <input
                                placeholder="Imię"
                                value={player.name}
                                onChange={(e) => updatePlayer(index, "name", e.target.value)}
                                style={{
                                    flex: "1 1 100px",
                                    padding: "0.5rem",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1"
                                }}
                            />
                            <input
                                placeholder="Nazwisko"
                                value={player.surname}
                                onChange={(e) => updatePlayer(index, "surname", e.target.value)}
                                style={{
                                    flex: "1 1 120px",
                                    padding: "0.5rem",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1"
                                }}
                            />
                            <input
                                placeholder="Nr"
                                value={player.number}
                                onChange={(e) => updatePlayer(index, "number", e.target.value)}
                                style={{
                                    width: "60px",
                                    padding: "0.5rem",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1"
                                }}
                            />
                            <select
                                value={player.position_id}
                                onChange={(e) => updatePlayer(index, "position_id", e.target.value)}
                                style={{
                                    flex: "1 1 140px",
                                    padding: "0.5rem",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1"
                                }}
                            >
                                <option value="">Pozycja</option>
                                {positions.map(pos => (
                                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                                ))}
                            </select>
                            <button
                                className="icon-button"
                                onClick={() => removePlayer(index)}
                                title="Usuń zawodnika"
                                style={{flexShrink: 0}}
                            >
                                ❌
                            </button>
                        </div>
                    ))}
                </div>

                <button className="btn-secondary" onClick={addPlayer} style={{width: "100%", marginBottom: "1.5rem"}}>
                    ➕ Dodaj zawodnika
                </button>

                <div style={{display: "flex", justifyContent: "flex-end", gap: "1rem"}}>
                    <button className="btn-secondary" onClick={onClose}>
                        Anuluj
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                        💾 Zapisz
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TeamModal;