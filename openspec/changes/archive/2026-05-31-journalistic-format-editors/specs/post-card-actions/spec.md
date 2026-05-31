## MODIFIED Requirements

### Requirement: Post card displays four action buttons
Each post card footer SHALL display four action buttons in order: Like, Comment, Share, Send. All four buttons SHALL be visible regardless of authentication state. The format badge on each post card SHALL use journalistic labels: Matéria (text), Fotorreportagem (photo), Podcast (audio), Vídeo (video), Multimídia (mixed).

#### Scenario: Action bar renders all four buttons
- **WHEN** a post card is rendered
- **THEN** the footer displays Like, Comment, Share, and Send buttons with their respective icons and labels

#### Scenario: Format badge uses journalistic label
- **WHEN** a post card is rendered
- **THEN** the format badge displays the journalistic label corresponding to the post format (e.g., "Podcast" for audio posts, "Fotorreportagem" for photo posts)
