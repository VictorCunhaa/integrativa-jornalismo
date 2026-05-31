## Why

The post feed currently lacks social interaction mechanisms beyond commenting, making engagement feel incomplete compared to standard social/journalism platforms. Adding visible like, share, and action buttons transforms the feed into a more interactive experience and aligns the UI with the reference design (LinkedIn-style action bar).

## What Changes

- Add a fully functional **like/reaction button** on each post card (heart/thumbs-up count, toggle on/off, persisted per user)
- Add a **share button** that opens a modal with platform icons (Instagram, LinkedIn, WhatsApp, X/Twitter) — UI only, no deep integration required yet
- Update the **comment button icon** to use a speech-bubble style matching the reference image
- Add a **send/forward button** icon (UI only, no functionality required yet)
- Rearrange the footer action bar to show all four actions: Like · Comment · Share · Send

## Capabilities

### New Capabilities
- `post-likes`: Allows authenticated users to like/unlike posts; displays aggregate like count per post; persisted in the backend with a likes model and REST endpoint

### Modified Capabilities
- `post-card-actions`: The PostCard footer action bar gains three new buttons (like, share, send) and the comment icon is updated to match the new design

## Impact

- **Frontend**: `PostCard.tsx` action bar refactored; new `ShareModal.tsx` component; new `useLikes` hook in `usePosts.ts`
- **Backend**: New `PostLike` model, Alembic migration, and `/posts/{id}/like` toggle endpoint
- **Database**: New `post_likes` join table (user_id, post_id, unique constraint)
- **No breaking changes** to existing comment or post APIs
