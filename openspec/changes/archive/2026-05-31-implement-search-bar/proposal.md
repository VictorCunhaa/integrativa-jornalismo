## Why

A barra de pesquisa na Navbar existe apenas como elemento decorativo — sem estado, sem lógica e sem rota dedicada. Usuários não conseguem encontrar perfis nem matérias publicadas, limitando a descoberta de conteúdo na plataforma.

## What Changes

- Ativar a barra de pesquisa existente na Navbar com estado controlado e navegação para `/search`
- Adicionar campo de busca no menu mobile (drawer)
- Criar rota `/search?q=` com página dedicada de resultados
- Novo endpoint backend `GET /api/v1/search?q=&page=&size=` retornando perfis e posts em uma única resposta
- Exibir resultados em duas seções ordenadas: perfis primeiro, linha divisória, depois posts
- Busca em tempo real com debounce no frontend

## Capabilities

### New Capabilities

- `global-search`: Busca unificada de perfis e posts via query string, com resultados organizados em seções (perfis → divisória → posts), acessível pela Navbar em desktop e mobile.

### Modified Capabilities

_(nenhuma)_

## Impact

- **Backend:** Novo endpoint `/api/v1/search` com router dedicado; queries no PostgreSQL em `users.username`, `users.display_name`, `posts.title`, `posts.subtitle`, `posts.content_snippet`
- **Frontend rotas:** Nova rota `/search` em `App.tsx`; nova página `SearchPage.tsx` em `src/pages/`
- **Navbar:** `Navbar.tsx` recebe `useState` + `useNavigate` no input existente; `MobileNav` ganha campo de busca
- **Hooks:** Novo `useSearch.ts` usando TanStack Query com debounce
- **Dependências:** Nenhuma nova dependência externa necessária
