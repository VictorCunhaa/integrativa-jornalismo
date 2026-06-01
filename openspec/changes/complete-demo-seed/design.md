## Context

A plataforma Redação-Escola Digital possui um script de seed (`backend/scripts/seed.py`) executado automaticamente na inicialização do container. Atualmente cria apenas 4 usuários e 8 posts, deixando grupos, desafios, submissões, notificações e likes sem dados de demonstração. O seed precisa cobrir todos os modelos para que apresentações e testes de usabilidade mostrem a plataforma funcionando em sua plenitude.

As imagens estáticas já existem em `frontend/public/` e são servidas pelo Vite dev server na raiz (`/foto_homem1.jpg`, `/banner-1.jpg`, etc.). O seed deve referenciar essas URLs diretamente, sem realizar uploads reais.

## Goals / Non-Goals

**Goals:**
- Popular todos os modelos do banco: `users`, `user_interests`, `posts`, `post_media`, `comments`, `post_likes`, `groups`, `group_members`, `challenges`, `challenge_submissions`, `notifications`
- Ser completamente idempotente: limpar dados existentes antes de reinserir
- Usar apenas imagens já disponíveis em `frontend/public/`
- Cobrir todos os `account_type` (student, professor, professional, alumni), todos os `format` de post (text, photo, audio, video, mixed) e todas as visibilidades (public, restricted, private)
- Cobrir todos os tipos de notificação (`challenge`, `like`, `group_invite`)

**Non-Goals:**
- Upload real de arquivos de mídia (áudio/vídeo)
- Criar novos assets de imagem
- Alterar schema do banco ou rotas da API
- Criar testes automatizados para o seed

## Decisions

### Estratégia de limpeza (idempotência)
Deletar todas as tabelas dependentes em ordem inversa de FK antes de reinserir. Alternativa considerada: `TRUNCATE CASCADE` — descartada pois MySQL não suporta CASCADE no TRUNCATE; DELETE em ordem é mais seguro e portável.

### Referência de imagens
URLs apontam para `/nome-do-arquivo.ext` (raiz do frontend). Isso funciona em desenvolvimento pois o Vite serve `public/` na raiz. Em produção, o mesmo padrão se mantém se o frontend estiver servindo os estáticos. Alternativa considerada: copiar imagens para `backend/storage/uploads/` — descartada para evitar duplicação de assets e complexidade no seed.

### Volume de dados
- 8 usuários (2 students, 2 professors, 2 professionals, 2 alumni)
- 24 posts (3 por editoria, distribuídos entre usuários)
- ~48 likes (2 por post em média)
- ~32 comentários (~1,3 por post em média)
- 3 grupos, 6 desafios, 10 submissões com notas
- 18 notificações (6 de cada tipo)

Este volume é suficiente para uma demo visual convincente sem tornar o seed lento.

### Senha padrão
Todos os usuários usam `demo1234` (mesmo padrão atual). Hash gerado com `bcrypt` via `passlib` (já presente no projeto).

## Risks / Trade-offs

- **[Risco] Ordem de deleção errada causa FK violation** → Mitigation: deletar na ordem exata inversa das dependências (notifications → challenge_submissions → challenges → group_members → groups → post_likes → comments → post_media → posts → user_interests → users)
- **[Risco] URLs de imagem quebradas se frontend não estiver rodando** → Mitigation: comportamento esperado em dev; no seed as URLs são apenas strings, não há validação
- **[Trade-off] Dados hardcoded no seed vs. fixtures externas** → Dados inline são mais simples de manter para uma demo; fixtures YAML/JSON adicionariam dependência sem benefício real neste contexto

## Migration Plan

1. Substituir conteúdo de `backend/scripts/seed.py`
2. Reiniciar o container do backend (`docker-compose restart backend`) ou rodar `python scripts/seed.py` diretamente
3. Rollback: restaurar versão anterior do arquivo (git revert)
