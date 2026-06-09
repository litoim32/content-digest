"""Content Digest API (FastAPI) — deployed as Vercel serverless functions.

Vercel rewrites ``/api/*`` to this module (see vercel.json), and FastAPI matches
the full ``/api/...`` paths below. Run locally with:

    uvicorn api.index:app --reload --port 8000
"""

from __future__ import annotations

import os
import sys
import uuid
from typing import Any

import psycopg
from fastapi import FastAPI, HTTPException
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from pydantic import BaseModel, Field

# Make sibling modules importable regardless of how the serverless runtime loads
# this file (as a package member or a top-level module).
sys.path.append(os.path.dirname(__file__))

import db  # noqa: E402
from digest import CATEGORIES, DigestError, generate_digest  # noqa: E402

_CATEGORY_SET = set(CATEGORIES)

app = FastAPI(title="Content Digest API", version="0.1.0")


# --- models ---------------------------------------------------------------


class DigestRequest(BaseModel):
    text: str = Field(min_length=1, description="Article text to summarize")
    url: str = Field(default="", description="Optional source link")


class DigestResponse(BaseModel):
    summary: str
    keyPoints: list[str]
    tags: list[str]
    category: str


class CardCreate(BaseModel):
    url: str = ""
    title: str = ""
    summary: str = ""
    keyPoints: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    category: str = "Other"


class CategoryUpdate(BaseModel):
    category: str


class CardOut(BaseModel):
    id: str
    url: str
    title: str
    summary: str
    keyPoints: list[str]
    tags: list[str]
    category: str
    createdAt: int


# --- helpers --------------------------------------------------------------


def _row_to_card(row: dict[str, Any]) -> dict[str, Any]:
    created = row["created_at"]
    return {
        "id": row["id"],
        "url": row["url"],
        "title": row["title"],
        "summary": row["summary"],
        "keyPoints": row["key_points"] or [],
        "tags": row["tags"] or [],
        "category": row["category"],
        "createdAt": int(created.timestamp() * 1000),
    }


class _DbUnavailable(Exception):
    pass


def _connect() -> Any:
    """Ensure the schema exists and hand back a pooled connection (dict rows)."""
    try:
        db.ensure_schema()
        return db.get_pool().connection()
    except (RuntimeError, psycopg.Error) as exc:
        raise _DbUnavailable(str(exc)) from exc


# --- routes ---------------------------------------------------------------


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/digest", response_model=DigestResponse)
def digest(req: DigestRequest) -> DigestResponse:
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    try:
        result = generate_digest(text)
    except DigestError as exc:
        raise HTTPException(status_code=exc.status, detail=exc.message) from exc
    return DigestResponse(**result)


@app.get("/api/cards", response_model=list[CardOut])
def list_cards() -> list[dict[str, Any]]:
    try:
        with _connect() as conn, conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM cards ORDER BY created_at DESC")
            return [_row_to_card(r) for r in cur.fetchall()]
    except (_DbUnavailable, psycopg.Error) as exc:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {exc}") from exc


@app.post("/api/cards", response_model=CardOut, status_code=201)
def create_card(body: CardCreate) -> dict[str, Any]:
    category = body.category if body.category in _CATEGORY_SET else "Other"
    card_id = uuid.uuid4().hex
    try:
        with _connect() as conn, conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO cards (id, url, title, summary, key_points, tags, category)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    card_id,
                    body.url,
                    body.title,
                    body.summary,
                    Jsonb(body.keyPoints),
                    Jsonb(body.tags),
                    category,
                ),
            )
            row = cur.fetchone()
        if row is None:
            raise HTTPException(status_code=500, detail="insert failed")
        return _row_to_card(row)
    except (_DbUnavailable, psycopg.Error) as exc:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {exc}") from exc


@app.delete("/api/cards/{card_id}", status_code=204)
def delete_card(card_id: str) -> None:
    if not card_id.strip():
        raise HTTPException(status_code=400, detail="id is required")
    try:
        with _connect() as conn, conn.cursor() as cur:
            cur.execute("DELETE FROM cards WHERE id = %s", (card_id,))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="card not found")
    except (_DbUnavailable, psycopg.Error) as exc:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {exc}") from exc


@app.patch("/api/cards/{card_id}", response_model=CardOut)
def update_category(card_id: str, body: CategoryUpdate) -> dict[str, Any]:
    if not card_id.strip():
        raise HTTPException(status_code=400, detail="id is required")
    if body.category not in _CATEGORY_SET:
        raise HTTPException(status_code=400, detail="invalid category")
    try:
        with _connect() as conn, conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "UPDATE cards SET category = %s WHERE id = %s RETURNING *",
                (body.category, card_id),
            )
            row = cur.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="card not found")
        return _row_to_card(row)
    except (_DbUnavailable, psycopg.Error) as exc:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {exc}") from exc
