## 1. Hook de preview

- [x] 1.1 Adicionar `useCommentPreview(postId: number, enabled: boolean)` em `usePosts.ts` — chama `GET /posts/:id/comments?page=1&size=2` somente quando `enabled=true`

## 2. Estado e toggle no PostCard

- [x] 2.1 Importar `useState` e `useCommentPreview` em `PostCard.tsx`
- [x] 2.2 Adicionar estado `const [showComments, setShowComments] = useState(false)` no componente
- [x] 2.3 Converter o botão "Comentar" de `<Link>` para `<Button>` (shadcn/ui) com `onClick={() => setShowComments(v => !v)}`

## 3. Painel de comentários inline

- [x] 3.1 Renderizar o painel abaixo do `<Separator>` (shadcn/ui) condicionalmente quando `showComments === true`
- [x] 3.2 Exibir skeletons com `<Skeleton>` (shadcn/ui) enquanto `useCommentPreview` está pendente
- [x] 3.3 Renderizar cada comentário com `<Avatar>` + `<AvatarImage>` + `<AvatarFallback>` (shadcn/ui), nome do autor e texto
- [x] 3.4 Exibir mensagem "Nenhum comentário ainda." (texto simples com classe `text-muted-foreground`) quando a lista estiver vazia
- [x] 3.5 Exibir `<Button variant="link" size="sm" asChild><Link to="/post/:id#comments">Mostrar mais</Link></Button>` somente quando `comment_count > 2`

## 4. Formulário de comentário inline

- [x] 4.1 Importar `useCreateComment`, `useAuthStore` e `<Textarea>` (shadcn/ui) no `PostCard.tsx`
- [x] 4.2 Adicionar estado `const [body, setBody] = useState('')` para o conteúdo do textarea
- [x] 4.3 Renderizar `<Textarea>` + `<Button size="sm">Enviar</Button>` (shadcn/ui) somente quando `isAuthenticated === true`
- [x] 4.4 Desabilitar o `<Button>` quando `body.trim()` estiver vazio ou a mutation estiver pendente (`isPending`)
- [x] 4.5 Chamar `useCreateComment` no submit, limpar `body` após sucesso

## 5. Atualização do contador

- [x] 5.1 Garantir que `onSuccess` de `useCreateComment` invalida `['feed']` além de `['comments', postId]` e `['post', postId]`, para que `comment_count` no card atualize

