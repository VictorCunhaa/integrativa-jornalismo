## Context

A plataforma UniPauta é uma rede social para jornalismo acadêmico construída com React + FastAPI + PostgreSQL. A Navbar já possui um campo de busca (`<Input placeholder="Buscar matérias...">`) completamente inativo — sem estado, sem handler, sem rota. Não existe nenhum endpoint de busca no backend. A adição de busca global é necessária para que usuários possam encontrar tanto perfis de outros membros quanto matérias publicadas.

## Goals / Non-Goals

**Goals:**
- Endpoint backend unificado `GET /api/v1/search?q=` que retorna perfis e posts com uma única chamada
- Página de resultados `/search?q=` com perfis exibidos acima de uma linha divisória e posts abaixo
- Navbar desktop e mobile com input funcional (debounce + navegação ao pressionar Enter)
- Busca case-insensitive via `ILIKE` no PostgreSQL sem dependência de extensões externas

**Non-Goals:**
- Busca full-text avançada com ranking por relevância (pg_trgm, tsvector) — pode ser adicionada futuramente
- Busca dentro de grupos ou challenges
- Sugestões/autocomplete em dropdown na Navbar (fora do escopo desta iteração)
- Paginação independente por tipo (perfis e posts paginados separadamente)

## Decisions

### 1. Endpoint unificado vs. endpoints separados

**Decisão:** Um único `GET /api/v1/search?q=&page=&size=` retornando `{ profiles, posts, total_profiles, total_posts }`.

**Rationale:** A tela de resultados sempre exibe ambos os tipos simultaneamente. Um único round-trip reduz latência e simplifica o hook de dados no frontend. Separar em `/search/users` e `/search/posts` só faria sentido se houvesse abas independentes com paginação separada, o que não é o caso.

**Alternativa considerada:** Dois endpoints distintos com `Promise.all` no frontend — descartado por duplicar o gerenciamento de loading/error state.

### 2. Estratégia de busca no banco

**Decisão:** `ILIKE '%q%'` nas colunas `users.username`, `users.display_name`, `posts.title`, `posts.subtitle`. Busca simples com `OR`.

**Rationale:** Não requer configuração adicional no PostgreSQL (sem extensões), é suficiente para o volume atual e entregável imediatamente. A coluna `content_snippet` dos posts (primeiros ~200 chars sem HTML) também pode ser incluída opcionalmente para ampliar cobertura.

**Alternativa considerada:** `pg_trgm` com índice GIN para fuzzy search e ranking — mais preciso, mas requer migration e configuração da extensão no container Docker. Reservado para iteração futura.

### 3. Estrutura da resposta

**Decisão:**
```json
{
  "profiles": [ ...User[] ],
  "posts":    [ ...Post[] ],
  "total_profiles": int,
  "total_posts": int
}
```
Perfis e posts retornam com os mesmos shapes já usados nos endpoints existentes (`/users/:username` e `/posts`), reaproveitando tipos TypeScript existentes.

### 4. Debounce no frontend

**Decisão:** 300ms de debounce no hook `useSearch` usando `setTimeout`/`useEffect`, sem biblioteca adicional.

**Rationale:** Evita chamadas a cada tecla. 300ms é perceptivelmente responsivo sem sobrecarga. TanStack Query cuida de cache e deduplicação.

### 5. Navegação via Enter (Navbar)

**Decisão:** Ao pressionar Enter no input da Navbar, navegar para `/search?q=<valor>`. A `SearchPage` lê `?q=` via `useSearchParams` e dispara a busca.

**Rationale:** Mantém o comportamento esperado de barras de busca clássicas. Evita navegação automática a cada keystroke (ruído de rotas no histórico).

## Risks / Trade-offs

- **`ILIKE '%q%'` é lento em tabelas grandes** → Aceitável para o volume atual. Índice trigram pode ser adicionado como migration futura sem mudança de interface.
- **Resultados misturados sem relevância** → Perfis e posts são ordenados por `created_at DESC` por padrão. Sem ranking de relevância pode retornar resultados menos úteis. Mitigação: exibir perfis primeiro (geralmente mais relevantes por username exato).
- **Query string vazia** → O endpoint deve retornar 400 ou lista vazia para `q=""` / `q` ausente. Implementar guard no backend e desabilitar o hook no frontend quando `q.trim() === ""`.

## Open Questions

_(nenhuma — escopo está bem delimitado)_
