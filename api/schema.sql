-- Content Digest — Postgres schema (issue #7).
-- Apply manually (psql "$DATABASE_URL" -f api/schema.sql) or via db.init_db().

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
