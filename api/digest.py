"""OpenRouter-backed article digest.

`generate_digest(text)` calls an LLM via OpenRouter and returns a normalized dict
``{summary, keyPoints, tags, category}``. The API key is read from the
``OPENROUTER_API_KEY`` environment variable and never leaves the server.

Issue #5 covers the call + error handling; issue #6 will harden the prompt,
parsing, and add retries/fallbacks.
"""

from __future__ import annotations

import json
import os

import httpx

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-4o-mini"
MAX_INPUT_CHARS = 12000

# Fixed taxonomy (mirrors the frontend's categories).
CATEGORIES: list[str] = [
    "Technology",
    "Business",
    "Science",
    "Health",
    "Politics",
    "Sports",
    "Culture",
    "Other",
]

SYSTEM_PROMPT = (
    "You are a precise article summarizer. Given the article text, respond with a "
    "single JSON object and nothing else, using exactly these keys:\n"
    '  "summary": a 2-3 sentence plain summary,\n'
    '  "keyPoints": an array of 3-5 short bullet strings,\n'
    '  "tags": an array of 3-5 lowercase keyword tags,\n'
    '  "category": one of ' + ", ".join(CATEGORIES) + ".\n"
    "Answer in the language of the article. Do not wrap the JSON in markdown."
)


class DigestError(Exception):
    """Carries an HTTP status code so the API layer can map it to a response."""

    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.message = message


def _normalize(obj: dict) -> dict:
    """Coerce the model's JSON into the strict response shape."""
    summary = str(obj.get("summary", "")).strip()
    key_points = [str(p).strip() for p in (obj.get("keyPoints") or []) if str(p).strip()][:5]
    tags = [str(t).strip().lower() for t in (obj.get("tags") or []) if str(t).strip()][:5]
    category = obj.get("category", "Other")
    if category not in CATEGORIES:
        category = "Other"
    return {"summary": summary, "keyPoints": key_points, "tags": tags, "category": category}


def generate_digest(text: str) -> dict:
    """Summarize `text` via OpenRouter. Raises DigestError on any failure."""
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise DigestError(503, "OPENROUTER_API_KEY is not configured")

    model = os.environ.get("OPENROUTER_MODEL", DEFAULT_MODEL)
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text[:MAX_INPUT_CHARS]},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        # Optional attribution headers recommended by OpenRouter.
        "X-Title": "Content Digest",
    }

    try:
        resp = httpx.post(OPENROUTER_URL, json=payload, headers=headers, timeout=30.0)
    except httpx.HTTPError as exc:
        raise DigestError(502, f"OpenRouter request failed: {exc}") from exc

    if resp.status_code != 200:
        raise DigestError(502, f"OpenRouter error {resp.status_code}: {resp.text[:200]}")

    try:
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
    except (KeyError, IndexError, ValueError) as exc:
        raise DigestError(502, "Could not parse OpenRouter response") from exc

    if not isinstance(parsed, dict):
        raise DigestError(502, "OpenRouter returned an unexpected shape")

    return _normalize(parsed)
