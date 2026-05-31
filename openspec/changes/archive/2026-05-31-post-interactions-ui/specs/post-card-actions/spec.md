## ADDED Requirements

### Requirement: Post card displays four action buttons
Each post card footer SHALL display four action buttons in order: Like, Comment, Share, Send. All four buttons SHALL be visible regardless of authentication state.

#### Scenario: Action bar renders all four buttons
- **WHEN** a post card is rendered
- **THEN** the footer displays Like, Comment, Share, and Send buttons with their respective icons and labels

### Requirement: Comment button uses speech-bubble icon
The Comment button SHALL use the `MessageSquare` icon (Lucide) to match the flat speech-bubble style in the design reference.

#### Scenario: Comment button icon
- **WHEN** a post card is rendered
- **THEN** the comment button displays a `MessageSquare` icon and the label "Comentar"

### Requirement: Share button opens platform modal
Clicking the Share button SHALL open a modal dialog containing icons/links for Instagram, LinkedIn, WhatsApp, and X (Twitter). The modal is UI-only; clicking a platform icon constructs a share URL using the current post's URL.

#### Scenario: Share modal opens
- **WHEN** a user clicks the Share button
- **THEN** a modal opens displaying platform options: Instagram, LinkedIn, WhatsApp, X

#### Scenario: Share modal closes
- **WHEN** a user clicks outside the modal or a close button
- **THEN** the modal closes

#### Scenario: Platform link construction
- **WHEN** a user clicks a platform icon inside the share modal
- **THEN** the browser opens the platform's share URL with the post URL as the shared link

### Requirement: Send button is present but non-functional
The Send button SHALL render with the `Send` (paper-airplane) Lucide icon and the label "Enviar". It SHALL have no click handler in this iteration.

#### Scenario: Send button renders
- **WHEN** a post card is rendered
- **THEN** the Send button is visible with the correct icon and label, and clicking it has no effect
