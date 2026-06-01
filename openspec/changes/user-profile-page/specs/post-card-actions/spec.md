## MODIFIED Requirements

### Requirement: Post card displays four action buttons
Each post card footer SHALL display four action buttons in order: Like, Comment, Share, Send. All four buttons SHALL be visible regardless of authentication state. The format badge on each post card SHALL use journalistic labels: Matéria (text), Fotorreportagem (photo), Podcast (audio), Vídeo (video), Multimídia (mixed). All interactive elements (buttons, badges) that use the primary color SHALL reflect the global sky-700 theme defined in `globals.css`. The author name displayed on each post card SHALL be a link that navigates to `/profile/:username` where `:username` is the post author's username.

#### Scenario: Action bar renders all four buttons
- **WHEN** a post card is rendered
- **THEN** the footer displays Like, Comment, Share, and Send buttons with their respective icons and labels

#### Scenario: Format badge uses journalistic label
- **WHEN** a post card is rendered
- **THEN** the format badge displays the journalistic label corresponding to the post format (e.g., "Podcast" for audio posts, "Fotorreportagem" for photo posts)

#### Scenario: Primary color reflects sky-700 theme
- **WHEN** any interactive element using primary color is rendered in a post card
- **THEN** the element displays the sky-700 blue color consistent with the global theme

#### Scenario: Author name links to profile page
- **WHEN** a post card is rendered with an author
- **THEN** the author name is a clickable link that navigates to `/profile/:username` for that author
