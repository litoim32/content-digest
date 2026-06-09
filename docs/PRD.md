# PRD — Content Digest

## Problem

People save more articles than they ever revisit. Links pile up in tabs, chats,
and bookmarks with no context, so deciding what's worth reading later means
re-opening and re-skimming each one. There's no quick way to capture *what an
article is about* and file it by topic.

## Who it's for

Individuals who read a lot online — researchers, students, analysts, and anyone
keeping a personal reading queue — and want a lightweight, private place to triage
and organize articles. Single user, one browser; no team or account needed.

## Core user scenarios (features)

1. **Capture an article** — paste a URL and the article text; the URL is kept as the
   card's clickable source link.
2. **Auto-summarize** — get a short summary (2–3 sentences) and key-point bullets
   without reading the whole piece.
3. **Auto-tag** — get a handful of keyword tags pulled from the content.
4. **Suggested category** — the app proposes a topic category; the user can confirm
   or change it per card.
5. **Topic board** — cards are laid out on a board grouped into sections by category,
   newest first.
6. **Persist & return** — the board survives reloads so the reading queue is there
   next time.
7. **Prune** — remove a card once it's been read or is no longer relevant.

## In scope (MVP)

- Manual paste of article text + optional URL.
- Local, automatic summary / key points / tags / category suggestion.
- Category override per card.
- Topic-grouped board with create, re-categorize, and delete.
- Local persistence (single browser).
- Convenience auto-fetch of article text from a URL **while developing**.

## Out of scope (MVP)

- Accounts, auth, multi-user, or cross-device sync.
- A production backend or database (storage is local only).
- Reliable one-click fetch of any public URL in production (blocked by CORS).
- Editing the generated summary/points/tags by hand.
- Search, filtering, sorting beyond newest-first, and export.
- Mobile-specific layouts.

## MVP success criteria

- From paste to a finished card (summary + key points + tags + category) in **one
  action**, in **under ~2 seconds**, with **no API key or setup**.
- Every card lands in a topic section; changing its category **moves it** to the
  right section.
- Cards **persist across reloads**; deleting a card removes it permanently.
- The category suggestion is **right or one-click-fixable** for typical
  single-topic articles.
- Empty, blank-input, and reload states never crash or show a broken board.
