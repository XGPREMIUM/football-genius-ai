from __future__ import annotations

from db import get_all_players, get_all_teams


def score_player(p: dict) -> float:
    goals = p.get("career_goals") or 0
    assists = p.get("career_assists") or 0
    caps = p.get("caps") or 0
    ballon_dors = p.get("ballon_dors") or 0
    world_cups = p.get("world_cups") or 0
    cl = p.get("champions_league") or 0

    score = 0.0
    score += min(goals, 900) * 0.15
    score += min(assists, 300) * 0.1
    score += min(caps, 200) * 0.05
    score += ballon_dors * 25
    score += world_cups * 20
    score += cl * 10
    return round(score, 1)


def get_player_ranking() -> list[dict]:
    players = get_all_players()
    ranked = []
    for p in players:
        ranked.append({
            "name": p["name"],
            "nationality": p.get("nationality", ""),
            "position": p.get("position", ""),
            "score": score_player(p),
            "goals": p.get("career_goals") or 0,
            "assists": p.get("career_assists") or 0,
            "ballon_dors": p.get("ballon_dors") or 0,
            "world_cups": p.get("world_cups") or 0,
            "cl": p.get("champions_league") or 0,
        })
    ranked.sort(key=lambda x: x["score"], reverse=True)
    for i, r in enumerate(ranked, 1):
        r["rank"] = i
    return ranked


TOP_PLAYERS_CATEGORIES = {
    "Más goles": ("career_goals", True),
    "Más asistencias": ("career_assists", True),
    "Más Balones de Oro": ("ballon_dors", True),
    "Mundiales ganados": ("world_cups", True),
    "Champions League": ("champions_league", True),
    "Más internacionalidades": ("caps", True),
}


def get_top_teams() -> list[dict]:
    teams = get_all_teams()
    ranked = []
    for t in teams:
        ranked.append({
            "name": t["name"],
            "country": t.get("country", ""),
            "titles_domestic": t.get("titles_domestic") or 0,
            "titles_international": t.get("titles_international") or 0,
            "total_titles": (t.get("titles_domestic") or 0) + (t.get("titles_international") or 0) * 3,
        })
    ranked.sort(key=lambda x: x["total_titles"], reverse=True)
    for i, r in enumerate(ranked, 1):
        r["rank"] = i
    return ranked
