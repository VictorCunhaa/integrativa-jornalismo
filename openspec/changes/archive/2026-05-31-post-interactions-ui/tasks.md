## 1. Backend — Data Model

- [x] 1.1 Create `PostLike` SQLAlchemy model in `backend/app/models/post_like.py` with fields: `id`, `user_id` (FK → users), `post_id` (FK → posts), `created_at`; add `UNIQUE(user_id, post_id)` constraint
- [x] 1.2 Import `PostLike` in `backend/app/models/__init__.py` so Alembic detects it
- [x] 1.3 Add `like_count` computed property (or relationship count) and `likes` relationship to the `Post` model
- [x] 1.4 Generate Alembic migration: `alembic revision --autogenerate -m "add_post_likes"` and verify the generated script is correct
- [x] 1.5 Run `alembic upgrade head` to apply the migration to the local dev database

## 2. Backend — API

- [x] 2.1 Add `like_count: int` (default 0) and `liked_by_me: bool` (default false) fields to `PostResponse` Pydantic schema
- [x] 2.2 Update the post query in `backend/app/routers/posts.py` feed/detail endpoints to populate `like_count` via a single JOIN or subquery (avoid N+1)
- [x] 2.3 Populate `liked_by_me` in the response when a valid JWT is present (use optional current user dependency)
- [x] 2.4 Create `POST /posts/{id}/like` endpoint in `backend/app/routers/posts.py`: toggle logic (insert if absent, delete if present), return `{ "liked": bool, "like_count": int }`, require authentication
- [x] 2.5 Verify the endpoint returns HTTP 401 for unauthenticated requests and HTTP 404 for a non-existent post

## 3. Frontend — Like Hook

- [x] 3.1 Add `like_count` and `liked_by_me` fields to the `Post` TypeScript interface
- [x] 3.2 Create `useLike(postId)` mutation hook in `frontend/src/hooks/usePosts.ts`: call `POST /posts/{id}/like`, implement optimistic update on `['feed']` and `['post', postId]` query cache keys, rollback on error
- [x] 3.3 Guard the mutation: if user is not authenticated, show a Sonner toast "Faça login para curtir" and abort without calling the API

## 4. Frontend — Share Modal Component

- [x] 4.1 Install `simple-icons` package (or prepare inline SVG paths for Instagram, LinkedIn, WhatsApp, X brand icons): `npm install simple-icons` in `frontend/`
- [x] 4.2 Create `frontend/src/components/posts/ShareModal.tsx` using Radix UI `<Dialog>`: accept `postUrl: string` and `open/onOpenChange` props
- [x] 4.3 Add four platform buttons inside the modal: Instagram, LinkedIn, WhatsApp, X — each constructs the appropriate share URL and opens it in a new tab
- [x] 4.4 Style the modal to match the app's design system (Tailwind, same card/dialog aesthetic)

## 5. Frontend — PostCard Action Bar

- [x] 5.1 Replace `MessageCircle` import with `MessageSquare` in `frontend/src/components/posts/PostCard.tsx`
- [x] 5.2 Add Like button to the action bar using `useLike` hook; display `like_count` next to icon; apply active style (filled/colored) when `liked_by_me` is true
- [x] 5.3 Add Share button to the action bar; wire `onClick` to open `ShareModal` with the current post's URL
- [x] 5.4 Add Send button (Lucide `Send` icon, label "Enviar") with no `onClick` handler
- [x] 5.5 Rearrange the footer to render buttons in order: Like · Comment · Share · Send, with consistent spacing/styling matching the reference design

## 6. Verification

- [x] 6.1 Manually test: like a post, refresh page, confirm count and state persist
- [x] 6.2 Manually test: like as user A, view same post as user B — confirm independent state
- [x] 6.3 Manually test: open share modal, click a platform icon, confirm share URL opens correctly
- [x] 6.4 Manually test: click Comment button and confirm the comment panel still toggles correctly
- [x] 6.5 Confirm Send button renders and is inert (no errors on click)
- [x] 6.6 Confirm unauthenticated user sees the action bar but gets a toast on like attempt
