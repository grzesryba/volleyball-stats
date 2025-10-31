from models import Positioning, PointSituationDesc, Substitution
from enum import Enum


class PositionName(Enum):
    CENTER = "center"
    TOP = "top"
    BOTTOM = "bottom"
    LEFT = "left"
    RIGHT_BOTTOM = "right-bottom"
    LEFT_TOP = "left-top"

    BOTTOM_LINE = "bottom-line"
    RIGHT_BOTTOM_LINE = "right-bottom-line"
    BOTTOM_RIGHT_LINE = "bottom-right-line"
    BOTTOM_LEFT_LINE = "bottom-left-line"
    RIGHT_TOP_LINE = "right-top-line"
    TOP_LINE = "top-line"

    LEFT_BOTTOM_CORNER = "left-bottom-corner"


def calculate_position(p: Positioning, isMyTeamServing: bool):
    sp = []  # serving position
    rp = []  # receiver position    krotki w formie (sektor, osoba, nazwa_pozycji(miejsca w sektorze))
    gp = []  # inGame position

    libero_position = find_libero_partner(p, isMyTeamServing)

    sp = [p.p1, p.p2, p.p3, p.p4, p.p5, p.p6]
    if p.setter_position == 1:
        if libero_position != -1:
            sp[libero_position - 1] = p.l
        gp = [sp[0], sp[3], sp[2], sp[1], sp[5], sp[4]]
        rp = [(1, sp[0], PositionName.RIGHT_BOTTOM_LINE), (1, sp[1], PositionName.TOP), (3, sp[2], PositionName.CENTER),
              (4, sp[3], PositionName.CENTER), (5, sp[4], PositionName.TOP), (6, sp[5], PositionName.CENTER)]
    if p.setter_position == 6:
        if libero_position != -1:
            sp[libero_position - 1] = p.l
        gp = [sp[5], sp[2], sp[1], sp[3], sp[4], sp[0]]
        rp = [(1, sp[0], PositionName.TOP), (2, sp[1], PositionName.BOTTOM_LINE),
              (3, sp[2], PositionName.RIGHT_TOP_LINE),
              (3, sp[5], PositionName.RIGHT_BOTTOM), (5, sp[3], PositionName.TOP), (6, sp[4], PositionName.TOP)]
    if p.setter_position == 5:  # błąd w pozycji w trakcie gry (zamienić 2 z 4(strefy))
        if libero_position != -1:
            sp[libero_position - 1] = p.l
        gp = [sp[4], sp[1], sp[3], sp[2], sp[0], sp[5]]
        rp = [(1, sp[0], PositionName.TOP), (2, sp[1], PositionName.CENTER), (4, sp[3], PositionName.LEFT_TOP),
              (4, sp[4], PositionName.BOTTOM), (5, sp[2], PositionName.TOP), (6, sp[5], PositionName.CENTER)]
    if p.setter_position == 4:  # błąd w pozycji w trakcie gry (zamienić 2 z 4(strefy))
        if libero_position != -1:
            sp[libero_position - 1] = p.l
        gp = [sp[0], sp[3], sp[2], sp[1], sp[5], sp[4]]
        rp = [(1, sp[0], PositionName.BOTTOM_RIGHT_LINE), (1, sp[5], PositionName.TOP), (4, sp[2], PositionName.BOTTOM),
              (4, sp[3], PositionName.LEFT_TOP), (5, sp[1], PositionName.TOP), (6, sp[4], PositionName.CENTER)]
    if p.setter_position == 3:  # błąd w pozycji w trakcie gry (zamienić 2 z 4(strefy))
        if libero_position != -1:
            sp[libero_position - 1] = p.l
        gp = [sp[5], sp[2], sp[1], sp[3], sp[4], sp[0]]
        rp = [(1, sp[0], PositionName.TOP_LINE), (1, sp[5], PositionName.BOTTOM_LEFT_LINE),
              (2, sp[1], PositionName.LEFT_TOP),
              (3, sp[2], PositionName.TOP), (5, sp[3], PositionName.TOP_LINE), (6, sp[4], PositionName.TOP)]
    if p.setter_position == 2:  # błąd w pozycji w trakcie gry (zamienić 2 z 4(strefy))
        if libero_position != -1:
            sp[libero_position - 1] = p.l
        gp = [sp[4], sp[1], sp[3], sp[2], sp[0], sp[5]]
        rp = [(1, sp[0], PositionName.TOP), (2, sp[1], PositionName.CENTER), (4, sp[3], PositionName.LEFT),
              (5, sp[2], PositionName.TOP_LINE), (5, sp[4], PositionName.LEFT_BOTTOM_CORNER),
              (6, sp[5], PositionName.TOP)]

    return {'serving_position': sp, 'ingame_position': gp, 'receive_position': rp}


def find_libero_partner(p: Positioning, b: bool):
    if (p.p1 == p.l_change1 or p.p1 == p.l_change2) and not b:
        return 1
    if p.p5 == p.l_change1 or p.p5 == p.l_change2:
        return 5
    if p.p6 == p.l_change1 or p.p6 == p.l_change2:
        return 6
    else:
        return -1


def make_rotation(p: Positioning):
    p.p1, p.p2, p.p3, p.p4, p.p5, p.p6 = p.p2, p.p3, p.p4, p.p5, p.p6, p.p1
    p.setter_position = p.setter_position - 1 if p.setter_position > 1 else 6
    return p


def handle_situation(ps: PointSituationDesc):
    point_winner = None
    if ps.result == "#" and (ps.game_element == "Zagrywka" or ps.game_element == "Atak" or ps.game_element == "Blok"):
        point_winner = 'A'

    elif ps.result == "=":
        point_winner = 'B'

    elif ps.result == '/' and (ps.game_element == "Atak" or ps.game_element == "Blok"):
        point_winner = 'B'

    elif ps.result == "x":
        point_winner = "A"

    elif ps.result == "?":
        point_winner = "B"

    return point_winner


def handle_substitution(s: Substitution):

    s2 = s.playerInId2 and s.playerOutId2

    p: Positioning = s.currentPosition
    positions = [p.p1, p.p2, p.p3, p.p4, p.p5, p.p6, p.l]
    change1_on_position = None
    change2_on_position = None

    print(f"starting positions: {positions}")
    for i, pid in enumerate(positions):
        if s.playerOutId == pid:
            change1_on_position = i + 1
        elif s2 and s.playerOutId2 == pid:
            change2_on_position = i + 1
        print(f"Pid: {pid}, i: {i}, positions: {positions}")

    positions[change1_on_position - 1] = s.playerInId
    if s2:
        positions[change2_on_position - 1] = s.playerInId2

    p.p1, p.p2, p.p3, p.p4, p.p5, p.p6, p.l = positions[0], positions[1], positions[2], positions[3], positions[4], \
        positions[5], positions[6]

    if s2:
        if p.setter_position == change1_on_position:
            p.setter_position = change2_on_position
        elif p.setter_position == change2_on_position:
            p.setter_position = change1_on_position

    x = calculate_position(p, s.isMyTeamServing)
    return {"current_position": p, "serving_position": x['serving_position'], "ingame_position": x['ingame_position'],
            'receive_position': x['receive_position']}
