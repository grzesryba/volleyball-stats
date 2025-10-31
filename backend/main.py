import datetime
import time
from typing import Optional, List

from fastapi import FastAPI
from db import get_connection
from models import Team, Match, Set, Positioning, InGameRequest, PointSituationDesc, Point, Substitution
from logic import calculate_position, make_rotation, handle_situation, handle_substitution

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",  # frontend React
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # dozwolone frontendy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Volleyball Stats Backend OKAY"}


@app.get("/teams")
def get_teams():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM Teams")
    teams = [dict(row) for row in c.fetchall()]
    conn.close()
    return teams


@app.post("/teams")
def add_team(team: Team):
    conn = get_connection()
    c = conn.cursor()
    c.execute("INSERT INTO Teams (name) VALUES (?)", (team.name,))
    team_id = c.lastrowid
    conn.commit()
    conn.close()

    conn = get_connection()
    c = conn.cursor()
    for p in team.players:
        c.execute("""
            INSERT INTO Players (team_id, name, surname, position_id, number)
            VALUES (?, ?, ?, ?, ?)
        """, (team_id, p.name, p.surname, p.position_id, p.number))

    conn.commit()
    conn.close()
    return {"status": "ok", "message": f"Dodano drużynę {team.name}, team_id: {team_id}"}


@app.put("/teams/{team_id}")
def edit_team(team_id: int, team: Team):
    print(f"DEBUG: Team ID: {team_id}")
    print(f"DEBUG: Team data: {team}")
    print(f"DEBUG: Players: {team.players}")
    conn = get_connection()
    c = conn.cursor()

    c.execute("UPDATE Teams SET name = ? WHERE id = ?", (team.name, team_id))

    c.execute("SELECT id FROM Players WHERE team_id = ?", (team_id,))
    current_player_ids = {row['id'] for row in c.fetchall()}

    incoming_player_ids = {p.id for p in team.players if hasattr(p, 'id') and p.id}

    players_to_delete = current_player_ids - incoming_player_ids

    print(f"current_player_ids: {current_player_ids}")
    print(f"incoming_player_ids: {incoming_player_ids}")
    print(f"players_to_delete: {players_to_delete}")

    for player_id in players_to_delete:
        c.execute("DELETE FROM Players WHERE id = ?", (player_id,))

    for p in team.players:
        if hasattr(p, 'id') and p.id and p.id in current_player_ids:
            # Update istniejącego zawodnika
            c.execute("""
                UPDATE Players 
                SET name = ?, surname = ?, position_id = ?, number = ?
                WHERE id = ? AND team_id = ?
            """, (p.name, p.surname, p.position_id, p.number, p.id, team_id))
        else:
            # Dodaj nowego zawodnika
            c.execute("""
                INSERT INTO Players (team_id, name, surname, position_id, number)
                VALUES (?, ?, ?, ?, ?)
            """, (team_id, p.name, p.surname, p.position_id, p.number))

    conn.commit()
    conn.close()
    return {"status": "ok", "message": f"Zaktualizowano drużynę {team.name}"}


@app.get("/players_team/{team_id}")
def get_players_by_team_id(team_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM Players WHERE team_id = ?", (team_id,))
    players = [dict(row) for row in c.fetchall()]
    conn.close()
    return players


@app.get("/positions")
def get_positions():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM Positions")
    positions = [dict(row) for row in c.fetchall()]
    conn.close()
    return positions


@app.get("/matches")
def get_matches():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM Matches")
    matches = [dict(row) for row in c.fetchall()]
    conn.close()
    return matches


@app.post("/matches/start")
def new_match(match: Match):
    conn = get_connection()
    c = conn.cursor()
    match.match_date = str(datetime.date.today())
    print("dane z meczu:", match)

    c.execute(
        """
        INSERT INTO Matches (team_A_id, team_B_id, match_date, sets_best_of, winner_team)
        VALUES (?, ?, ?, ?, ?)
        """,
        (match.team_A_id, match.team_B_id, match.match_date, match.sets_best_of, match.winner_team)
    )
    match_id = c.lastrowid
    conn.commit()
    conn.close()
    return {"match_id": match_id}


@app.post("/match/{id}/set/start")
def new_set(set: Set):
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        """
            INSERT INTO sets (match_id, set_no, set_winner) VALUES (?,?,?) 
        """, (set.match_id, set.set_no, set.set_winner))
    set_id = c.lastrowid
    conn.commit()
    conn.close()
    return {"set_id": set_id}


