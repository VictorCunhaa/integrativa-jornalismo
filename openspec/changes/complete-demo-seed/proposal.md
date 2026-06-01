## Why

O seed atual possui apenas 4 usuários e 8 posts, insuficiente para demonstrar a plataforma em sua totalidade. Uma demo rica e realista é necessária para apresentações, testes de usabilidade e validação do produto com stakeholders — cobrindo todos os modelos, tipos de conta, formatos de post e interações disponíveis.

## What Changes

- Reescrever `backend/scripts/seed.py` com dados de demo completos e realistas
- Criar 8–10 usuários com bios, avatares e banners usando as imagens já disponíveis em `frontend/public/`
- Criar 20+ posts cobrindo todas as editorias, todos os formatos e variações de visibilidade
- Criar `post_media` para posts com fotos
- Criar grupos com membros, desafios com submissões e notas
- Criar notificações de todos os tipos (`challenge`, `like`, `group_invite`)
- Criar likes e comentários distribuídos cruzadamente entre usuários
- Popular a relação M2M `user_interests` para todos os usuários

## Capabilities

### New Capabilities

- `demo-seed`: Script de seed completo e idempotente que popula todos os modelos da plataforma com dados realistas prontos para demonstração

### Modified Capabilities

## Impact

- `backend/scripts/seed.py`: reescrito completamente
- Nenhuma migração, schema ou rota de API alterada
- As imagens de `frontend/public/` são referenciadas como URLs estáticas (ex: `/foto_homem1.jpg`) — sem upload real
