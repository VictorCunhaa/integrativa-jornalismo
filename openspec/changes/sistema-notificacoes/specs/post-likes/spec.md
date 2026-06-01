## MODIFIED Requirements

### Requirement: Like data is persisted via backend
The backend SHALL expose a `POST /posts/{id}/like` endpoint that toggles the like state for the authenticated user. The endpoint SHALL return the updated `like_count` and `liked_by_me` boolean. Additionally, when a like is added (not removed), the backend SHALL create a `like` notification for the post author, unless the liker is the author themselves or an unread notification for the same liker/post pair already exists.

#### Scenario: Toggle like via API
- **WHEN** a `POST /posts/{id}/like` request is made with a valid JWT
- **THEN** the server responds with `{ "liked": bool, "like_count": int }` and HTTP 200

#### Scenario: Unauthenticated API request
- **WHEN** a `POST /posts/{id}/like` request is made without a valid JWT
- **THEN** the server responds with HTTP 401

#### Scenario: Notification created when liking
- **WHEN** user A likes a post authored by user B (A ≠ B) and no unread like notification exists for that pair
- **THEN** a notification of type `like` is inserted for user B with `metadata.post_id` and `metadata.liker_name`

#### Scenario: No notification on unlike
- **WHEN** user A removes their like from a post
- **THEN** no new notification is created

#### Scenario: No self-notification on like
- **WHEN** the post author likes their own post
- **THEN** no notification is created
