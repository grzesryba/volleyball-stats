import {useEffect, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import '../styles/match.css'
import FirstServeChose from "./FirstServeChose";
import ActionPanel from "../ActionPanel";
import {click} from "@testing-library/user-event/dist/click";

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
    const [setNumber, setSetNumber] = useState(savedState?.setNumber || 1)
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
    const [currentPointId, setCurrentPointId] = useState(savedState?.currentPointId || null)

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
            currentPointId,
            lastUpdate: new Date().toISOString()
        };

        saveMatchState(stateToSave);
    }, [
        teamMembers, pointNumber, scoreA, scoreB, currentSetId,
        setNumber, setA, setB, lastPointWon, isServingPhase,
        isMyTeamServing, clickedPlayerId, currentPosition,
        currentPositionId, servePositions, inGamePositions, receivePositions, currentPointId
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

            if (!isMyTeamServing && currentPosition.setter_position === 1) {
                setInGamePositions(prev => [prev[0], prev[3], prev[2], prev[1], prev[4], prev[5]])
            }
        } else {
            console.error("Błąd przy pobieraniu nowych pozycji:", data);
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
            console.error("❌ Błąd przy tworzeniu seta:", setData);
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
        createNewSet()
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

    const add_new_positioning = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/positioning`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(currentPosition),
            });
            const data = await res.json();

            if (res.ok && data.position_id) {
                setCurrentPositionId(data.position_id)
            }

        } catch (err) {
            console.error("New rotation error", err);
        }
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

            add_new_positioning()

        } catch (err) {
            console.error("New rotation error", err);
        }
    }

    const set_point_winner = async (winner) => {

        let x = {
            winner: winner
        }

        const res = await fetch(`http://127.0.0.1:8000/point/${id}/winner?winner=${winner}`, {
            method: "POST",
        });

        const data = await res.json();

        if (res.ok) {
            setCurrentPointId(null)
        } else {
            console.error("Błąd przy ustalaniu zwycięzcy punktu:", x);
        }
    }


    async function handleAddPoint(winnerTeam) {
        if (!activeMatchConfig) return;

        let p_id = currentPointId
        if (!currentPointId) {
            p_id = await createNewPoint();
            setCurrentPointId(p_id)
        }

        const newScoreA = winnerTeam === "A" ? scoreA + 1 : scoreA;
        const newScoreB = winnerTeam === "B" ? scoreB + 1 : scoreB;

        if (winnerTeam === "A") {
            setScoreA(prevState => prevState + 1)
            if (lastPointWon === "B") {
                make_rotation()
            }
            setLastPointWon("A")
            setIsMyTeamServing(true);

            // handlePointSituations("x", "Błąd przeciwnika")
            set_point_winner("A")

            if (servePositions) {
                setClickedPlayerId(servePositions[0])
            }
        } else if (winnerTeam === "B") {
            setLastPointWon("B")
            setScoreB(prevState => prevState + 1)
            setIsMyTeamServing(false)

            // handlePointSituations("?", "Nietypowy błąd")
            set_point_winner("B")

        }

        if ((newScoreA >= 25 && (newScoreA - newScoreB >= 2)) ||
            (newScoreB >= 25 && (newScoreB - newScoreA >= 2))) {
            setPointNumber(0)
            setScoreA(0)
            setScoreB(0)
            scoreA > scoreB ? setSetA(prev => prev + 1) : setSetB(prev => prev + 1)
            setSetNumber(prev => prev + 1)
            createNewSet()
        }

        setPointNumber(prev => prev + 1)
        setIsServingPhase(true)
    }


    const [message, setMessage] = useState(null);
    const point_situation = async (r, ge, point_id, player_id) => {

        let ps_data = {
            result: r,
            game_element: ge,
            point_id: point_id,
            player_id: clickedPlayerId ? clickedPlayerId : player_id
        }
        try {
            const res = await fetch(`http://127.0.0.1:8000/point_situation`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(ps_data),
            });
            const data = await res.json();
            if (res.ok && data.point_situation_id) {
                showMessage(data.desc || "Zapisano sytuację!");

                console.log("Data: ", data)
                console.log("winner: ", data.winner)
                if (data.winner) {
                    console.log("THERE WAS A WINNERRRR")
                    handleAddPoint(data.winner)
                }
                return true
            }
        } catch (err) {
            console.error("New rotation error", err);
            return false
        }
    }

    const showMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(null), 2500);
    };

    async function handlePointSituations(symbol, element, player_id) {

        let p_id = currentPointId
        if (!currentPointId) {
            p_id = await createNewPoint();
        }

        const success = await point_situation(symbol, element, p_id, player_id);
        if (success) {
            if (element === "Zagrywka" || element === "Przyjęcie") {
                setIsServingPhase(false);
            }
        }
    }

    const createNewPoint = async () => {

        let pData = {
            set_id: currentSetId,
            point_no: pointNumber,
            score_before_A: scoreA,
            score_before_B: scoreB,
            winner: null,
            position_id: currentPositionId
        }

        const res = await fetch(`http://127.0.0.1:8000/add_point`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(pData),
        });

        const data = await res.json();

        if (res.ok && data.point_id) {
            console.log("Dodano nowy punkt: ", data)
            setCurrentPointId(data.point_id)
            return data.point_id
        } else {
            console.error("Błąd przy tworzeniu punktu dla:", pData);
        }
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
                            onClick={() => handlePointSituations("x", "Błąd przeciwnika", servePositions[0])}>
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
                            onClick={() => handlePointSituations("?", "Nietypowy błąd", servePositions[0])}>
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
                    handleButtons={handlePointSituations}
                    isMyTeamServing={isMyTeamServing}
                    isServingPhase={isServingPhase}
                />
            </div>

            <FirstServeChose
                isOpen={isMyTeamServing === null && setA === 0 && setB === 0 && scoreA === 0 && scoreB === 0}
                onChoose={handleServeChoose}
            />
            <div>isServingPhase: {isServingPhase ? "Tak" : "Nie"}</div>
            {message && (
                <div
                    className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-lg shadow-lg text-sm opacity-90 animate-fade">
                    {message}
                </div>
            )}
        </main>
    )
}

export default Match;