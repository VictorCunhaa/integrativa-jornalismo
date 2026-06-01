## Context

O projeto UniPauta é uma plataforma React 18 + FastAPI com MySQL. Atualmente não existe nenhum sistema de notificações persistentes — feedback ao usuário é feito exclusivamente via toasts Sonner (efêmeros). A Navbar renderiza avatar do usuário via Radix `DropdownMenu` com Zustand para estado de auth. O backend expõe uma REST API com TanStack Query no frontend. A adição de notificações exige: (1) nova tabela no banco, (2) novo router no backend, (3) triggers de criação de notificação em eventos existentes, e (4) novo componente frontend integrado à Navbar.

## Goals / Non-Goals

**Goals:**
- Persistir notificações no banco de dados por usuário autenticado.
- Exibir ícone `Bell` com badge de não-lidas na Navbar, ao lado do avatar.
- Painel dropdown com scrollbar (máx. 5 itens visíveis), dividido em Desafios e Outras notificações.
- Desafios: título + tempo restante formatado no canto direito.
- Outras: curtidas em posts, convites para grupos.
- Marcar todas como lidas ao abrir o painel (`read-all` na abertura).
- Polling leve a cada 30s para atualizar badge sem WebSocket.

**Non-Goals:**
- Notificações push/WebSocket em tempo real (v1 usa polling).
- Notificações de compartilhamento (endpoint de share não existe ainda).
- E-mail ou notificações fora da plataforma.
- Paginação de notificações (limite de 20 mais recentes).

## Decisions

### D1 — Polling vs. WebSocket
**Decisão:** Polling via TanStack Query (`refetchInterval: 30_000`).  
**Alternativa considerada:** WebSocket com FastAPI (`websockets` lib).  
**Rationale:** WebSocket adiciona complexidade de infraestrutura (conexão persistente, autenticação no upgrade, reconexão). Para v1, polling a cada 30s é suficiente — notificações não são críticas em tempo real. Migrar para WebSocket posteriormente é possível sem alterar o contrato do componente.

### D2 — Componente de painel: Radix Popover vs. DropdownMenu
**Decisão:** Radix `Popover` com posicionamento `align="end"`.  
**Alternativa considerada:** `DropdownMenu` (já usado pelo avatar).  
**Rationale:** `DropdownMenu` fecha ao clicar em qualquer item; `Popover` permite scrollbar interna e interação com itens sem fechar. Comportamento mais adequado para uma lista scrollável.

### D3 — Modelo de notificação
**Decisão:** Tabela `notifications` com campos: `id`, `user_id` (destinatário), `type` (enum: `challenge`, `like`, `group_invite`), `title`, `body`, `metadata` (JSON — ex.: `{post_id, challenge_id, group_id, deadline}`), `is_read`, `created_at`.  
**Alternativa considerada:** Tabelas separadas por tipo de notificação.  
**Rationale:** Tabela única com `type` + `metadata` JSON é mais simples de manter e extensível sem migrations adicionais para novos tipos.

### D4 — Criação de notificações: sincrona vs. assíncrona
**Decisão:** Criação síncrona dentro da mesma transação do evento (ex.: ao dar like, inserir notificação na mesma requisição).  
**Alternativa considerada:** Fila de tarefas (Celery/ARQ).  
**Rationale:** Fila adiciona dependência de broker (Redis). Volume esperado é baixo. Síncrono é mais simples e suficiente para MVP.

### D5 — Tempo restante de desafio
**Decisão:** `deadline` armazenado em `metadata` JSON; cálculo de tempo restante feito no frontend (`deadline - now`, formatado como "Xd Yh restantes").  
**Rationale:** Evita lógica de formatação no backend e mantém o backend agnóstico ao fuso horário do cliente.

## Risks / Trade-offs

- **[Risco] Notificações de like duplicadas** se o usuário der unlike e relikar várias vezes → Mitigação: ao criar notificação de like, checar se já existe notificação não-lida do mesmo tipo para o mesmo `(user_id, post_id)` e ignorar se existir.
- **[Risco] Polling aumenta carga no banco** → Mitigação: endpoint `GET /notifications/unread-count` retorna apenas um inteiro; só busca lista completa ao abrir o painel. Query com índice em `(user_id, is_read)`.
- **[Risco] Migrations em produção** → Mitigação: migration Alembic `nullable=True` em todos os campos novos; rollback = `DROP TABLE notifications`.
- **[Trade-off] Polling de 30s significa atraso máximo de 30s** → Aceitável para v1; WebSocket resolve em versão futura.

## Migration Plan

1. Gerar migration Alembic: `alembic revision --autogenerate -m "add notifications table"`.
2. Aplicar: `alembic upgrade head` (ambiente de dev via Docker).
3. Deploy do router `/notifications` no FastAPI (`app/main.py`).
4. Deploy dos hooks de criação nos routers existentes (`posts`, `groups`).
5. Deploy do frontend (componente + hook).
6. Rollback: `alembic downgrade -1` remove a tabela; remover imports do router.

## Open Questions

- Notificações de convite de grupo devem linkar direto para a página do grupo ou para uma página de confirmação de convite? (Assumido: link para `/groups/{id}`)
- Qual o limite de notificações retidas por usuário? (Assumido: 50 mais recentes, as mais antigas são descartadas automaticamente via `DELETE WHERE id NOT IN (SELECT id ORDER BY created_at DESC LIMIT 50)`.)
