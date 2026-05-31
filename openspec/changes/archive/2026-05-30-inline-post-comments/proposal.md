## Why

Atualmente, para comentar em um post o usuário precisa abrir a página de detalhes, interrompendo o fluxo de leitura do feed. Habilitar comentários inline no card — estilo LinkedIn — reduz essa fricção e torna a interação social mais fluída sem sair do feed.

## What Changes

- O botão "Comentar" no `PostCard` deixa de ser um link para `/post/:id#comments` e passa a abrir um painel inline abaixo do card.
- O painel exibe os **2 comentários mais recentes** do post.
- Um link **"Mostrar mais"** é exibido quando há mais de 2 comentários; ao clicar, navega para `/post/:id#comments` (página de detalhes, rolada até os comentários).
- Usuários autenticados veem um formulário inline (textarea + botão Enviar) para submeter comentários sem sair do feed.
- O `comment_count` exibido no card atualiza após uma submissão bem-sucedida.

## Capabilities

### New Capabilities

- `inline-post-comments`: Painel de comentários inline no `PostCard` — preview dos 2 comentários mais recentes, formulário de submissão e link "Mostrar mais" que abre a página de detalhes ancorada nos comentários.

### Modified Capabilities

<!-- nenhuma -->

## Impact

- **`frontend/src/components/posts/PostCard.tsx`**: Adicionar estado de toggle, painel inline, formulário de comentário.
- **`frontend/src/hooks/usePosts.ts`**: Adicionar `useCommentPreview` — variante lazy de `useComments` com `size=2`.
- **`frontend/src/components/posts/CommentList.tsx`**: Sem alterações; continua sendo usado apenas em `PostDetailPage`.
- **Backend**: Sem alterações — os endpoints `GET /posts/:id/comments` e `POST /posts/:id/comments` já cobrem tudo.
