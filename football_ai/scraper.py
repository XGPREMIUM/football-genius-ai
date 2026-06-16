from __future__ import annotations

import httpx
import re
from typing import Any


def search_wikipedia(query: str, lang: str = "es") -> str | None:
    try:
        url = f"https://{lang}.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": 1,
        }
        r = httpx.get(url, params=params, timeout=10)
        data = r.json()
        pages = data.get("query", {}).get("search", [])
        if pages:
            return pages[0]["title"]
    except Exception:
        pass
    return None


def fetch_wikipedia_summary(query: str, lang: str = "es") -> str | None:
    title = search_wikipedia(query, lang)
    if not title:
        title = search_wikipedia(query, "en")
    if not title:
        return None
    try:
        url = f"https://{lang}.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "prop": "extracts",
            "exintro": True,
            "explaintext": True,
            "titles": title,
            "format": "json",
        }
        r = httpx.get(url, params=params, timeout=10)
        data = r.json()
        pages = data.get("query", {}).get("pages", {})
        for page_id, page in pages.items():
            if page_id != "-1" and "extract" in page:
                text = page["extract"]
                return text[:2000]
    except Exception:
        pass
    return None


def enrich_player_data(player_name: str) -> dict[str, Any]:
    summary = fetch_wikipedia_summary(f"{player_name} futbolista")
    if not summary:
        summary = fetch_wikipedia_summary(f"{player_name} footballer")
    if not summary:
        return {"bio": None}
    badges = []
    if "balón de oro" in summary.lower() or "ballon d'or" in summary.lower():
        badges.append("Balón de Oro")
    if "mundial" in summary.lower() and ("campeón" in summary.lower() or "ganó" in summary.lower()):
        badges.append("Campeón del Mundo")
    if "champions league" in summary.lower() or "liga de campeones" in summary.lower():
        badges.append("Champions League")
    return {
        "bio": summary,
        "badges": badges,
    }
