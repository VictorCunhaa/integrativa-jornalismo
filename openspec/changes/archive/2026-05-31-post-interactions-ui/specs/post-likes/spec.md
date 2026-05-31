## ADDED Requirements

### Requirement: Authenticated user can like a post
An authenticated user SHALL be able to toggle a like on any published post. Liking an already-liked post SHALL remove the like (toggle behavior). Each user MAY like a given post at most once at any time.

#### Scenario: User likes a post
- **WHEN** an authenticated user clicks the Like button on a post they have not yet liked
- **THEN** the like is persisted in the database, the like count increments by 1, and the button reflects the active/liked state

#### Scenario: User unlikes a post
- **WHEN** an authenticated user clicks the Like button on a post they have already liked
- **THEN** the like is removed from the database, the like count decrements by 1, and the button returns to the inactive state

#### Scenario: Optimistic update on like toggle
- **WHEN** an authenticated user clicks the Like button
- **THEN** the UI SHALL update instantly (optimistic), and reconcile with the server response on settle

#### Scenario: Unauthenticated user attempts to like
- **WHEN** an unauthenticated user clicks the Like button
- **THEN** a toast notification SHALL inform the user to log in, and no API call is made

### Requirement: Like count is visible to all users
The like count for a post SHALL be displayed next to the Like button and SHALL be visible to both authenticated and unauthenticated users.

#### Scenario: Post with zero likes
- **WHEN** a post has no likes
- **THEN** the count is either hidden or displays "0"

#### Scenario: Post with multiple likes
- **WHEN** a post has one or more likes
- **THEN** the count displays the correct integer next to the Like button

### Requirement: Like state is user-specific
The Like button SHALL reflect whether the currently authenticated user has liked the post. Different users viewing the same post SHALL see their own like state independently.

#### Scenario: User sees their own like state
- **WHEN** an authenticated user views a post they have liked
- **THEN** the Like button is in the active/filled state

#### Scenario: User sees unliked state for unliked post
- **WHEN** an authenticated user views a post they have not liked
- **THEN** the Like button is in the inactive/outline state

### Requirement: Like data is persisted via backend
The backend SHALL expose a `POST /posts/{id}/like` endpoint that toggles the like state for the authenticated user. The endpoint SHALL return the updated `like_count` and `liked_by_me` boolean.

#### Scenario: Toggle like via API
- **WHEN** a `POST /posts/{id}/like` request is made with a valid JWT
- **THEN** the server responds with `{ "liked": bool, "like_count": int }` and HTTP 200

#### Scenario: Unauthenticated API request
- **WHEN** a `POST /posts/{id}/like` request is made without a valid JWT
- **THEN** the server responds with HTTP 401
