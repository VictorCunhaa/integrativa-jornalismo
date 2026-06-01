## ADDED Requirements

### Requirement: Seed popula todos os usuários de demo
O sistema SHALL criar 8 usuários de demo cobrindo todos os `account_type` disponíveis (student, professor, professional, alumni), com `display_name`, `bio`, `avatar_url` e `cover_url` preenchidos usando imagens estáticas de `frontend/public/`. Todos os usuários SHALL ter senha `demo1234`.

#### Scenario: Usuários criados com tipos distintos
- **WHEN** o seed é executado
- **THEN** o banco deve conter ao menos 2 usuários de cada `account_type`: student, professor, professional, alumni

#### Scenario: Campos de perfil preenchidos
- **WHEN** o seed é executado
- **THEN** cada usuário deve ter `bio` não nula, `avatar_url` apontando para uma imagem em `/public/`, e `cover_url` apontando para um banner em `/public/`

### Requirement: Seed popula interesses dos usuários
O sistema SHALL vincular cada usuário a 3–5 interesses via tabela `user_interests`.

#### Scenario: Interesses vinculados
- **WHEN** o seed é executado
- **THEN** a tabela `user_interests` deve ter registros para todos os 8 usuários

### Requirement: Seed popula posts cobrindo todos os formatos e editorias
O sistema SHALL criar ao menos 20 posts, distribuindo:
- Todos os 5 formatos: `text`, `photo`, `audio`, `video`, `mixed`
- Todas as 10 editorias
- Todas as 3 visibilidades: `public`, `restricted`, `private`
- `cover_url` preenchido usando imagens de `frontend/public/`

#### Scenario: Todos os formatos representados
- **WHEN** o seed é executado
- **THEN** existem posts com `format` igual a `text`, `photo`, `audio`, `video` e `mixed`

#### Scenario: Todas as editorias representadas
- **WHEN** o seed é executado
- **THEN** cada editoria possui ao menos 1 post publicado (`published_at` não nulo)

#### Scenario: Visibilidades variadas
- **WHEN** o seed é executado
- **THEN** existem posts `public`, `restricted` e `private`

### Requirement: Seed popula post_media para posts com fotos
O sistema SHALL criar registros em `post_media` para todos os posts de formato `photo` ou `mixed`, com `media_type = 'image'`, `caption` e `credit` preenchidos.

#### Scenario: Mídia vinculada a posts fotográficos
- **WHEN** o seed é executado
- **THEN** todos os posts de formato `photo` ou `mixed` possuem ao menos 1 registro em `post_media`

### Requirement: Seed popula likes distribuídos
O sistema SHALL criar ao menos 40 likes (`post_likes`) distribuídos entre múltiplos usuários e posts, respeitando a constraint única `(user_id, post_id)`.

#### Scenario: Likes cruzados entre usuários
- **WHEN** o seed é executado
- **THEN** ao menos 5 posts distintos têm likes de 3 ou mais usuários diferentes

### Requirement: Seed popula comentários
O sistema SHALL criar ao menos 25 comentários distribuídos entre posts e usuários.

#### Scenario: Comentários em múltiplos posts
- **WHEN** o seed é executado
- **THEN** ao menos 10 posts distintos possuem comentários

### Requirement: Seed popula grupos com membros
O sistema SHALL criar 3 grupos, cada um com 1 owner e ao menos 3 membros adicionais.

#### Scenario: Grupos criados com membros
- **WHEN** o seed é executado
- **THEN** existem 3 grupos, cada um com registros em `group_members` (owner + membros)

### Requirement: Seed popula desafios com submissões e notas
O sistema SHALL criar ao menos 5 desafios distribuídos entre os grupos, com `due_at` e `description_html` preenchidos. Para cada desafio, SHALL existir ao menos 2 submissões de estudantes com `grade` atribuída por um professor.

#### Scenario: Desafios com submissões avaliadas
- **WHEN** o seed é executado
- **THEN** ao menos 8 `challenge_submissions` possuem `grade` não nula e `graded_by` preenchido

### Requirement: Seed popula notificações de todos os tipos
O sistema SHALL criar ao menos 15 notificações cobrindo os 3 tipos: `challenge`, `like`, `group_invite`. As notificações devem ser distribuídas entre diferentes usuários, com algumas marcadas como lidas (`is_read = true`) e outras não.

#### Scenario: Todos os tipos de notificação presentes
- **WHEN** o seed é executado
- **THEN** existem notificações com `type` igual a `challenge`, `like` e `group_invite`

#### Scenario: Mix de lidas e não lidas
- **WHEN** o seed é executado
- **THEN** ao menos 5 notificações têm `is_read = false` e ao menos 3 têm `is_read = true`

### Requirement: Seed é idempotente
O sistema SHALL limpar todos os dados existentes antes de recriar os dados de demo, executando DELETEs em ordem de dependência de FK para evitar violations.

#### Scenario: Execução repetida sem erro
- **WHEN** o seed é executado mais de uma vez
- **THEN** não ocorre erro de FK violation ou duplicate key, e o banco fica com exatamente os dados definidos no seed
