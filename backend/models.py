from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


class Player(BaseModel):
    id: Optional[int] = None
    team_id: Optional[int] = None
    name: str
    surname: str
    number: int
    position_id: int


class Team(BaseModel):
    id: Optional[int] = None
    name: str
    players: Optional[List[Player]] = []


class Match(BaseModel):
    id: Optional[int] = None
    team_A_id: int
    team_B_id: Optional[int] = None
    match_date: str = None
    sets_best_of: int = 5
    winner_team: Optional[int] = None


class Set(BaseModel):
    match_id: int
    set_no: int
    set_winner: Optional[int] = None


class Point(BaseModel):
    set_id: int
    point_no: int
    score_before_A: int
    score_before_B: int
    winner: Optional[str] = None
    position_id: int


class Positioning(BaseModel):
    id: Optional[int] = None
    p1: int
    p2: int
    p3: int
    p4: int
    p5: int
    p6: int
    l: int
    setter_position: int
    l_change1: int
    l_change2: int


class InGameRequest(BaseModel):
    positions: Positioning
    isMyTeamServing: bool


class PointSituationDesc(BaseModel):
    result: str
    game_element: str
    point_id: int
    player_id: int
