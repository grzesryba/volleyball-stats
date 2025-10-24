import {useEffect, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import '../styles/match.css'
import FirstServeChose from "./FirstServeChose";
import ActionPanel from "../ActionPanel";

function Match() {


    const {id} = useParams();
    const location = useLocation();
    const matchConfig = location.state?.matchConfig;

    const [teamMembers, setTeamMembers] = useState(null)

    const [pointNumber, setPointNumber] = useState(0)
    const [scoreA, setScoreA] = useState(0)
    const [scoreB, setScoreB] = useState(0)

    const [currentSetId, setCurrentSetId] = useState(null)
    const [setNumber, setSetNumber] = useState(0)
    const [setA, setSetA] = useState(0)
    const [setB, setSetB] = useState(0)
    const [lastPointWon, setLastPointWon] = useState(null)

    const [isServingPhase, setIsServingPhase] = useState(null)

    const [isMyTeamServing, setIsMyTeamServing] = useState(null)

    const [clickedPlayerId, setClickedPlayerId] = useState(null)

    // Ogólnie
    const [currentPosition, setCurrentPosition] = useState(null)
    const [currentPositionId, setCurrentPositionId] = useState(null)

    // Na boisku
    const [servePositions, setServePositions] = useState(null)
    const [inGamePositions, setInGamePositions] = useState(null)
    const [receivePositions, setReceivePositions] = useState(null)

//////////////////////////////  BĘDZIE ZMIENIANE CHYBA PO KAŻDYM PUNKCIE

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

///////////////////////////////////////////////////////////////////////////////////////////////

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
        try {
            const res = await fetch(`http://127.0.0.1:8000/players_team/${matchConfig.team_A_id}`);
            const data = await res.json();
            setTeamMembers(data || []);
        } catch (err) {
            console.error("fetchPlayers error", err);
            setTeamMembers([]);
        }
    };


    useEffect(() => {
        createNewSet()
    }, [setNumber]);

    const createStartingPosition = async () => {

        let pData = {
            p1: matchConfig.positions[0].player_id,
            p2: matchConfig.positions[1].player_id,
            p3: matchConfig.positions[2].player_id,
            p4: matchConfig.positions[3].player_id,
            p5: matchConfig.positions[4].player_id,
            p6: matchConfig.positions[5].player_id,
            l: matchConfig.libero_id,
            l_change1: matchConfig.liberoPartner1Id,
            l_change2: matchConfig.liberoPartner2Id,
            setter_position: matchConfig.setterPosition
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
        createStartingPosition()
        fetchPlayers()
    }, []);

    const handleServeChoose = (team) => {
        console.log("Wybrano:", team);
        setIsMyTeamServing(team === "A");
        setLastPointWon(team === "A" ? "A" : "B")
        setIsServingPhase(true)
    };

    function getPlayerNumber(pos, pid = null) {
        // console.log("fhnerigntr: ", servePositions)
        // console.log("15654651: ", inGamePositions)
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

        let winnerTeamId = null;
        if (winnerTeam === "A") {
            winnerTeamId = matchConfig.team_A_id
        } else
            winnerTeamId = matchConfig.team_B_id || -1

        const pointConfig = {
            "set_id": currentSetId,
            "point_no": pointNumber,
            "score_before_A": scoreA,
            "score_before_B": scoreB,
            "winner": winnerTeamId,
            "position_id": matchConfig.position_id
        }

        if (winnerTeam === "A") {
            setScoreA(prevState => prevState + 1)
            if (lastPointWon === "B") {
                make_rotation()
            }
            setLastPointWon("A")
            setIsMyTeamServing(true)
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
            playerId = servePositions[pos - 1]
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
                    // <div className="loading">⏳ Ładowanie pozycji...</div>
                }
                {/*//////////////////////////////////////////////////////////////////////*/}
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
                                                        ? `player-circle red-circle ${positionName}`
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
                    {/* Tutaj będą zmiany */}
                    <div className="substitution-item">
                        <span>Brak zmian</span>
                    </div>
                </div>
            </section>
            {/*<section className="log-section">*/}
            {/*    <h3>Event Log</h3>*/}
            {/*    <ul id="log" className="log" aria-live="polite"></ul>*/}
            {/*</section>*/}
            {/*///////////////////////////////////////////////////////////////////////////////////*/}
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
                isOpen={isMyTeamServing === null}
                onChoose={handleServeChoose}
            />

        </main>
    )
}

export default Match;