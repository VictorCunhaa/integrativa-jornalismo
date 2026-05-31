## Context

O feed do projeto é construído com React + TanStack Query. Toda a UI já usa **shadcn/ui** como biblioteca de componentes — `Card`, `Button`, `Avatar`, `Separator`, `Badge` e `Textarea` já estão presentes no projeto. Cada post é renderizado por `PostCard.tsx`. Comentários existem como feature completa na página de detalhes (`PostDetailPage` + `CommentList`), mas o feed nunca carregou comentários — o botão "Comentar" era apenas um link de navegação. O backend já expõe `GET /posts/:id/comments?page=1&size=N` e `POST /posts/:id/comments`, sem nenhuma mudança necessária.

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

### 4. Componentes shadcn/ui para toda a UI do painel

Todos os elementos visuais do painel DEVEM usar componentes shadcn/ui já disponíveis no projeto — sem CSS customizado nem elementos HTML crus:

| Elemento | Componente shadcn/ui |
|----------|----------------------|
| Container do painel | `<Card>` / seção dentro do card existente |
| Avatar do comentarista | `<Avatar>` + `<AvatarImage>` + `<AvatarFallback>` |
| Campo de texto | `<Textarea>` (`@/components/ui/textarea`) |
| Botão Enviar | `<Button>` com `size="sm"` |
| Separador entre seções | `<Separator>` |
| Skeleton de carregamento | `<Skeleton>` (`@/components/ui/skeleton`) |
| Link "Mostrar mais" | `<Button variant="link" size="sm" asChild>` + `<Link>` |

O painel é simples o suficiente para ser JSX inline dentro do `PostCard`, abaixo do `<Separator>` do footer. Se crescer (ex.: deletar comentário inline), pode ser extraído para `CommentPreviewPanel.tsx`.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Muitos painéis abertos simultaneamente pesam o DOM | Aceitável no feed paginado (20 itens); pode-se fechar o painel ao navegar se necessário |
| `comment_count` no card pode ficar desatualizado entre aberturas | `useCreateComment` já invalida `['post', postId]`, que atualiza o feed via `['feed']` se invalidado também — garantir que `onSuccess` invalide `['feed']` |
| Textarea sem autoresize pode parecer pequena em mobile | Usar `rows=2` com `resize-none` e estilo consistente com o restante do app |
