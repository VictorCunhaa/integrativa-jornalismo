## ADDED Requirements

### Requirement: Profile page displays user identity
The system SHALL render a profile page at `/profile/:username` showing the user's banner image, avatar, display name, username, and bio. If `banner_url` is null the system SHALL show a solid color placeholder. If `bio` is null the system SHALL show nothing in the bio area.

#### Scenario: Full profile renders all identity fields
- **WHEN** a user with avatar, banner, name, username, and bio visits `/profile/jornalista`
- **THEN** the page displays the banner image, circular avatar, display name, `@username`, and bio text

#### Scenario: Profile with missing banner shows placeholder
- **WHEN** a user has no `banner_url` set
- **THEN** the banner area renders a solid sky-700 colored background instead of an image

#### Scenario: Profile with missing bio shows no bio section
- **WHEN** a user has no `bio` set
- **THEN** the bio area is not rendered on the page

### Requirement: Profile page displays user posts feed
The system SHALL display a chronological feed of the user's published posts on their profile page, showing the 10 most recent posts. Each post SHALL render using the existing `PostCard` component. A "Ver mais" button SHALL appear when there are more than 10 posts.

#### Scenario: Author with posts shows feed
- **WHEN** a user with published posts has their profile viewed
- **THEN** the main content area shows up to 10 posts ordered by most recent first

#### Scenario: Author with no posts shows empty state
- **WHEN** a user has no published posts
- **THEN** the main content area shows an empty state message: "Nenhuma publicação ainda."

#### Scenario: Feed with more than 10 posts shows load more
- **WHEN** a user has more than 10 published posts
- **THEN** a "Ver mais" button appears below the initial 10 posts and loads the next 10 when clicked

### Requirement: Profile page has a sidebar with interests
The system SHALL display a sidebar showing the user's areas of interest derived from the categories of their published posts. Interests SHALL be displayed as tag chips. If the user has no posts, the sidebar SHALL show no interests.

#### Scenario: Sidebar shows derived interest tags
- **WHEN** a user has published posts with categories
- **THEN** the sidebar displays unique category tags as chips

#### Scenario: Sidebar shows no interests for user without posts
- **WHEN** a user has no published posts
- **THEN** the interests section is empty or hidden

### Requirement: Profile page has a groups placeholder in sidebar
The system SHALL display a "Grupos" section in the sidebar with a lock icon and "Em breve" label, indicating the feature is not yet available.

#### Scenario: Groups section shows "Em breve" placeholder
- **WHEN** any profile page is viewed
- **THEN** the sidebar contains a "Grupos" section with a lock icon and "Em breve" text

### Requirement: Profile page is responsive
The system SHALL render the profile in a two-column layout on desktop (main content + sidebar) and in a single-column layout on mobile (sidebar stacked below main content).

#### Scenario: Desktop shows two-column layout
- **WHEN** the profile page is viewed on a screen width >= 1024px
- **THEN** the main content and sidebar are displayed side by side

#### Scenario: Mobile shows single-column layout
- **WHEN** the profile page is viewed on a screen width < 1024px
- **THEN** the sidebar is stacked below the main content in a single column

### Requirement: Profile page returns 404 for unknown username
The system SHALL return a 404 Not Found page when the requested username does not exist.

#### Scenario: Unknown username returns 404
- **WHEN** a visitor navigates to `/profile/nonexistent-user`
- **THEN** the system returns a 404 page with appropriate messaging
