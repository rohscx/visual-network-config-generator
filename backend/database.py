import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "db", "topologies.db")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_connection()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS topology (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            switch_a_name TEXT NOT NULL DEFAULT 'Switch-A',
            switch_b_name TEXT NOT NULL DEFAULT 'Switch-B',
            canvas_state TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS host (
            id TEXT PRIMARY KEY,
            topology_id TEXT NOT NULL REFERENCES topology(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            position_x REAL NOT NULL DEFAULT 0,
            position_y REAL NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS connection_group (
            id TEXT PRIMARY KEY,
            topology_id TEXT NOT NULL REFERENCES topology(id) ON DELETE CASCADE,
            host_id TEXT NOT NULL REFERENCES host(id) ON DELETE CASCADE,
            description TEXT NOT NULL DEFAULT '',
            trunk_vlans TEXT NOT NULL DEFAULT '',
            channel_group INTEGER,
            vpc_id INTEGER,
            switch_a_interfaces TEXT NOT NULL DEFAULT '[]',
            switch_b_interfaces TEXT NOT NULL DEFAULT '[]'
        );
    """)
    conn.close()
