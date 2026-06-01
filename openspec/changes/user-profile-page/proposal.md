## Why

A plataforma não possui uma página de perfil pública para os usuários, impedindo que jornalistas e leitores conheçam o autor por trás dos posts. Criar essa página aumenta a credibilidade dos autores e o engajamento da comunidade.

## What Changes

- Criação de uma página de perfil de usuário acessível via `/profile/:username`
- Exibição de foto de perfil, banner/capa, nome, bio e informações do autor
- Feed de posts publicados pelo usuário na página de perfil
- Coluna lateral com interesses/tags seguidas pelo usuário
- Seção reservada para grupos (feature futura, exibida como placeholder)
- Rota e layout responsivo inspirado no modelo LinkedIn (duas colunas)

## Capabilities

### New Capabilities

- `user-profile-page`: Página pública de perfil do usuário com foto, banner, bio, feed de posts e coluna lateral com interesses e grupos

### Modified Capabilities

- `post-card-actions`: Link do autor no post card deve apontar para a nova página de perfil

## Impact

- Novas rotas no frontend: `/profile/:username`
- Novos componentes: `ProfileHeader`, `ProfileSidebar`, `ProfilePostFeed`
- Backend: endpoint para buscar dados do perfil + posts do usuário por username
- Banco de dados: campos `bio`, `banner_url` na tabela de usuários (se ainda não existirem)
