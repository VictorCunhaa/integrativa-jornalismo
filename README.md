# Redação-Escola Digital — MVP

Plataforma para estudantes de Jornalismo criarem perfis profissionais, publicarem matérias em múltiplos formatos e interagirem com os colegas.

## Como rodar

```bash
docker-compose up --build
```

- **Frontend:** http://localhost:5173
- **API Docs (Swagger):** http://localhost:8000/docs

## Credenciais de demonstração

| Conta | E-mail | Senha |
|-------|--------|-------|
| Estudante | aluno@demo.br | demo1234 |
| Professor | professor@demo.br | demo1234 |
| Egresso | egresso@demo.br | demo1234 |
| Profissional | profissional@demo.br | demo1234 |

## Stack

- **Backend:** FastAPI + SQLAlchemy 2.0 + MySQL 8.0
- **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui + Tiptap
- **Auth:** JWT (access 30min + refresh 7 dias)
- **Deploy:** Docker Compose

## Funcionalidades do MVP

- Cadastro, login e edição de perfil (bio, avatar, capa, interesses)
- Editor rico Tiptap (bold, italic, headings, listas, links, imagens inline, embed YouTube)
- Feed cronológico com filtro por editoria
- Perfil público com histórico de matérias
- Suporte a imagem, vídeo e áudio (upload + players)
- Comentários em matérias
- Layout 3 colunas responsivo (inspiração LinkedIn)
