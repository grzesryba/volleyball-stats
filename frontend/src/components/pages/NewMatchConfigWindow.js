import {use, useEffect, useState} from "react";
import '../styles/new_match_config_window.css'
import CourtSetup from "../CourtSetup";
import LiberoConfig from "../LiberoConfig";

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
            const res = await fetch("/api/teams");
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
            const res = await fetch(`/api/players_team/${selectedTeamId}`);
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
        <div className="overlayStyle">
            <div className="modalStyle">
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
                    <>
                        <CourtSetup
                            players={players}
                            positions={positions}
                            liberoId={liberoId}
                            assignPlayerToZone={assignPlayerToZone}
                        />
                        <LiberoConfig
                            players={players}
                            positions={positions}
                            liberoId={liberoId}
                            setLiberoId={setLiberoId}
                            liberoPartner1Id={liberoPartner1Id}
                            setLiberoPartner1Id={setLiberoPartner1Id}
                            liberoPartner2Id={liberoPartner2Id}
                            setLiberoPartner2Id={setLiberoPartner2Id}
                            setterPosition={setterPosition}
                            setSetterPosition={setSetterPosition}
                            playersOnCourtIds={playersOnCourtIds}
                        />
                    </>
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
