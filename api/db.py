"""Postgres access for Content Digest.

A lazily-created connection pool (psycopg3) keyed off ``DATABASE_URL``, sized
small for the serverless environment. `init_db()` creates the schema; the CRUD
queries that use this pool land in issue #8.
"""

from __future__ import annotations

import os

from psycopg_pool import ConnectionPool

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS cards (
    id          TEXT PRIMARY KEY,
    url         TEXT        NOT NULL DEFAULT '',
    title       TEXT        NOT NULL DEFAULT '',
    summary     TEXT        NOT NULL DEFAULT '',
    key_points  JSONB       NOT NULL DEFAULT '[]'::jsonb,
    tags        JSONB       NOT NULL DEFAULT '[]'::jsonb,
    category    TEXT        NOT NULL DEFAULT 'Other',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cards_created_at_idx ON cards (created_at DESC);
"""

_pool: ConnectionPool | None = None


def get_pool() -> ConnectionPool:
    """Return the process-wide connection pool, creating it on first use."""
    global _pool
    if _pool is None:
        dsn = os.environ.get("DATABASE_URL")
        if not dsn:
            raise RuntimeError("DATABASE_URL is not configured")
        # Small pool: serverless instances are short-lived and concurrency-limited.
        _pool = ConnectionPool(
            conninfo=dsn,
            min_size=0,
            max_size=4,
            max_idle=30,
            open=True,
            kwargs={"autocommit": True},
        )
    return _pool


def init_db() -> None:
    """Create the schema if it does not already exist (idempotent)."""
    statements = [s.strip() for s in SCHEMA_SQL.split(";") if s.strip()]
    with get_pool().connection() as conn:
        for statement in statements:
            conn.execute(statement)


_initialized = False


def ensure_schema() -> None:
    """Run init_db() once per process (cheap no-op afterwards)."""
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True
