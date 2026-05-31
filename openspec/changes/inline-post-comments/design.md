## Context

O feed do projeto é construído com React + TanStack Query. Cada post é renderizado por `PostCard.tsx`. Comentários existem como feature completa na página de detalhes (`PostDetailPage` + `CommentList`), mas o feed nunca carregou comentários — o botão "Comentar" era apenas um link de navegação. O backend já expõe `GET /posts/:id/comments?page=1&size=N` e `POST /posts/:id/comments`, sem nenhuma mudança necessária.

## Goals / Non-Goals

**Goals:**
- Permitir visualizar os 2 comentários mais recentes diretamente no card do feed.
- Permitir submeter um novo comentário sem sair do feed.
- Carregar dados de comentários de forma lazy (somente quando o painel for aberto).
- Preservar o comportamento existente de "Mostrar mais" → `/post/:id#comments`.

**Non-Goals:**
- Paginação completa inline (fica na página de detalhes).
- Edição ou exclusão de comentários inline.
- Alterações no backend.
- Alterações em `CommentList` ou `PostDetailPage`.

## Decisions

### 1. Lazy-load via `enabled` flag (não pré-carregar)

Pré-carregar comentários de todos os cards no feed adicionaria N requests desnecessários. A query é habilitada somente quando `showComments === true`.

**Alternativa considerada:** Pré-carregar ao montar o card (eager). Descartado pelo custo de rede e por não agregar valor quando o usuário nunca abre o painel.

### 2. Hook dedicado `useCommentPreview`

Em vez de reutilizar `useComments` diretamente com parâmetros espalhados no componente, encapsulamos a lógica em `useCommentPreview(postId, enabled)` — `size=2`, `page=1`, habilitado por flag. Mantém `PostCard` limpo e facilita testes.

**Alternativa considerada:** Passar `enabled` direto para `useComments`. Possível, mas expõe detalhe de implementação (`page`, `size`) no componente.

### 3. Estado local no `PostCard` (`useState`)

O toggle `showComments` é estado UI efêmero, local a cada card. Não precisa de estado global nem de cache de query para controlar visibilidade.

### 4. Estrutura do painel inline (sem novo componente de arquivo)

O painel é simples o suficiente para ser JSX inline dentro do `PostCard`, abaixo do `<Separator>`. Se crescer (ex.: deletar comentário inline), pode ser extraído para `CommentPreviewPanel.tsx`.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Muitos painéis abertos simultaneamente pesam o DOM | Aceitável no feed paginado (20 itens); pode-se fechar o painel ao navegar se necessário |
| `comment_count` no card pode ficar desatualizado entre aberturas | `useCreateComment` já invalida `['post', postId]`, que atualiza o feed via `['feed']` se invalidado também — garantir que `onSuccess` invalide `['feed']` |
| Textarea sem autoresize pode parecer pequena em mobile | Usar `rows=2` com `resize-none` e estilo consistente com o restante do app |
