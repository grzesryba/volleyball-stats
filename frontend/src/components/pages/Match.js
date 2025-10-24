import {useEffect, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import '../styles/match.css'
import FirstServeChose from "./FirstServeChose";
import ActionPanel from "../ActionPanel";

function Match() {
    const {id} = useParams();
    const location = useLocation();
    const matchConfig = location.state?.matchConfig;

    const STORAGE_KEY = `match_state_${id}`;

    const loadMatchState = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (err) {
            console.error("Błąd ładowania stanu:", err);
            return null;
        }
    };

    const saveMatchState = (state) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (err) {
            console.error("Błąd zapisywania stanu:", err);
        }
    };

    const savedState = loadMatchState();

    const [teamMembers, setTeamMembers] = useState(savedState?.teamMembers || null)
    const [pointNumber, setPointNumber] = useState(savedState?.pointNumber || 0)
    const [scoreA, setScoreA] = useState(savedState?.scoreA || 0)
    const [scoreB, setScoreB] = useState(savedState?.scoreB || 0)
    const [currentSetId, setCurrentSetId] = useState(savedState?.currentSetId || null)
    const [setNumber, setSetNumber] = useState(savedState?.setNumber || 0)
    const [setA, setSetA] = useState(savedState?.setA || 0)
    const [setB, setSetB] = useState(savedState?.setB || 0)
    const [lastPointWon, setLastPointWon] = useState(savedState?.lastPointWon || null)
    const [isServingPhase, setIsServingPhase] = useState(savedState?.isServingPhase || null)
    const [isMyTeamServing, setIsMyTeamServing] = useState(savedState?.isMyTeamServing || null)
    const [clickedPlayerId, setClickedPlayerId] = useState(savedState?.clickedPlayerId || null)
    const [currentPosition, setCurrentPosition] = useState(savedState?.currentPosition || null)
    const [currentPositionId, setCurrentPositionId] = useState(savedState?.currentPositionId || null)
    const [servePositions, setServePositions] = useState(savedState?.servePositions || null)
    const [inGamePositions, setInGamePositions] = useState(savedState?.inGamePositions || null)
    const [receivePositions, setReceivePositions] = useState(savedState?.receivePositions || null)

    // Zapisz matchConfig do localStorage, jeśli istnieje
    useEffect(() => {
        if (matchConfig && !savedState) {
            const configToSave = {
                matchConfig: matchConfig
            };
            localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(configToSave));
        }
    }, [matchConfig]);

    // Pobierz matchConfig z localStorage jeśli nie ma w location.state
    const getMatchConfig = () => {
        if (matchConfig) return matchConfig;

        try {
            const saved = localStorage.getItem(`${STORAGE_KEY}_config`);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.matchConfig;
            }
        } catch (err) {
            console.error("Błąd ładowania konfiguracji:", err);
        }
        return null;
    };

    const activeMatchConfig = getMatchConfig();

    useEffect(() => {
        if (!activeMatchConfig) return;

        const stateToSave = {
            teamMembers,
            pointNumber,
            scoreA,
            scoreB,
            currentSetId,
            setNumber,
            setA,
            setB,
            lastPointWon,
            isServingPhase,
            isMyTeamServing,
            clickedPlayerId,
            currentPosition,
            currentPositionId,
            servePositions,
            inGamePositions,
            receivePositions,
            lastUpdate: new Date().toISOString()
        };

        saveMatchState(stateToSave);
    }, [
        teamMembers, pointNumber, scoreA, scoreB, currentSetId,
        setNumber, setA, setB, lastPointWon, isServingPhase,
        isMyTeamServing, clickedPlayerId, currentPosition,
        currentPositionId, servePositions, inGamePositions, receivePositions
    ]);

    const getGamePositions = async () => {
        console.log(currentPosition)
        console.log(typeof currentPosition)
        let x = {
            'positions': currentPosition,
            'isMyTeamServing': isMyTeamServing
        }
        const res = await fetch(`http://127.0.0.1:8000/ingame/positions`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(x),
        });

        const data = await res.json();

        if (res.ok && data.serving_position && data.ingame_position && data.receive_position) {
            console.log("Serve:", data.serving_position);
            console.log("InGame:", data.ingame_position);
            console.log("Receive:", data.receive_position);
            setServePositions(data.serving_position)
            setInGamePositions(data.ingame_position)
            setReceivePositions(data.receive_position)

            if (!isMyTeamServing) {
                setInGamePositions(prev => [prev[0], prev[3], prev[2], prev[1], prev[4], prev[5]])
            }
        } else {
            console.error("❌ Błąd przy pobieraniu nowych pozycji:", data);
        }
    }

    useEffect(() => {
        console.log("currentPosition: ", currentPosition)
        console.log("isMyTeamServing: ", isMyTeamServing)
        if (!currentPosition) return;
        if (isMyTeamServing === null) return;
        getGamePositions();
    }, [currentPosition, isMyTeamServing]);

    const createNewSet = async () => {
        const setData = {
            "match_id": id,
            "set_no": setNumber
        }
        const res = await fetch(`http://127.0.0.1:8000/match/${id}/set/start`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(setData),
        });

        const data = await res.json();

        if (res.ok && data.set_id) {
            console.log("✅ Nowy set ID:", data.set_id);
            setCurrentSetId(data.set_id)
        } else {
            console.error("❌ Błąd przy tworzeniu seta:", data);
        }
    }

    const fetchPlayers = async () => {
        if (!activeMatchConfig) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/players_team/${activeMatchConfig.team_A_id}`);
            const data = await res.json();
            setTeamMembers(data || []);
        } catch (err) {
            console.error("fetchPlayers error", err);
            setTeamMembers([]);
        }
    };

    useEffect(() => {
        if (servePositions && isMyTeamServing) {
            setClickedPlayerId(servePositions[0]);
        } else {
            setClickedPlayerId(null)
        }
    }, [servePositions, isMyTeamServing]);

    useEffect(() => {
        if (setNumber > 0) {
            createNewSet()
        }
    }, [setNumber]);

    const createStartingPosition = async () => {
        if (!activeMatchConfig) return;

        let pData = {
            p1: activeMatchConfig.positions[0].player_id,
            p2: activeMatchConfig.positions[1].player_id,
            p3: activeMatchConfig.positions[2].player_id,
            p4: activeMatchConfig.positions[3].player_id,
            p5: activeMatchConfig.positions[4].player_id,
            p6: activeMatchConfig.positions[5].player_id,
            l: activeMatchConfig.libero_id,
            l_change1: activeMatchConfig.liberoPartner1Id,
            l_change2: activeMatchConfig.liberoPartner2Id,
            setter_position: activeMatchConfig.setterPosition
        }

        setCurrentPosition(pData)

        console.log("Dane do tworzenia nowej pozycji: ", pData)

        const res = await fetch(`http://127.0.0.1:8000/positioning`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(pData),
        });

        const data = await res.json();

        if (res.ok && data.position_id) {
            console.log("Id pozycji:", data.position_id);
            setCurrentPositionId(data.position_id)
        } else {
            console.error("Błąd przy tworzeniu pozycji dla:", data);
        }
    }

    useEffect(() => {
        if (savedState && savedState.currentPosition) {
            console.log("Wczytano zapisany stan meczu");
            return;
        }

        createStartingPosition()
        fetchPlayers()
    }, []);


    useEffect(() => {
        if (!teamMembers && activeMatchConfig) {
            fetchPlayers();
        }
    }, [teamMembers, activeMatchConfig]);

    const handleServeChoose = (team) => {
        console.log("Wybrano:", team);

        if (team === "A") {
            setIsMyTeamServing(true);
            if (servePositions) {
                setClickedPlayerId(servePositions[0])
            }
        } else {
            setIsMyTeamServing(false)
        }
        setLastPointWon(team === "A" ? "A" : "B")
        setIsServingPhase(true)
    };

    function getPlayerNumber(pos, pid = null) {
        let playerId = null

        if (isServingPhase && !isMyTeamServing) {
            const p = teamMembers?.find(p => p.id === pid);
            return p ? p.number : "?";
        }

        if (isServingPhase) {
            playerId = servePositions[pos - 1]
        } else {
            playerId = inGamePositions[pos - 1]
        }
        const player = teamMembers?.find(p => p.id === playerId);
        return player ? player.number : "?";
    }

    const make_rotation = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/rotation`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(currentPosition),
            });
            const data = await res.json();
            setCurrentPosition(data.position)
            setServePositions(data.serving_position)
            setInGamePositions(data.ingame_position)
        } catch (err) {
            console.error("New rotation error", err);
        }
    }

    function handleAddPoint(winnerTeam) {
        if (!activeMatchConfig) return;

        let winnerTeamId = null;
        if (winnerTeam === "A") {
            winnerTeamId = activeMatchConfig.team_A_id
        } else
            winnerTeamId = activeMatchConfig.team_B_id || -1

        const pointConfig = {
            "set_id": currentSetId,
            "point_no": pointNumber,
            "score_before_A": scoreA,
            "score_before_B": scoreB,
            "winner": winnerTeamId,
            "position_id": activeMatchConfig.position_id
        }

        if (winnerTeam === "A") {
            setScoreA(prevState => prevState + 1)
            if (lastPointWon === "B") {
                make_rotation()
            }
            setLastPointWon("A")
            setIsMyTeamServing(true);
            if (servePositions) {
                setClickedPlayerId(servePositions[0])
            }
        } else if (winnerTeam === "B") {
            setLastPointWon("B")
            setScoreB(prevState => prevState + 1)
            setIsMyTeamServing(false)
        }

        setIsServingPhase(true)
    }

    function handleServe() {
        setIsServingPhase(false)
    }

    function handlePositionPlayerClick(pos, p_id = null) {
        let playerId = null;
        if (p_id && isServingPhase && !isMyTeamServing) {
            playerId = p_id
        } else if (isServingPhase) {
            playerId = servePositions[0]
        } else {
            playerId = inGamePositions[pos - 1]
        }
        setClickedPlayerId(playerId)
    }

    return (
        <main className="container" id="app">
            <header className="header">
                <div className="scoreboard" aria-label="Scoreboard">
                    <div className="team" id="teamA">
                        <div className="team-name">Team A</div>
                        <div className="score" id="scoreA">{scoreA}</div>
                        <button
                            className="btn small" id="addA"
                            onClick={() => handleAddPoint("A")}>
                            + Point
                        </button>
                    </div>

                    <div className="team">
                        <div className="team-name">setA</div>
                        <div className="score">{setA}</div>
                    </div>

                    <div className="team">
                        <div className="team-name">setB</div>
                        <div className="score">{setB}</div>
                    </div>

                    <div className="team" id="teamB">
                        <div className="team-name">Team B</div>
                        <div className="score" id="scoreB">{scoreB}</div>
                        <button
                            className="btn small" id="addB"
                            onClick={() => handleAddPoint("B")}>
                            + Point
                        </button>
                    </div>
                </div>
            </header>

            <section className="court-section">
                {servePositions && inGamePositions && currentPosition && !(!isMyTeamServing && isServingPhase) ? (
                    <div className="court" id="court" role="grid" aria-label="Court positions">
                        {currentPosition && [4, 3, 2, 5, 6, 1].map((pos) => (
                            <button
                                key={pos}
                                className="pos"
                                data-pos={pos}
                                role="gridcell"
                                aria-pressed={teamMembers?.find(p => p.id === clickedPlayerId)?.number === getPlayerNumber(pos)}
                                onClick={() => handlePositionPlayerClick(pos)}
                            >
                            <span className={pos === 1 && isServingPhase && isMyTeamServing
                                ? `player-circle red-circle bottom-line` : `player-circle`}>
                                {getPlayerNumber(pos)}
                            </span>
                            </button>
                        ))}
                    </div>) : null
                }
                {!isMyTeamServing && isServingPhase && servePositions && inGamePositions && currentPosition ? (
                    <div className="court" id="court" role="grid" aria-label="Court positions">
                        {[4, 3, 2, 5, 6, 1].map((pos) => {
                            const playersInZone = receivePositions.filter(([zone]) => zone === pos);

                            return (
                                <div
                                    key={`zone-${pos}`}
                                    className={`pos ${playersInZone.length === 0 ? "empty-pos" : ""}`}
                                    data-pos={pos}
                                    role="gridcell"
                                >
                                    {playersInZone.length > 0 ? (
                                        playersInZone.map(([zone, playerId, positionName]) => (
                                            <span
                                                key={`${zone}-${playerId}`}
                                                data-playerid={playerId}
                                                aria-pressed={clickedPlayerId === playerId}
                                                className={
                                                    pos === 1 && isServingPhase && isMyTeamServing
                                                        ? `player-circle ${positionName}`
                                                        : `player-circle ${positionName}`
                                                }
                                                role="button"
                                                onClick={() => handlePositionPlayerClick(zone, playerId)}
                                            >{getPlayerNumber(zone, playerId)}
                                            </span>
                                        ))
                                    ) : <span className="empty-label"></span>}
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </section>
            <section className="substitutions-section">
                <h3>Zmiany</h3>
                <div className="substitutions-list">
                    <div className="substitution-item">
                        <span>Brak zmian</span>
                    </div>
                </div>
            </section>
            <div className="actions-panel">
                <div className="selected-info" id="selectedInfo">
                    Wybrany zawodnik: {clickedPlayerId || 'Brak'}
                </div>

                <ActionPanel
                    selectedPlayerId={clickedPlayerId}
                    functions={{
                        'handleServe': handleServe
                    }}
                    isMyTeamServing={isMyTeamServing}
                />
            </div>

            <FirstServeChose
                isOpen={isMyTeamServing === null && !savedState}
                onChoose={handleServeChoose}
            />
        </main>
    )
}

export default Match;