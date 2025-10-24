// src/components/MatchA.jsx
import React, {useEffect, useState} from "react";

/*
Props:
- matchId (optional) - jeśli masz już zapisany match w DB
- teamA: { id, name }
- teamB: { id, name }
- positionsA: {1:playerObj,...6:playerObj}  // playerObj: {id, number, name, surname}
- positionsB: same
- liberoA / liberoB (optional) : playerId
- startingServerTeamId : id (teamA.id or teamB.id)
- setId (optional) - if you already started a set on backend
- apiBase (optional) - default "/api"
*/
export default function MatchA({
                                   matchId = null,
                                   teamA = null,
                                   teamB = null,
                                   positionsA = null,
                                   positionsB = null,
                                   liberoA = null,
                                   liberoB = null,
                                   startingServerTeamId = null,
                                   setId = null,
                                   apiBase = "/api"
                               }) {
    // scores
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);
    const [servingTeamId, setServingTeamId] = useState(startingServerTeamId);

    // positions state (mutable during match)
    const [posA, setPosA] = useState(positionsA || {1: null, 2: null, 3: null, 4: null, 5: null, 6: null});
    const [posB, setPosB] = useState(positionsB || {1: null, 2: null, 3: null, 4: null, 5: null, 6: null});

    const [selected, setSelected] = useState(null); // {team: 'A'|'B', player}
    const [rallyActions, setRallyActions] = useState([]); // [{team, player_id, action, timestamp}...]
    const [currentSetId, setCurrentSetId] = useState(setId);
    const [localMatchId, setLocalMatchId] = useState(matchId);

    // helper: rotate clockwise
    const rotateClockwise = (positions) => {
        // new1 = old6, new2 = old1, new3 = old2, new4 = old3, new5 = old4, new6 = old5
        return {
            1: positions[6] ?? null,
            2: positions[1] ?? null,
            3: positions[2] ?? null,
            4: positions[3] ?? null,
            5: positions[4] ?? null,
            6: positions[5] ?? null,
        };
    };

    // players on court ids helpers
    const playersOnCourtIds = () => {
        return [
            ...Object.values(posA).filter(Boolean).map(p => p.id),
            ...Object.values(posB).filter(Boolean).map(p => p.id)
        ];
    };

    // select player on court
    const handleSelectPlayer = (team, player) => {
        setSelected({team, player});
    };

    // log action for selected player
    const logAction = (actionName) => {
        if (!selected || !selected.player) {
            alert("Wybierz zawodnika przed wyborem akcji.");
            return;
        }
        const entry = {
            team: selected.team,
            player_id: selected.player.id,
            action: actionName,
            ts: new Date().toISOString()
        };
        setRallyActions(prev => [...prev, entry]);
    };

    // finalize point (winnerTeamId: teamA.id or teamB.id)
    const finalizePoint = async (winnerTeamId) => {
        // store score before
        const scoreBeforeA = scoreA;
        const scoreBeforeB = scoreB;

        const winnerIsA = winnerTeamId === teamA.id;
        // increment local score
        if (winnerIsA) setScoreA(s => s + 1); else setScoreB(s => s + 1);

        // determine rotation: if serving team lost (i.e., winner !== servingTeam) -> winning team rotates and becomes server
        const receivingWon = (winnerTeamId !== servingTeamId);
        if (receivingWon) {
            // rotate winning team's positions
            if (winnerIsA) {
                setPosA(prev => rotateClockwise(prev));
            } else {
                setPosB(prev => rotateClockwise(prev));
            }
            setServingTeamId(winnerTeamId);
        } // else serve stays

        // persist to backend: create Positioning, Point, Point_Situation
        try {
            // 1) create Positioning for winner team (so Points.position_id can reference it)
            const positioning = (winnerIsA ? posA : posB);
            // convert to p1..p6 player ids (or null)
            const positioningPayload = {
                p1: positioning[1]?.id ?? null,
                p2: positioning[2]?.id ?? null,
                p3: positioning[3]?.id ?? null,
                p4: positioning[4]?.id ?? null,
                p5: positioning[5]?.id ?? null,
                p6: positioning[6]?.id ?? null,
            };

            let positionResp = await fetch(`${apiBase}/matches/${localMatchId}/positioning`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({team: winnerIsA ? "A" : "B", positioning: positioningPayload})
            });
            let positionJson = await positionResp.json();
            const positioningId = positionJson.positioning_id;

            // 2) create Point
            const pointPayload = {
                set_id: currentSetId,
                point_no: null, // backend can compute point_no or you can pass computed value
                score_before_A: scoreBeforeA,
                score_before_B: scoreBeforeB,
                winner: winnerTeamId,
                position_id: positioningId
            };

            let pointResp = await fetch(`${apiBase}/matches/${localMatchId}/points`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({...pointPayload, situations: rallyActions})
            });

            let pointJson = await pointResp.json();
            console.log("Saved point:", pointJson);

            // clear rally
            setRallyActions([]);
            setSelected(null);
        } catch (err) {
            console.error("Error saving point:", err);
            // keep local state (but notify)
            alert("Błąd zapisu punktu na serwerze (sprawdź konsolę). Punkt nadal odzwierciedlony lokalnie.");
        }
    };

    // quick helpers: score buttons
    const givePointToA = () => finalizePoint(teamA.id);
    const givePointToB = () => finalizePoint(teamB.id);

    // start / init functions (jeśli trzeba utworzyć match/set po stronie serwera)
    // call this if match or set not yet created
    const startMatchOnServer = async () => {
        if (localMatchId) return;
        // create match placeholder if not provided
        const resp = await fetch(`${apiBase}/matches`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                team_A_id: teamA.id,
                team_B_id: teamB.id,
                sets_best_of: 5
            })
        });
        const json = await resp.json();
        setLocalMatchId(json.match_id);

        // start first set
        const resp2 = await fetch(`${apiBase}/matches/${json.match_id}/start_set`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({set_no: 1})
        });
        const json2 = await resp2.json();
        setCurrentSetId(json2.set_id);
    };

    useEffect(() => {
        // if no match id provided, create one
        if (!localMatchId && teamA && teamB) {
            // don't await here to avoid blocking render
            startMatchOnServer().catch(err => console.error(err));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // small UI render helpers
    const playerCell = (teamLabel, zone, player) => {
        const isSelected = selected && selected.player && selected.player.id === player?.id;
        return (
            <div
                key={`${teamLabel}-${zone}`}
                onClick={() => player && handleSelectPlayer(teamLabel, player)}
                style={{
                    border: isSelected ? "2px solid #007bff" : "1px solid #ccc",
                    padding: 8,
                    borderRadius: 6,
                    minWidth: 50,
                    textAlign: "center",
                    cursor: player ? "pointer" : "default",
                    background: player ? "#fff" : "#f6f6f6",
                    userSelect: "none"
                }}
            >
                <div style={{fontSize: 14, fontWeight: "bold"}}>{zone}</div>
                <div style={{fontSize: 20}}>{player ? player.number : "-"}</div>
            </div>
        );
    };

    return (
        <div style={{padding: 16, fontFamily: "Arial, sans-serif"}}>
            {/* Top scoreboard */}
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
                <div style={{display: "flex", gap: 12, alignItems: "center"}}>
                    <div style={{textAlign: "center"}}>
                        <div style={{fontWeight: "bold"}}>{teamA?.name ?? "Drużyna A"}</div>
                        <div style={{fontSize: 28}}>{scoreA}</div>
                        <div style={{marginTop: 6}}>
                            <button onClick={givePointToA}>+1</button>
                        </div>
                    </div>

                    <div style={{width: 24, textAlign: "center"}}>
                        {servingTeamId === teamA?.id ? "🔵" : servingTeamId === teamB?.id ? "🔴" : ""}
                    </div>

                    <div style={{textAlign: "center"}}>
                        <div style={{fontWeight: "bold"}}>{teamB?.name ?? "Drużyna B"}</div>
                        <div style={{fontSize: 28}}>{scoreB}</div>
                        <div style={{marginTop: 6}}>
                            <button onClick={givePointToB}>+1</button>
                        </div>
                    </div>
                </div>

                <div>
                    <div style={{fontSize: 12, color: "#555"}}>Rally actions: {rallyActions.length}</div>
                    <div style={{fontSize: 12, color: "#555"}}>Selected: {selected?.player?.number ?? "-"}</div>
                </div>
            </div>

            {/* Court (two rows: teamA at top, teamB at bottom) */}
            <div style={{display: "grid", gap: 12}}>
                {/* Team A (top) */}
                <div style={{textAlign: "center"}}>
                    <div style={{fontSize: 14, marginBottom: 6}}>{teamA?.name}</div>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8}}>
                        {[1, 6, 5, 2, 3, 4].map(z => playerCell("A", z, posA[z]))}
                    </div>
                </div>

                {/* Separator / net */}
                <div style={{height: 10, background: "#222", opacity: 0.08, borderRadius: 6, margin: "6px 0"}}/>

                {/* Team B (bottom) */}
                <div style={{textAlign: "center"}}>
                    <div style={{fontSize: 14, marginBottom: 6}}>{teamB?.name}</div>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8}}>
                        {[4, 3, 2, 5, 6, 1].map(z => playerCell("B", z, posB[z]))}
                    </div>
                </div>
            </div>

            {/* Control panel */}
            <div style={{marginTop: 20, borderTop: "1px solid #eee", paddingTop: 12}}>
                <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                    <button onClick={() => logAction("positive_reception")}>Pozytywne przyjęcie</button>
                    <button onClick={() => logAction("negative_reception")}>Negatywne przyjęcie</button>
                    <button onClick={() => logAction("good_set")}>Dobra wystawa</button>
                    <button onClick={() => logAction("bad_set")}>Zła wystawa</button>
                    <button onClick={() => logAction("attack_success")}>Atak — punkt</button>
                    <button onClick={() => logAction("attack_error")}>Atak — nieudany</button>
                    <button onClick={() => logAction("service_ace")}>As serwisowy</button>
                    <button onClick={() => logAction("service_error")}>Błąd serwisowy</button>
                    <button onClick={() => logAction("block")}>Blok</button>
                    <button onClick={() => logAction("dig")}>Obrona (dig)</button>
                </div>

                <div style={{marginTop: 12, display: "flex", gap: 8, alignItems: "center"}}>
                    <button onClick={() => finalizePoint(teamA.id)}>Zapisz punkt — {teamA?.name}</button>
                    <button onClick={() => finalizePoint(teamB.id)}>Zapisz punkt — {teamB?.name}</button>

                    <div style={{marginLeft: "auto"}}>
                        <button onClick={() => {
                            setRallyActions([]);
                            setSelected(null);
                        }}>Wyczyść rally
                        </button>
                    </div>
                </div>

                <div style={{marginTop: 8, color: "#666", fontSize: 13}}>
                    Tip: wybierz najpierw zawodnika (klikając na boisku), potem wpisz akcję z panelu.
                </div>
            </div>
        </div>
    );
}
