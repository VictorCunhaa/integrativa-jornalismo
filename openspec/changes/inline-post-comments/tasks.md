## 1. Hook de preview

- [ ] 1.1 Adicionar `useCommentPreview(postId: number, enabled: boolean)` em `usePosts.ts` — chama `GET /posts/:id/comments?page=1&size=2` somente quando `enabled=true`

## 2. Estado e toggle no PostCard

- [ ] 2.1 Importar `useState` e `useCommentPreview` em `PostCard.tsx`
- [ ] 2.2 Adicionar estado `const [showComments, setShowComments] = useState(false)` no componente
- [ ] 2.3 Converter o botão "Comentar" de `<Link>` para `<Button>` com `onClick={() => setShowComments(v => !v)}`

## 3. Painel de comentários inline

- [ ] 3.1 Renderizar o painel abaixo do `<Separator>` condicionalmente quando `showComments === true`
- [ ] 3.2 Exibir estado de carregamento (spinner ou skeleton) enquanto `useCommentPreview` está pendente
- [ ] 3.3 Renderizar os comentários retornados com avatar, nome do autor e texto do comentário
- [ ] 3.4 Exibir mensagem "Nenhum comentário ainda." quando a lista estiver vazia
- [ ] 3.5 Exibir link "Mostrar mais" navegando para `/post/:id#comments` somente quando `comment_count > 2`

## 4. Formulário de comentário inline

- [ ] 4.1 Importar `useCreateComment` e `useAuthStore` no `PostCard.tsx`
- [ ] 4.2 Adicionar estado `const [body, setBody] = useState('')` para o conteúdo do textarea
- [ ] 4.3 Renderizar textarea e botão "Enviar" somente quando `isAuthenticated === true`
- [ ] 4.4 Desabilitar o botão "Enviar" quando `body.trim()` estiver vazio ou a mutation estiver pendente
- [ ] 4.5 Chamar `useCreateComment` no submit, limpar `body` após sucesso

## 5. Atualização do contador

- [ ] 5.1 Garantir que `onSuccess` de `useCreateComment` invalida `['feed']` além de `['comments', postId]` e `['post', postId]`, para que `comment_count` no card atualize
