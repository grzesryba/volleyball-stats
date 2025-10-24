import {use, useEffect, useState} from "react";

const initialPositions = {
    1: null, 2: null, 3: null,
    4: null, 5: null, 6: null
};

function NewMatchConfigWindow({isOpen, handleSave, onClose}) {
    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [players, setPlayers] = useState([]);
    const [positions, setPositions] = useState(initialPositions);
    const [liberoId, setLiberoId] = useState(null);
    const [liberoPartner1Id, setLiberoPartner1Id] = useState(null);
    const [liberoPartner2Id, setLiberoPartner2Id] = useState(null);
    const [setterPosition, setSetterPosition] = useState(null)

    const fetchTeams = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/teams");
            const data = await res.json();
            setTeams(data || []);
        } catch (err) {
            console.error("fetchTeams error", err);
            setTeams([]);
        }
    };

    const fetchPlayers = async () => {
        if (!selectedTeamId) {
            setPlayers([]);
            return;
        }
        try {
            const res = await fetch(`http://127.0.0.1:8000/players_team/${selectedTeamId}`);
            const data = await res.json();
            setPlayers(data || []);
        } catch (err) {
            console.error("fetchPlayers error", err);
            setPlayers([]);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchTeams();
            setSelectedTeamId(null);
            setPlayers([]);
            setPositions(initialPositions);
            setLiberoId(null);
            setLiberoPartner1Id(null);
            setLiberoPartner2Id(null);
        }
    }, [isOpen]);

    useEffect(() => {
        fetchPlayers();
    }, [selectedTeamId]);

    if (!isOpen) return null;

    const assignPlayerToZone = (zone, player) => {
        setPositions((prev) => ({
            ...prev,
            [zone]: player || null
        }));
        if (!player && liberoPartner1Id && liberoPartner1Id === positions[zone]?.id
            && liberoPartner2Id && liberoPartner2Id === positions[zone]?.id) {
            setLiberoPartner1Id(null);
            setLiberoPartner2Id(null);
        }
    };

    const handleStartMatch = () => {
        const startingPositions = Object.entries(positions).map(([zone, player]) => ({
            zone,
            player_id: player?.id ?? null
        }));

        handleSave({
            team_id: selectedTeamId,
            positions: startingPositions,
            libero_id: liberoId ?? null,
            liberoPartner1Id: liberoPartner1Id ?? null,
            liberoPartner2Id: liberoPartner2Id ?? null,
            setterPosition: setterPosition
        });

        onClose();
    };

    const allPositionsFilled =
        selectedTeamId &&
        Object.values(positions).every((p) => p && p.id) &&
        liberoId != null &&
        liberoPartner1Id != null &&
        liberoPartner2Id != null &&
        setterPosition != null;

    const playersOnCourtIds = Object.values(positions).filter(p => p).map(p => p.id);

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h2>!!!Nowy Mecz!!!</h2>

                <label>Nazwa drużyny:</label>

                <label style={{marginRight: "10px"}}>
                    Wybierz drużynę:
                </label>
                <select
                    id="team-select"
                    value={selectedTeamId ?? ""}
                    onChange={(e) => {
                        const v = e.target.value;
                        setSelectedTeamId(v ? parseInt(v, 10) : null);
                    }}
                >
                    <option value="">-- Wybierz drużynę --</option>
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>

                {players.length > 0 && (
                    <div style={{marginTop: "20px"}}>
                        <h3>Zawodnicy ({players.length})</h3>
                        <ul>
                            {players.map((p) => (
                                <li key={p.id}>
                                    {p.number}. {p.name} {p.surname}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {players.length > 0 && (
                    <div style={courtWrapper}>
                        <h3>Ustawienie początkowe</h3>
                        <div style={courtGrid}>
                            {[4, 3, 2, 5, 6, 1].map((zone) => {
                                // id zawodników przypisanych do innych stref (bez bieżącej strefy)
                                const assignedPlayerIds = Object.values(positions)
                                    .filter((p) => p && p.id !== positions[zone]?.id)
                                    .map((p) => p.id);

                                // zablokuj także przypisanie zawodnika będącego libero
                                if (liberoId && liberoId !== positions[zone]?.id) {
                                    assignedPlayerIds.push(liberoId);
                                }

                                return (
                                    <div key={zone} style={courtCell}>
                                        <strong>{zone}</strong>
                                        <select
                                            value={positions[zone]?.id ?? ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (!val) {
                                                    assignPlayerToZone(zone, null);
                                                    return;
                                                }
                                                const player = players.find((pl) => pl.id === parseInt(val, 10));
                                                assignPlayerToZone(zone, player || null);
                                            }}
                                        >
                                            <option value="">--</option>
                                            {players
                                                .filter((p) => !assignedPlayerIds.includes(p.id))
                                                .map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.number}. {p.name} {p.surname}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {players.length > 0 && (
                    <div style={{marginTop: "25px"}}>
                        <h3>Libero</h3>

                        <div style={liberoContainer}>
                            <div>
                                <label>Wybierz libero:</label>
                                <select
                                    value={liberoId ?? ""}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setLiberoId(v ? parseInt(v, 10) : null);
                                        // jeżeli wybraliśmy libero który był wcześniej partnerem libero (rzadkie), to nic specjalnego
                                    }}
                                >
                                    <option value="">-- brak --</option>
                                    {/*
                                        WYKLUCZAMY zawodników, którzy są już na boisku,
                                        żeby nie mogło być jednocześnie libero i grającego.
                                    */}
                                    {players
                                        .filter((p) => !playersOnCourtIds.includes(p.id))
                                        .map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.number}. {p.name} {p.surname}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label>Z kim się zmienia:</label>

                                <label>1 do zmiany</label>
                                <select
                                    value={liberoPartner1Id ?? ""}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setLiberoPartner1Id(v ? parseInt(v, 10) : null);
                                    }}
                                >
                                    <option value="">-- brak --</option>
                                    {Object.values(positions)
                                        .filter((p) => p && p.id !== liberoPartner2Id) // tylko rzeczywiste przypisania
                                        .map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.number}. {p.name} {p.surname}
                                            </option>
                                        ))}
                                </select>

                                <label>2 do zmiany</label>
                                <select
                                    value={liberoPartner2Id ?? ""}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setLiberoPartner2Id(v ? parseInt(v, 10) : null);
                                    }}
                                >
                                    <option value="">-- brak --</option>
                                    {Object.values(positions)
                                        .filter((p) => p && p.id !== liberoPartner1Id) // tylko rzeczywiste przypisania
                                        .map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.number}. {p.name} {p.surname}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label>Pozycja rozgrywającego:</label>
                                <select
                                    value={setterPosition ?? ""}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setSetterPosition(v ? parseInt(v, 10) : null);
                                    }}
                                >
                                    <option value={null}>-- brak --</option>
                                    {[1, 2, 3, 4, 5, 6].map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{marginTop: "20px", textAlign: "right"}}>
                    <button
                        onClick={handleStartMatch}
                        // zablokuj jeśli brak wybranej drużyny lub nie wszystkie 6 pozycji są wypełnione
                        disabled={!selectedTeamId || !allPositionsFilled}
                    >
                        ✅ Rozpocznij mecz
                    </button>
                    <button onClick={onClose} style={{marginLeft: "10px"}}>Anuluj</button>
                </div>
            </div>
        </div>
    );
}

export default NewMatchConfigWindow;

/* style constants (niezmienione) */
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

const courtWrapper = {
    marginTop: "20px",
    textAlign: "center"
};

const courtGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(2, 100px)",
    gap: "10px",
    backgroundColor: "#00800033",
    padding: "10px",
    borderRadius: "12px",
    justifyItems: "center",
    alignItems: "center"
};

const courtCell = {
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "5px",
    textAlign: "center",
    width: "100%",
    height: "100%"
};

const liberoContainer = {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginTop: "10px"
};
