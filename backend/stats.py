from db import get_connection


def get_whole_match_points_situations(team_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
                    SELECT ps.id, s.id, pl.id, pl.number, pl.name, pl.surname, ge.name, r.symbol FROM matches as m
                    JOIN sets as s on s.match_id=m.id
                    JOIN points as p on p.set_id=s.id
                    JOIN point_situation as ps on ps.point_id = p.id
                    JOIN game_elements as ge on ge.id=ps.game_element_id
                    JOIN results as r on r.id=ps.result_id
                    JOIN players as pl on pl.id=ps.player_id
                    WHERE m.id = ? and (p.winner="A" or p.winner="B") and (s.set_winner="A" or s.set_winner="B") 
            """, (team_id,))
    points = [tuple(row) for row in c.fetchall()]
    conn.commit()
    conn.close()

    return points


def get_team_matches_ids(team_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
            SELECT id FROM matches WHERE team_A_id = ?
    """, (team_id,))
    matches = [row['id'] for row in c.fetchall()]

    conn.commit()
    conn.close()

    return matches


def get_sets(match_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
                SELECT * FROM sets WHERE match_id = ?
        """, (match_id,))
    sets = [row['id'] for row in c.fetchall()]
    print(sets)
    conn.commit()
    conn.close()

    return sets


def get_inset_points(set_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
                    SELECT * FROM points WHERE set_id = ?
            """, (set_id,))
    points = [row['id'] for row in c.fetchall()]
    print(points)
    conn.commit()
    conn.close()
    return points


def get_whole_team_stats(match_id):
    points = get_whole_match_points_situations(
        match_id)  # ps.id, s.id, pl.id, pl.number, pl.name, pl.surname, ge.name, r.symbol

    # all_situations = len(points)
    # total_errors = len([x for x in points if x[6] == "="])
    # efficiency = round(100 * (len([x for x in points if x[6] == "#"]) + total_errors) / all_situations, 2)

    return points


def get_match_set_results(match_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT s.set_winner FROM matches as m 
        JOIN sets as s on s.match_id=m.id
        WHERE m.id=?
    """, (match_id,))
    sets_winners = [row['set_winner'] for row in c.fetchall()]
    sets_winners = [x for x in sets_winners if x is not None]

    A_winner = [x for x in sets_winners if x == "A"]
    B_winner = [x for x in sets_winners if x == "B"]

    conn.commit()
    conn.close()
    return {"A_winner": len(A_winner), "B_winner": len(B_winner)}
