### Requirement: Bell icon in Navbar
O sistema SHALL exibir um ícone de sino (`Bell` do Lucide) na Navbar, posicionado imediatamente à esquerda do avatar de perfil do usuário autenticado.

#### Scenario: Bell icon visible when authenticated
- **WHEN** o usuário está autenticado e acessa qualquer página com a Navbar
- **THEN** o ícone de sino é exibido à esquerda do avatar na seção direita da Navbar

#### Scenario: Bell icon hidden when unauthenticated
- **WHEN** o usuário não está autenticado
- **THEN** o ícone de sino NÃO é exibido na Navbar

### Requirement: Unread count badge
O sistema SHALL exibir um badge vermelho com a contagem de notificações não-lidas sobre o ícone de sino quando houver ao menos uma notificação não-lida.

#### Scenario: Badge appears with unread notifications
- **WHEN** o usuário possui 1 ou mais notificações não-lidas
- **THEN** o badge é exibido sobre o sino com o número de não-lidas (máx. exibido: "99+")

#### Scenario: Badge hidden when all read
- **WHEN** o usuário não possui notificações não-lidas
- **THEN** o badge NÃO é exibido

### Requirement: Notification panel opens on bell click
O sistema SHALL abrir um painel (Popover) ao clicar no ícone de sino, ancorado abaixo do ícone com alinhamento à direita.

#### Scenario: Panel opens on click
- **WHEN** o usuário clica no ícone de sino
- **THEN** o painel de notificações é exibido abaixo do ícone

#### Scenario: Panel closes on outside click
- **WHEN** o painel está aberto e o usuário clica fora dele
- **THEN** o painel é fechado

### Requirement: Notifications marked as read on panel open
O sistema SHALL marcar todas as notificações do usuário como lidas (chamando `POST /notifications/read-all`) no momento em que o painel é aberto.

#### Scenario: Read-all on open
- **WHEN** o painel de notificações é aberto
- **THEN** uma requisição `POST /notifications/read-all` é enviada e o badge some

### Requirement: Panel scrolls after 5 items
O painel SHALL ter altura máxima correspondente a 5 itens visíveis e exibir scrollbar vertical quando houver mais de 5 notificações.

#### Scenario: Scrollbar appears with 6+ notifications
- **WHEN** o usuário possui 6 ou mais notificações
- **THEN** o painel exibe scrollbar e limita a altura a ~5 itens visíveis

#### Scenario: No scrollbar with 5 or fewer
- **WHEN** o usuário possui 5 ou menos notificações
- **THEN** o painel exibe todos os itens sem scrollbar

### Requirement: Challenge notifications section
O painel SHALL exibir uma seção "Desafios" no topo, contendo notificações do tipo `challenge`, cada uma com título do desafio à esquerda e tempo restante até o prazo formatado à direita da linha.

#### Scenario: Challenge item layout
- **WHEN** existe ao menos uma notificação do tipo `challenge`
- **THEN** a seção "Desafios" é exibida com cabeçalho, e cada item mostra título à esquerda e tempo restante ("Xd Yh" ou "Encerrado") à direita

#### Scenario: No challenge section when empty
- **WHEN** não há notificações do tipo `challenge`
- **THEN** a seção "Desafios" NÃO é exibida

### Requirement: General notifications section
O painel SHALL exibir uma seção de notificações gerais (curtidas e convites de grupo) separada da seção de desafios por um divisor (`<hr>`), abaixo dos desafios.

#### Scenario: Divider between sections
- **WHEN** existem notificações de desafio E notificações gerais
- **THEN** um divisor horizontal é exibido entre as duas seções

#### Scenario: Like notification text
- **WHEN** existe uma notificação do tipo `like`
- **THEN** o item exibe texto no formato "**[nome]** curtiu sua matéria **[título do post]**"

#### Scenario: Group invite notification text
- **WHEN** existe uma notificação do tipo `group_invite`
- **THEN** o item exibe texto no formato "Você foi convidado para o grupo **[nome do grupo]**"

### Requirement: GET /notifications endpoint
O sistema SHALL expor `GET /notifications` (autenticado) retornando as 20 notificações mais recentes do usuário, ordenadas por `created_at DESC`.

#### Scenario: Returns user notifications
- **WHEN** usuário autenticado faz GET /notifications
- **THEN** recebe array JSON com até 20 notificações, campos: `id`, `type`, `title`, `body`, `metadata`, `is_read`, `created_at`

#### Scenario: Returns empty array when no notifications
- **WHEN** usuário autenticado não possui notificações
- **THEN** recebe array vazio `[]`

### Requirement: POST /notifications/read-all endpoint
O sistema SHALL expor `POST /notifications/read-all` (autenticado) que define `is_read = true` para todas as notificações do usuário.

#### Scenario: Marks all as read
- **WHEN** usuário faz POST /notifications/read-all
- **THEN** todas as notificações do usuário são marcadas como lidas e a resposta retorna `{"marked": N}`

### Requirement: Notification created on like
O sistema SHALL criar uma notificação do tipo `like` para o autor do post quando outro usuário der like, desde que não exista notificação não-lida do mesmo tipo para o mesmo post do mesmo remetente.

#### Scenario: Notification created on first like
- **WHEN** usuário A dá like no post de usuário B
- **THEN** uma notificação `like` é criada para usuário B com `metadata.post_id` e `metadata.liker_name`

#### Scenario: No duplicate notification
- **WHEN** usuário A dá unlike e relikar no mesmo post
- **THEN** apenas uma notificação não-lida de like existe para aquele post/remetente

#### Scenario: No self-notification
- **WHEN** o autor do post dá like no próprio post
- **THEN** nenhuma notificação é criada

### Requirement: Notification created on group invite
O sistema SHALL criar uma notificação do tipo `group_invite` para o usuário convidado quando ele for adicionado a um grupo.

#### Scenario: Notification on invite
- **WHEN** um usuário é adicionado a um grupo
- **THEN** uma notificação `group_invite` é criada para o convidado com `metadata.group_id` e `metadata.group_name`

### Requirement: Notification created on challenge
O sistema SHALL criar uma notificação do tipo `challenge` para todos os membros do grupo (exceto o professor criador) quando um novo desafio for criado.

#### Scenario: Notification on challenge creation
- **WHEN** um professor cria um desafio em um grupo
- **THEN** uma notificação `challenge` é criada para cada membro do grupo com o título do desafio e o prazo no payload

### Requirement: Frontend polling for unread count
O frontend SHALL consultar `GET /notifications` a cada 30 segundos para manter o badge atualizado.

#### Scenario: Badge updates after polling
- **WHEN** o usuário recebe uma nova notificação e o intervalo de 30s passa
- **THEN** o badge é atualizado com a nova contagem sem recarregar a página
