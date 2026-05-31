## Context

The project is a journalism platform built with React 18 + TypeScript (Vite), Tailwind CSS, Radix UI, TanStack React Query, and a FastAPI + SQLAlchemy + MySQL backend. Posts are displayed via `PostCard.tsx`, which currently has a single action in its footer: a comment toggle button. The platform has no like or share mechanism at all — neither model, route, nor UI exists. The goal is to add a LinkedIn-style four-button action bar (Like · Comment · Share · Send) where only Like is functional.

## Goals / Non-Goals

**Goals:**
- Implement a functional like/unlike toggle per post per authenticated user, with a persisted count
- Add a share modal (UI only) with icons for Instagram, LinkedIn, WhatsApp, and X
- Update the comment button icon to match a speech-bubble / `MessageSquare` style
- Add a send/forward icon button (no action)
- Keep all changes additive — no breakage to existing comment, post, or auth flows

**Non-Goals:**
- Real share/deep-link integration with external platforms
- Send/DM functionality
- Like notifications or activity feeds
- Anonymous (unauthenticated) likes
- Like counts on the post detail page (out of scope for now)

## Decisions

### 1. Like storage: server-side join table (not client-only)
A `post_likes` table (columns: `id`, `user_id`, `post_id`, `created_at`) with a `UNIQUE(user_id, post_id)` constraint. Toggle via `POST /posts/{id}/like` — if a row exists it is deleted; if not, it is created. The response returns `{ liked: bool, like_count: int }`.

**Alternatives considered:**
- Counter column only on posts table — simpler, but can't prevent double-likes or show per-user state.
- Redis/in-memory — overkill for current scale; no Redis in stack.

### 2. Frontend like state: optimistic update via React Query
`useLike(postId)` mutation uses `onMutate` optimistic update on the query cache key `['post', postId]` and `['feed']`. This gives instant UI feedback without a round-trip delay.

**Alternatives considered:**
- Local useState only — wouldn't survive navigation or page refresh.
- Full cache invalidation on settle — simpler but causes flicker/refetch.

### 3. Like count in Post schema
The `Post` response schema gains two new optional fields: `like_count: int` (default 0) and `liked_by_me: bool` (default false, only populated when a JWT token is present). This avoids a second request.

### 4. Share modal: Radix UI Dialog (already in stack)
`ShareModal.tsx` uses `<Dialog>` from `@radix-ui/react-dialog` (already installed). Platform links are constructed from the current page URL (`window.location.href`). Icons use SVG inline components (brand icons not in Lucide).

**Alternatives considered:**
- Native Web Share API — inconsistent browser support, no desktop fallback.
- New modal library — unnecessary, Radix Dialog already present.

### 5. Comment icon: `MessageSquare` (Lucide)
Current code uses `MessageCircle`. Changing to `MessageSquare` matches the flat speech-bubble style in the reference image. Drop-in replacement, same props.

### 6. Send icon: `Send` (Lucide)
Lucide's `Send` icon (paper airplane, diagonal) matches the reference. Button renders but has no `onClick` handler for now.

## Risks / Trade-offs

- **Migration required**: Adding `post_likes` table needs an Alembic migration. If migration is not run, the endpoint will 500. → Mitigation: migration auto-runs via existing `alembic upgrade head` on container start.
- **`liked_by_me` query N+1**: Naively checking per-post if the current user liked it in a feed of 20 posts = 20 queries. → Mitigation: use a single subquery or LEFT JOIN in the feed endpoint to resolve all in one query.
- **Unauthenticated users**: Like button should be visible but clicking it redirects to login or shows a toast. → Mitigation: guard in `useLike` hook, show toast "Faça login para curtir".
- **Brand SVG icons**: Lucide doesn't include Instagram/LinkedIn/WhatsApp/X brand icons. → Mitigation: use `simple-icons` package (MIT license, already common in React projects) or inline minimal SVG paths.

## Migration Plan

1. Add `PostLike` SQLAlchemy model to `backend/app/models/`
2. Generate Alembic migration: `alembic revision --autogenerate -m "add_post_likes"`
3. Deploy backend — migration runs on startup
4. Deploy frontend — new fields `like_count` / `liked_by_me` are optional/defaulted; old clients unaffected
5. Rollback: `alembic downgrade -1` drops the table; frontend gracefully falls back to `like_count=0`

## Open Questions

- Should unauthenticated users see the like count? (Assumed: yes, just can't interact)
- Should the share modal copy a link to clipboard as well? (Out of scope for now, can add later)
