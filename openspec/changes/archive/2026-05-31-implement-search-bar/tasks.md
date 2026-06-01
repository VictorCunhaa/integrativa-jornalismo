## 1. Backend — Endpoint de Busca

- [x] 1.1 Criar `backend/app/routers/search.py` com `GET /search` aceitando `q`, `page`, `size`
- [x] 1.2 Implementar guard: retornar HTTP 400 quando `q` estiver vazio ou ausente
- [x] 1.3 Implementar query de perfis: `ILIKE '%q%'` em `users.username` e `users.display_name`
- [x] 1.4 Implementar query de posts: `ILIKE '%q%'` em `posts.title` e `posts.subtitle`, filtrando `published_at IS NOT NULL` e `visibility = 'public'`
- [x] 1.5 Criar Pydantic schema de resposta `SearchResponse` com `profiles`, `posts`, `total_profiles`, `total_posts`
- [x] 1.6 Registrar o router em `backend/app/main.py` com prefix `/api/v1`

## 2. Frontend — Hook de Busca

- [x] 2.1 Criar `frontend/src/hooks/useSearch.ts` usando TanStack Query
- [x] 2.2 Implementar debounce de 300ms no hook usando `useState` + `useEffect`
- [x] 2.3 Desabilitar a query quando `q.trim() === ""` (opção `enabled` do TanStack Query)
- [x] 2.4 Tipar a resposta com `SearchResponse` interface (reaproveitando `User` e `Post` existentes)

## 3. Frontend — Página de Resultados

- [x] 3.1 Criar `frontend/src/pages/SearchPage.tsx`
- [x] 3.2 Ler parâmetro `?q=` via `useSearchParams` e passar para `useSearch`
- [x] 3.3 Renderizar seção "Pessoas" com cards de perfil (avatar, display_name, username, account_type)
- [x] 3.4 Renderizar `<Separator>` entre seções
- [x] 3.5 Renderizar seção "Matérias" com `<PostCard>` para cada post retornado
- [x] 3.6 Exibir mensagem "Nenhum perfil encontrado" quando `profiles` estiver vazio
- [x] 3.7 Exibir mensagem central "Nenhum resultado encontrado para `<q>`" quando ambas as seções estiverem vazias
- [x] 3.8 Exibir skeletons durante o estado de carregamento (loading)

## 4. Frontend — Navbar e Rota

- [x] 4.1 Adicionar `useState` para o valor do input e `useNavigate` em `Navbar.tsx`
- [x] 4.2 Conectar o input existente ao estado e implementar `onKeyDown` (Enter → navegar para `/search?q=`)
- [x] 4.3 Sincronizar o valor do input com `?q=` atual via `useSearchParams` quando na rota `/search`
- [x] 4.4 Adicionar campo de busca com comportamento idêntico no componente mobile (`MobileNav`) — fechar drawer ao navegar
- [x] 4.5 Adicionar rota `/search` em `frontend/src/App.tsx` apontando para `SearchPage`
