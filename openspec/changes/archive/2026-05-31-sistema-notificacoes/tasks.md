## 1. Backend — Modelo e Migration

- [x] 1.1 Criar modelo ORM `Notification` em `backend/app/models/notification.py` com campos: `id`, `user_id` (FK → users), `type` (enum: `challenge`, `like`, `group_invite`), `title`, `body`, `metadata` (JSON), `is_read`, `created_at`
- [x] 1.2 Importar o modelo em `backend/app/models/__init__.py` para que o Alembic o detecte
- [x] 1.3 Gerar migration Alembic: `alembic revision --autogenerate -m "add notifications table"`
- [x] 1.4 Aplicar migration: `alembic upgrade head`

## 2. Backend — Schemas Pydantic

- [x] 2.1 Criar `backend/app/schemas/notification.py` com schemas `NotificationOut` (resposta da API) e `ReadAllResponse`

## 3. Backend — Router de Notificações

- [x] 3.1 Criar `backend/app/routers/notifications.py` com rota `GET /notifications` (retorna 20 mais recentes do usuário autenticado, ordenadas por `created_at DESC`)
- [x] 3.2 Adicionar rota `POST /notifications/read-all` que define `is_read = True` para todas as notificações do usuário e retorna `{"marked": N}`
- [x] 3.3 Registrar o router em `backend/app/main.py`
- [x] 3.4 Adicionar índice composto `(user_id, is_read)` na tabela via migration ou direto no modelo

## 4. Backend — Triggers de Criação de Notificação

- [x] 4.1 No router `backend/app/routers/posts.py`, no endpoint `POST /posts/{id}/like`: após inserir o like, se `liked == True` e autor ≠ liker, verificar duplicata e inserir notificação do tipo `like` com `metadata = {post_id, liker_name, post_title}`
- [x] 4.2 No router `backend/app/routers/groups.py`, no endpoint de adicionar membro: inserir notificação do tipo `group_invite` para o usuário convidado com `metadata = {group_id, group_name}`

## 5. Frontend — Hook `useNotifications`

- [x] 5.1 Criar `frontend/src/hooks/useNotifications.ts` com query TanStack Query para `GET /notifications` com `refetchInterval: 30_000`
- [x] 5.2 Exportar `notifications` (array), `unreadCount` (número de `is_read === false`) e `markAllRead` (mutation para `POST /notifications/read-all`)

## 6. Frontend — Componente `NotificationPanel`

- [x] 6.1 Criar `frontend/src/components/layout/NotificationPanel.tsx` usando Radix `Popover` com `align="end"`
- [x] 6.2 Implementar layout do painel: cabeçalho "Notificações", seção "Desafios" (itens com título à esquerda e tempo restante à direita), divisor `<hr>`, seção de notificações gerais
- [x] 6.3 Implementar helper `formatTimeRemaining(deadline: string): string` que retorna "Xd Yh restantes" ou "Encerrado"
- [x] 6.4 Implementar item de like: texto "**[nome]** curtiu sua matéria **[título]**"
- [x] 6.5 Implementar item de convite: texto "Você foi convidado para o grupo **[nome]**"
- [x] 6.6 Aplicar `max-height` equivalente a 5 itens e `overflow-y-auto` para scrollbar automática
- [x] 6.7 Chamar `markAllRead()` no `onOpenChange` quando `open === true`

## 7. Frontend — Integração na Navbar

- [x] 7.1 Em `frontend/src/components/layout/Navbar.tsx`, importar `NotificationPanel` e `useNotifications`
- [x] 7.2 Inserir `<NotificationPanel>` imediatamente antes do botão de avatar do usuário, visível apenas quando autenticado
- [x] 7.3 Exibir badge vermelho sobre o sino quando `unreadCount > 0` (texto: `unreadCount > 99 ? "99+" : unreadCount`)

## 8. Verificação

- [ ] 8.1 Testar fluxo completo: dar like em um post → abrir painel → verificar item aparece → badge some ao abrir
- [ ] 8.2 Testar com 6+ notificações e confirmar scrollbar aparece
- [ ] 8.3 Testar seção de desafios com deadline futuro e verificar formatação de tempo restante
- [ ] 8.4 Testar convite de grupo → notificação aparece para o convidado
- [ ] 8.5 Verificar que o sino não aparece para usuários não autenticados
