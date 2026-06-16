from __future__ import annotations

import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "football.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            full_name TEXT,
            birth_date TEXT,
            nationality TEXT,
            position TEXT,
            dominant_foot TEXT,
            height INTEGER,
            current_club TEXT,
            market_value TEXT,
            career_goals INTEGER DEFAULT 0,
            career_assists INTEGER DEFAULT 0,
            caps INTEGER DEFAULT 0,
            ballon_dors INTEGER DEFAULT 0,
            world_cups INTEGER DEFAULT 0,
            champions_league INTEGER DEFAULT 0,
            description TEXT,
            strengths TEXT,
            playing_style TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            full_name TEXT,
            country TEXT,
            stadium TEXT,
            stadium_capacity INTEGER,
            founded_year INTEGER,
            league TEXT,
            manager TEXT,
            titles_domestic INTEGER DEFAULT 0,
            titles_international INTEGER DEFAULT 0,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS competitions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            region TEXT,
            founded_year INTEGER,
            current_champion TEXT,
            most_titles TEXT,
            most_titles_count INTEGER,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            mode TEXT DEFAULT 'general',
            title TEXT,
            messages TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.commit()
    conn.close()


def search_players(query: str, limit: int = 10) -> list[dict]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM players WHERE name LIKE ? OR nationality LIKE ? OR position LIKE ? OR current_club LIKE ? LIMIT ?",
        (f"%{query}%", f"%{query}%", f"%{query}%", f"%{query}%", limit),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def search_teams(query: str, limit: int = 10) -> list[dict]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM teams WHERE name LIKE ? OR country LIKE ? OR league LIKE ? LIMIT ?",
        (f"%{query}%", f"%{query}%", f"%{query}%", limit),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_player(name: str) -> dict | None:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM players WHERE name = ?", (name,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_team(name: str) -> dict | None:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM teams WHERE name = ?", (name,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_players() -> list[dict]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM players ORDER BY ballon_dors DESC, career_goals DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_all_teams() -> list[dict]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM teams ORDER BY name ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


# Conversation persistence
def save_conversation(session_id: str, mode: str, messages: list[dict]):
    conn = get_connection()
    cursor = conn.cursor()
    import json
    data = json.dumps(messages, ensure_ascii=False)
    first_user_msg = ""
    for m in messages:
        if m["role"] == "user":
            first_user_msg = m["content"][:80]
            break
    cursor.execute("SELECT id FROM conversations WHERE session_id = ?", (session_id,))
    existing = cursor.fetchone()
    if existing:
        cursor.execute(
            "UPDATE conversations SET mode=?, title=?, messages=?, updated_at=CURRENT_TIMESTAMP WHERE session_id=?",
            (mode, first_user_msg, data, session_id),
        )
    else:
        cursor.execute(
            "INSERT INTO conversations (session_id, mode, title, messages) VALUES (?, ?, ?, ?)",
            (session_id, mode, first_user_msg, data),
        )
    conn.commit()
    conn.close()


def load_conversation(session_id: str) -> tuple[str, list[dict]] | None:
    conn = get_connection()
    cursor = conn.cursor()
    import json
    cursor.execute("SELECT mode, messages FROM conversations WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row["mode"], json.loads(row["messages"])
    return None


def list_conversations() -> list[dict]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT session_id, mode, title, created_at FROM conversations ORDER BY updated_at DESC LIMIT 20"
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def delete_conversation(session_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM conversations WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()
