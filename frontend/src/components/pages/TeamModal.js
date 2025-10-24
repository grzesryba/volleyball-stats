import React, {useEffect, useState} from "react";

function TeamModal({isOpen, onClose, onSave, existingTeam}) {
    const [teamName, setTeamName] = useState(existingTeam?.name || "");
    const [players, setPlayers] = useState([]);
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        const fetchPositions = async () => {
            const res = await fetch("http://127.0.0.1:8000/positions");
            const data = await res.json();
            setPositions(data);
        };

        const getPlayers = async () => {
            if (!existingTeam) return;

            const res = await fetch(`http://127.0.0.1:8000/players_team/${existingTeam.id}`);
            const data = await res.json();

            console.log("Pobrani zawodnicy:", data);

            setPlayers(data);
        }


        if (isOpen) {
            fetchPositions();

            if (existingTeam) {
                setTeamName(existingTeam.name);
                getPlayers();
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
            players: players
        };

        if (existingTeam) {
            teamData.id = existingTeam.id;
        }

        await onSave(teamData);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h2>{existingTeam ? "Edytuj drużynę: " : "Nowa drużyna"}</h2>

                <label>Nazwa drużyny:</label>
                <input
                    type="text"
                    value={teamName}
                    placeholder={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    style={{width: "100%", marginBottom: "10px"}}
                />

                <h3>Zawodnicy</h3>
                {players.map((p, i) => (
                    <div key={i} style={rowStyle}>
                        <input
                            placeholder="Imię"
                            value={p.name}
                            onChange={(e) => updatePlayer(i, "name", e.target.value)}
                        />
                        <input
                            placeholder="Nazwisko"
                            value={p.surname}
                            onChange={(e) => updatePlayer(i, "surname", e.target.value)}
                        />
                        <input
                            placeholder="Nr"
                            value={p.number}
                            onChange={(e) => updatePlayer(i, "number", e.target.value)}
                            style={{width: "50px"}}
                        />
                        <select
                            value={p.position_id}
                            onChange={(e) => updatePlayer(i, "position_id", e.target.value)}
                            style={{width: "150px"}}
                        >
                            <option value="">Wybierz pozycję</option>
                            {positions.map(pos => (
                                <option key={pos.id} value={pos.id}>
                                    {pos.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => removePlayer(i)}>❌</button>
                    </div>
                ))}
                <button onClick={addPlayer}>➕ Dodaj zawodnika</button>

                <div style={{marginTop: "20px", textAlign: "right"}}>
                    <button onClick={handleSave}>💾 Zapisz</button>
                    <button onClick={onClose} style={{marginLeft: "10px"}}>Anuluj</button>
                </div>
            </div>
        </div>
    );
}

export default TeamModal;

// style (prosto inline)
const overlayStyle = {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

const modalStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    width: "600px",
    maxHeight: "80vh",
    overflowY: "auto"
};

const rowStyle = {
    display: "flex",
    gap: "10px",
    marginBottom: "5px",
    alignItems: "center"
};
