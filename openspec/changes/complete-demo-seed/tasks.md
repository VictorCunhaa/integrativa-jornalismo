## 1. Preparação e limpeza

- [x] 1.1 Abrir `backend/scripts/seed.py` e remover todo o conteúdo atual
- [x] 1.2 Adicionar função `clear_all()` que deleta dados em ordem inversa de FK: notifications → challenge_submissions → challenges → group_members → groups → post_likes → comments → post_media → posts → user_interests → users (preserva interests e editorias)
- [x] 1.3 Garantir que interests e editorias são inseridos com `INSERT IGNORE` ou verificação prévia (não apagar esses dados de referência)

## 2. Usuários

- [x] 2.1 Criar 8 usuários com `display_name`, `email`, `username`, `password_hash` (bcrypt de `demo1234`), `bio`, `avatar_url` e `cover_url`
- [x] 2.2 Distribuir os tipos: 2 students, 2 professors, 2 professionals, 2 alumni
- [x] 2.3 Usar as imagens disponíveis: avatares (`/foto_homem1.jpg`, `/foto_homem2.jpg`, `/foto_mulher1.jpg`, `/foto_mulher2.avif`) e banners (`/banner-1.jpg` a `/banner-4.jpg`)
- [x] 2.4 Vincular 3–5 interesses por usuário via tabela `user_interests`

## 3. Posts

- [x] 3.1 Criar 24 posts (2–3 por editoria) distribuídos entre os 8 usuários
- [x] 3.2 Cobrir todos os formatos: `text`, `photo`, `audio`, `video`, `mixed`
- [x] 3.3 Cobrir todas as visibilidades: `public`, `restricted`, `private`
- [x] 3.4 Preencher `cover_url` com as imagens de `frontend/public/` (`/lei_protecao_dados.jfif`, `/cobertura_esportiva.jpg`, `/festival.jpeg`, `/inflacao.jpg`, `/usp_vacina.jpg`, `/startup.png`, `/cop30.jfif`, `/jovens_mercado.jpeg`)
- [x] 3.5 Preencher `title`, `subtitle`, `content_html` com texto realista em português
- [x] 3.6 Definir `published_at` para todos os posts públicos; deixar nulo nos privados/rascunhos

## 4. Mídias de post

- [x] 4.1 Criar registros em `post_media` para posts de formato `photo` e `mixed`
- [x] 4.2 Preencher `media_type = 'image'`, `url` (imagem de `public/`), `caption` e `credit`

## 5. Likes e comentários

- [x] 5.1 Criar ~48 likes distribuídos entre usuários e posts (respeitar unique constraint `(user_id, post_id)`)
- [x] 5.2 Criar ~28 comentários em ao menos 10 posts distintos, com conteúdo realista em português

## 6. Grupos e membros

- [x] 6.1 Criar 3 grupos com `name`, `description` e `created_by` (professores como owners)
- [x] 6.2 Criar registros em `group_members`: 1 owner + 3–4 membros por grupo
- [x] 6.3 Cada grupo deve ter alunos e outros tipos de usuário como membros

## 7. Desafios e submissões

- [x] 7.1 Criar 5–6 desafios distribuídos entre os 3 grupos, com `title`, `description_html` e `due_at`
- [x] 7.2 Criar 10–12 submissões vinculando posts de alunos a desafios (`challenge_submissions`)
- [x] 7.3 Atribuir `grade`, `graded_by` e `graded_at` a pelo menos 8 submissões

## 8. Notificações

- [x] 8.1 Criar ao menos 6 notificações do tipo `challenge` (novo desafio criado no grupo)
- [x] 8.2 Criar ao menos 6 notificações do tipo `like` (post curtido)
- [x] 8.3 Criar ao menos 6 notificações do tipo `group_invite` (convite para grupo)
- [x] 8.4 Distribuir entre usuários distintos; marcar ~⅓ como `is_read = true`

## 9. Verificação

- [x] 9.1 Executar `docker-compose exec backend python scripts/seed.py` e confirmar que roda sem erros
- [x] 9.2 Executar o seed uma segunda vez (idempotência) e confirmar que não há erros de FK/duplicate key
- [x] 9.3 Verificar no frontend que perfis, posts, grupos e desafios aparecem com imagens corretas
