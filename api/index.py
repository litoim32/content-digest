"""Content Digest API (FastAPI) — deployed as Vercel serverless functions.

Vercel rewrites ``/api/*`` to this module (see vercel.json), and FastAPI matches
the full ``/api/...`` paths below. Run locally with:

    uvicorn api.index:app --reload --port 8000
"""

from __future__ import annotations

import os
import sys

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# Make sibling modules importable regardless of how the serverless runtime loads
# this file (as a package member or a top-level module).
sys.path.append(os.path.dirname(__file__))

from digest import DigestError, generate_digest  # noqa: E402

app = FastAPI(title="Content Digest API", version="0.1.0")


class DigestRequest(BaseModel):
    text: str = Field(min_length=1, description="Article text to summarize")
    url: str = Field(default="", description="Optional source link")


class DigestResponse(BaseModel):
    summary: str
    keyPoints: list[str]
    tags: list[str]
    category: str


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
