import React, {useEffect, useState} from "react";
import "../styles/new_match_config_window.css";
import CourtSetup from "../CourtSetup";
import LiberoConfig from "../LiberoConfig";

const initialPositions = {
    1: null, 2: null, 3: null,
    4: null, 5: null, 6: null
};

function NewMatchConfigWindow({isOpen, handleSave, onClose}) {
    const [step, setStep] = useState(1);
    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [players, setPlayers] = useState([]);
    const [positions, setPositions] = useState(initialPositions);
    const [liberoId, setLiberoId] = useState(null);
    const [liberoPartner1Id, setLiberoPartner1Id] = useState(null);
    const [liberoPartner2Id, setLiberoPartner2Id] = useState(null);
    const [setterPosition, setSetterPosition] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchTeams();
            resetState();
        }
    }, [isOpen]);

    const resetState = () => {
        setStep(1);
        setSelectedTeamId(null);
        setPlayers([]);
        setPositions(initialPositions);
        setLiberoId(null);
        setLiberoPartner1Id(null);
        setLiberoPartner2Id(null);
        setSetterPosition(null);
    };

    const fetchTeams = async () => {
        try {
            const res = await fetch("/api/teams");
            const data = await res.json();
            setTeams(data || []);
        } catch (err) {
            console.error("fetchTeams error", err);
        }
    };

    useEffect(() => {
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
            }
        };
        fetchPlayers();
    }, [selectedTeamId]);

    const assignPlayerToZone = (zone, player) => {
        setPositions(prev => ({
            ...prev,
            [zone]: player || null
        }));
    };

    const allPositionsFilled = Object.values(positions).every(p => p && p.id);
    const playersOnCourtIds = Object.values(positions).filter(p => p).map(p => p.id);

    const canGoToStep2 = selectedTeamId && players.length >= 6;
    const canGoToStep3 = allPositionsFilled;
    const canFinish = allPositionsFilled && liberoId && liberoPartner1Id && liberoPartner2Id && setterPosition;

    const handleNext = () => {
        if (step === 1 && canGoToStep2) setStep(2);
        else if (step === 2 && canGoToStep3) setStep(3);
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleStartMatch = () => {
        const startingPositions = Object.entries(positions).map(([zone, player]) => ({
            zone: parseInt(zone),
            player_id: player?.id ?? null
        }));

        handleSave({
            team_id: selectedTeamId,
            positions: startingPositions,
            libero_id: liberoId,
            liberoPartner1Id,
            liberoPartner2Id,
            setterPosition
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="overlayStyle">
            <div className="modalStyle">
                <h2>Nowy mecz</h2>

                <div className="step-indicator">
                    <div className={`step ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>1. Drużyna</div>
                    <div className={`step ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>2. Ustawienie</div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Libero i rozgrywający</div>
                </div>

                <div className="step-content">
                    {step === 1 && (
                        <div>
                            <label>Wybierz drużynę:</label>
                            <select
                                value={selectedTeamId ?? ""}
                                onChange={(e) => setSelectedTeamId(e.target.value ? parseInt(e.target.value, 10) : null)}
                            >
                                <option value="">-- Wybierz drużynę --</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>

                            {players.length > 0 && (
                                <div style={{marginTop: "1.5rem"}}>
                                    <h4>Zawodnicy ({players.length})</h4>
                                    <div className="player-list">
                                        {players.map(p => (
                                            <div key={p.id} className="player-list-item">
                                                <span className="player-number">{p.number}.</span>
                                                <span className="player-name">{p.name} {p.surname}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && players.length > 0 && (
                        <CourtSetup
                            players={players}
                            positions={positions}
                            liberoId={liberoId}
                            assignPlayerToZone={assignPlayerToZone}
                        />
                    )}

                    {step === 3 && players.length > 0 && (
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
                    )}
                </div>

                <div className="modal-actions">
                    {step > 1 && (
                        <button className="btn-secondary" onClick={handlePrev}>
                            Wstecz
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            className="btn-primary"
                            onClick={handleNext}
                            disabled={(step === 1 && !canGoToStep2) || (step === 2 && !canGoToStep3)}
                        >
                            Dalej
                        </button>
                    ) : (
                        <button
                            className="btn-primary"
                            onClick={handleStartMatch}
                            disabled={!canFinish}
                        >
                            Rozpocznij mecz
                        </button>
                    )}
                    <button className="btn-secondary" onClick={onClose}>
                        Anuluj
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NewMatchConfigWindow;