@app.post("/positioning")
def new_positioning(p: Positioning):
    position_id = None

    conn = get_connection()
    c = conn.cursor()

    c.execute(
        """
            SELECT id FROM positioning 
            WHERE 
            p1=? AND p2=? AND p3=? AND p4=? AND p5=? AND p6=? AND 
            l=? AND l_change1=? AND l_change2=? AND  setter_position=? 
        """, (p.p1, p.p2, p.p3, p.p4, p.p5, p.p6, p.l, p.l_change1, p.l_change2, p.setter_position)
    )
    row = c.fetchone()
    if row:
        position_id = row[0]

    else:
        c.execute(
            """
                INSERT INTO positioning (p1,p2,p3,p4,p5,p6,l,l_change1,l_change2, setter_position) 
                VALUES (?,?,?,?,?,?,?,?,?,?)
            """, (p.p1, p.p2, p.p3, p.p4, p.p5, p.p6, p.l, p.l_change1, p.l_change2, p.setter_position)
        )
        position_id = c.lastrowid

    conn.commit()
    conn.close()
    print(position_id)
    return {"position_id": position_id}


@app.post("/ingame/positions")
def calculate_positions(data: InGameRequest):
    return calculate_position(data.positions, data.isMyTeamServing)


@app.post("/rotation")
def get_new_rotation(p: Positioning):
    p = make_rotation(p)
    x = calculate_position(p, True)
    return {"position": p, "serving_position": x['serving_position'], "ingame_position": x['ingame_position']}


@app.post("/point_situation")
def add_new_point_situation(ps: PointSituationDesc):
    winner = handle_situation(ps)

    conn = get_connection()
    c = conn.cursor()

    if winner:
        c.execute("""
            UPDATE points SET winner = ? WHERE id = ?
        """, (winner, ps.point_id))

    print(f"symbol: {ps.result}")
    res1 = c.execute("""
            SELECT * FROM Results where symbol = ?
    """, (ps.result,))
    row1 = res1.fetchone()
    result_id = row1[0] if row1 else None

    res2 = c.execute("""
                SELECT * FROM Game_Elements where name = ?
        """, (ps.game_element,))
    row2 = res2.fetchone()
    game_element_id = row2[0] if row2 else None

    print(
        f"result_id: {result_id}, game_element_id: {game_element_id}, ps.point_id: {ps.point_id}, ps.player_id: {ps.player_id}")
    c.execute("""
            INSERT INTO Point_Situation (result_id, game_element_id, point_id, player_id)
            VALUES (?,?,?,?)
    """, (result_id, game_element_id, ps.point_id, ps.player_id))
    ps_id = c.lastrowid

    conn.commit()
    conn.close()
    return {"winner": winner, "point_situation_id": ps_id, "desc": f"Dodano zdarzenie: {ps.game_element}: {ps.result}"}


@app.post("/add_point")
def add_new_point(p: Point):
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
            INSERT INTO Points (set_id, point_no, score_before_A, score_before_B, winner, position_id)
            VALUES (?,?,?,?,?,?)
    """, (p.set_id, p.point_no, p.score_before_A, p.score_before_B, p.winner, p.position_id))
    point_id = c.lastrowid
    conn.commit()
    conn.close()
    return {"point_id": point_id}


@app.post("/point/{id}/winner")
def set_point_winner(id: int, winner: str):
    conn = get_connection()
    c = conn.cursor()
    if winner:
        c.execute("""
            UPDATE points SET winner = ? WHERE id = ?
        """, (winner, id))
    conn.commit()
    conn.close()


@app.post("/substitution")
def make_substitution(s: Substitution):
    print(s)
    x = handle_substitution(s)
    new_position_id = new_positioning(x["current_position"])
    return {"position_id": new_position_id, "current_position": x["current_position"],
            "serving_position": x['serving_position'], "ingame_position": x['ingame_position'],
            "receive_position": x['receive_position']}
