## Why

A plataforma UniPauta não possui nenhum mecanismo de notificações persistentes — eventos relevantes como curtidas em posts, compartilhamentos, convites para grupos e desafios pendentes só chegam ao usuário via toasts transitórios ou não chegam de forma alguma. Um sistema de notificações na navbar permite que o usuário acompanhe atividades importantes sem perder contexto.

## What Changes

- Adicionar ícone de sino (`Bell`) ao lado do avatar de perfil na Navbar, com badge de contagem de não-lidas.
- Ao clicar no sino, abrir um painel dropdown abaixo do ícone mostrando a lista de notificações.
- Painel dividido em duas seções: **Desafios** (com título e tempo restante à direita) e **Outras notificações** (curtidas, compartilhamentos, convites de grupo), separadas por um divisor visual.
- Scrollbar aparece automaticamente quando há mais de 5 itens no painel.
- Marcar notificações como lidas ao abrir o painel (ou ao clicar em cada item).
- Backend: modelo `Notification`, endpoint `GET /notifications`, `POST /notifications/{id}/read` e `POST /notifications/read-all`.
- Backend: criação de notificações internamente quando ocorrem eventos (like, group invite, challenge deadline).

## Capabilities

### New Capabilities
- `notifications`: Sistema de notificações persistentes com painel na navbar, segmentação por tipo (desafio vs. geral), badge de contagem de não-lidas e marcação de leitura.

### Modified Capabilities
- `post-likes`: Ao ocorrer um like, criar uma notificação para o autor do post.

## Impact

- **Frontend**: `Navbar.tsx` recebe novo ícone + painel dropdown; novo componente `NotificationPanel`; novo hook `useNotifications`.
- **Backend**: Novo modelo ORM `Notification`; nova migration Alembic; novo router `notifications`; hooks nos routers de posts (like) e groups (invite, challenge).
- **Banco de dados**: Nova tabela `notifications`.
- **Autenticação**: Notificações são por usuário autenticado; sem impacto no fluxo de auth.
