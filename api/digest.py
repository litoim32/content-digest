"""OpenRouter-backed article digest with strict, validated parsing.

`generate_digest(text)` calls an LLM via OpenRouter and returns a normalized dict
``{summary, keyPoints, tags, category}``. The model's JSON output is parsed and
coerced through a pydantic schema (`DigestPayload`), and the call is retried once
if the response can't be parsed/validated. The API key is read from the
``OPENROUTER_API_KEY`` environment variable and never leaves the server.
"""

from __future__ import annotations

import json
import os

import httpx
from pydantic import AliasChoices, BaseModel, Field, ValidationError, field_validator

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-4o-mini"
MAX_INPUT_CHARS = 12000
MAX_ATTEMPTS = 2

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
_CATEGORY_SET = set(CATEGORIES)

SYSTEM_PROMPT = (
    "You summarize articles. Respond with ONE JSON object and nothing else "
    "(no markdown, no code fences), with exactly these keys:\n"
    '  "summary": string — 2-3 sentence plain summary;\n'
    '  "keyPoints": string[] — 3-5 short bullet points;\n'
    '  "tags": string[] — 3-5 lowercase keyword tags;\n'
    '  "category": string — exactly one of: ' + ", ".join(CATEGORIES) + ".\n"
    "Write summary, keyPoints and tags in the same language as the article. "
    "If unsure of the category, use \"Other\"."
)


class DigestError(Exception):
    """Carries an HTTP status code so the API layer can map it to a response."""

    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.message = message


class DigestPayload(BaseModel):
    """Validates + normalizes the LLM's JSON into the strict response shape."""

    model_config = {"populate_by_name": True, "extra": "ignore"}

    summary: str = ""
    keyPoints: list[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("keyPoints", "key_points", "keypoints", "points"),
    )
    tags: list[str] = Field(default_factory=list)
    category: str = "Other"

    @field_validator("summary", mode="before")
    @classmethod
    def _clean_summary(cls, v: object) -> str:
        return str(v or "").strip()

    @field_validator("keyPoints", "tags", mode="before")
    @classmethod
    def _to_str_list(cls, v: object) -> list[str]:
        if not isinstance(v, list):
            return []
        return [str(item).strip() for item in v if str(item).strip()][:5]

    @field_validator("tags")
    @classmethod
    def _lower_tags(cls, v: list[str]) -> list[str]:
        return [t.lower() for t in v]

    @field_validator("category", mode="before")
    @classmethod
    def _coerce_category(cls, v: object) -> str:
        candidate = str(v or "Other").strip().title()
        return candidate if candidate in _CATEGORY_SET else "Other"


def _extract_json(content: str) -> dict:
    """Best-effort: strip markdown fences and isolate the outermost JSON object."""
    text = content.strip()
    if text.startswith("```"):
        text = text.strip("`").strip()
        if text[:4].lower() == "json":
            text = text[4:].strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        text = text[start : end + 1]
    parsed = json.loads(text)
    if not isinstance(parsed, dict):
        raise ValueError("expected a JSON object")
    return parsed


def _call_openrouter(text: str, api_key: str, model: str) -> str:
    """One OpenRouter call; returns the assistant message content string."""
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
        "X-Title": "Content Digest",
    }
    try:
        resp = httpx.post(OPENROUTER_URL, json=payload, headers=headers, timeout=30.0)
    except httpx.HTTPError as exc:
        raise DigestError(502, f"OpenRouter request failed: {exc}") from exc
    if resp.status_code != 200:
        raise DigestError(502, f"OpenRouter error {resp.status_code}: {resp.text[:200]}")
    try:
        return str(resp.json()["choices"][0]["message"]["content"])
    except (KeyError, IndexError, ValueError) as exc:
        raise DigestError(502, "Unexpected OpenRouter response shape") from exc


def generate_digest(text: str) -> dict:
    """Summarize `text` via OpenRouter. Raises DigestError on failure.

    Retries once if the model returns content that can't be parsed/validated.
    """
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise DigestError(503, "OPENROUTER_API_KEY is not configured")
    model = os.environ.get("OPENROUTER_MODEL", DEFAULT_MODEL)

    last_error: Exception | None = None
    for _ in range(MAX_ATTEMPTS):
        content = _call_openrouter(text, api_key, model)
        try:
            payload = DigestPayload.model_validate(_extract_json(content))
            return payload.model_dump()
        except (ValueError, json.JSONDecodeError, ValidationError) as exc:
            last_error = exc  # malformed JSON or failed validation — retry once
    raise DigestError(502, f"Could not parse OpenRouter response: {last_error}")
