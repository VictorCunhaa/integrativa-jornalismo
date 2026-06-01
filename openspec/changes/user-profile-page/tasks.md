## 1. Banco de Dados

- [x] 1.1 Criar migration SQL para adicionar colunas `bio TEXT` e `banner_url TEXT` nullable na tabela `users`
- [x] 1.2 Aplicar a migration no ambiente de desenvolvimento e verificar schema atualizado

## 2. Backend — Endpoint de Perfil

- [x] 2.1 Criar endpoint `GET /api/users/:username/profile` que retorna dados do usuário (name, username, avatar_url, bio, banner_url)
- [x] 2.2 Incluir na resposta os 10 posts mais recentes publicados pelo usuário com suporte a paginação via query param `?page=`
- [x] 2.3 Incluir na resposta a lista de categorias únicas dos posts do usuário (para interesses da sidebar)
- [x] 2.4 Retornar 404 quando o username não existir
- [x] 2.5 Escrever testes para o endpoint (usuário existente, usuário sem posts, usuário inexistente)

## 3. Frontend — Componentes

- [x] 3.1 Criar componente `ProfileHeader` exibindo banner, avatar circular, nome, username e bio
- [x] 3.2 Implementar fallback de banner com fundo `sky-700` quando `banner_url` for nulo
- [x] 3.3 Criar componente `ProfileSidebar` com seção de interesses (chips de tags de categorias)
- [x] 3.4 Adicionar seção "Grupos" na `ProfileSidebar` com ícone de cadeado e label "Em breve"
- [x] 3.5 Criar componente `ProfilePostFeed` que lista posts usando o `PostCard` existente
- [x] 3.6 Implementar estado vazio em `ProfilePostFeed` com mensagem "Nenhuma publicação ainda."
- [x] 3.7 Implementar botão "Ver mais" em `ProfilePostFeed` que carrega os próximos 10 posts

## 4. Frontend — Rota e Layout

- [x] 4.1 Criar rota `/profile/[username]/page.tsx` como Server Component no App Router
- [x] 4.2 Buscar dados do endpoint `/api/users/:username/profile` no servidor (sem client-side fetch)
- [x] 4.3 Implementar `notFound()` do Next.js quando a API retornar 404
- [x] 4.4 Compor o layout de duas colunas: `ProfileHeader` + `ProfilePostFeed` na coluna principal, `ProfileSidebar` à direita
- [x] 4.5 Garantir layout responsivo: duas colunas em `lg:` e acima, coluna única em mobile (sidebar abaixo)

## 5. Integração — PostCard

- [x] 5.1 Localizar onde o nome do autor é renderizado no componente `PostCard`
- [x] 5.2 Envolver o nome do autor com um `<Link href={/profile/${username}}>` do Next.js
- [x] 5.3 Verificar que o `username` está disponível nos dados do post passados ao `PostCard`; adicionar ao tipo/query se necessário

## 6. Verificação

- [x] 6.1 Testar página de perfil com usuário que tem todos os dados (banner, avatar, bio, posts)
- [x] 6.2 Testar página de perfil com usuário sem banner, sem bio e sem posts
- [x] 6.3 Testar acesso a `/profile/usuario-inexistente` e confirmar página 404
- [x] 6.4 Testar responsividade em viewport mobile e desktop
- [x] 6.5 Confirmar que clicar no autor em qualquer PostCard navega corretamente para `/profile/:username`
