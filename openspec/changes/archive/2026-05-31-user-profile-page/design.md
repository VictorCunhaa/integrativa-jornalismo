## Context

A plataforma de jornalismo integrada não possui página de perfil público para usuários. Os posts exibem o nome do autor, mas não há destino para navegar ao clicar nele. A arquitetura atual usa Next.js (App Router) no frontend e uma API REST no backend. O banco de dados já possui tabela de usuários com campos básicos (id, username, avatar_url, name).

## Goals / Non-Goals

**Goals:**
- Página pública `/profile/:username` exibindo foto, banner, bio, nome e posts do autor
- Layout duas colunas: conteúdo principal (header + feed) + sidebar (interesses + placeholder de grupos)
- Endpoint de API `GET /api/users/:username/profile` retornando dados do perfil + posts
- Migração de banco para adicionar `bio` e `banner_url` na tabela de usuários
- Link do autor nos post cards apontando para a nova página de perfil
- Layout responsivo (sidebar colapsa em mobile)

**Non-Goals:**
- Edição de perfil (fora do escopo desta mudança)
- Sistema de seguidores/seguindo
- Grupos funcionais (apenas placeholder visual)
- Feed de atividade além de posts publicados

## Decisions

### D1: Rota no App Router (`/profile/[username]/page.tsx`)
Next.js App Router com Server Component buscando dados no servidor via `fetch` direto à API. Evita client-side waterfall e melhora SEO do perfil do jornalista.

**Alternativa considerada**: Client Component com SWR — descartada por impacto no SEO.

### D2: Endpoint único `/api/users/:username/profile`
Retorna em uma única resposta: dados do usuário + lista paginada de posts. Reduz round-trips.

**Alternativa considerada**: dois endpoints separados (usuário e posts) — descartada por complexidade desnecessária na página estática.

### D3: `bio` e `banner_url` na tabela `users`
Adicionar colunas nullable diretamente na tabela existente. Migração simples, sem nova tabela.

**Alternativa considerada**: tabela `user_profiles` separada — desnecessária para os campos atuais.

### D4: Sidebar com interesses como tags
Interesses exibidos como chips/tags baseados nas categorias dos posts do usuário (derivado, não mantido manualmente). Grupos como seção bloqueada com ícone de cadeado e texto "Em breve".

## Risks / Trade-offs

- **[Risco] Username mudança** → Se o username for editável no futuro, URLs antigas quebram. Mitigação: usar slug estável ou redirecionar.
- **[Risco] Perfis sem conteúdo** → Usuários sem posts ou bio resultam em página vazia. Mitigação: estados vazios explícitos em cada seção.
- **[Trade-off] Interesses derivados** → Derivar interesses dos posts é automático mas pode não refletir a intenção do usuário. Aceitável para MVP.

## Migration Plan

1. Rodar migração SQL: `ALTER TABLE users ADD COLUMN bio TEXT, ADD COLUMN banner_url TEXT`
2. Deploy do endpoint `/api/users/:username/profile`
3. Deploy dos componentes e rota `/profile/[username]`
4. Atualizar `PostCard` para linkar nome do autor para `/profile/:username`
5. Rollback: remover rota e reverter link no PostCard; colunas nullable não quebram nada

## Open Questions

- Perfis de usuários não-jornalistas (leitores) devem ter página pública? Por ora: sim, mas sem posts exibidos.
- Paginação do feed: infinite scroll ou paginação clássica? Por ora: carregar os 10 posts mais recentes com botão "Ver mais".
