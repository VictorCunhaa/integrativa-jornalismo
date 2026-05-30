# MVP — Plataforma Redação-Escola Digital

> **Documento de arquitetura para implementação.**
> Destinatário: agente de IA desenvolvedor.
> Origem: derivado da *Proposta de Solução — Plataforma Redação-Escola Digital* (curso de Jornalismo).
> Escopo deste documento: **MVP mínimo para demonstração** — não cobre os 10 módulos da proposta completa.

---

## 1. Objetivo do MVP

Construir uma versão demonstrável que prove a tese central da plataforma: **um aluno de Jornalismo consegue, em um único ambiente, criar um perfil profissional, publicar trabalhos em múltiplos formatos (texto, foto, áudio, vídeo) e consumir os trabalhos dos colegas em um feed**.

Tudo o que **não** prova essa tese fica fora desta versão (correção pedagógica com rubricas, IA editorial, rede de egressos, banco de pautas, gamificação, SSO institucional, etc.) — esses módulos têm um placeholder na seção 12 (Roadmap pós-MVP) para preservar a visão.

### Critérios de aceite do MVP

1. Usuário consegue se cadastrar, logar e editar seu perfil (bio, avatar, interesses, tipo de conta).
2. Usuário consegue criar uma postagem com **título, editoria, formato, conteúdo rich text** e mídia anexada (imagem inline, vídeo embed/upload, áudio upload).
3. Existe um **feed cronológico** público com filtro por editoria.
4. Existe uma **página de perfil pública** com a bio do usuário e o histórico de postagens dele.
5. Usuários autenticados podem comentar em postagens.
6. Demonstração roda local com `docker-compose up` e dados de seed pré-carregados.

---

## 2. Stack técnico

| Camada       | Escolha                          | Justificativa                                                                                                  |
| ------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Backend      | **FastAPI** (Python 3.11+)       | Pedido do solicitante. Async nativo, OpenAPI/Swagger automático, type hints validados via Pydantic.            |
| ORM          | **SQLAlchemy 2.0** + **Alembic** | Padrão de fato em Python; Alembic para migrações versionadas.                                                  |
| Validação    | **Pydantic v2**                  | Já vem com FastAPI; schemas reaproveitados em request/response.                                                |
| Auth         | **python-jose** + **passlib[bcrypt]** | JWT (access + refresh), bcrypt para hash de senha.                                                        |
| Uploads      | **python-multipart** + **aiofiles** + **Pillow** | Multipart no FastAPI, escrita assíncrona em disco, Pillow para gerar thumbnails.                  |
| Banco        | **MySQL 8.0**                    | Pedido do solicitante. Driver: `asyncmy` (async) ou `pymysql` (sync) — recomendo **asyncmy** para alinhar com FastAPI async. |
| Storage      | **Filesystem local** (`/storage/uploads/`) | MVP. Estrutura abstraída por interface `StorageBackend` para trocar por S3/MinIO depois sem refactor. |
| Frontend     | **React 18** + **Vite**          | Pedido do solicitante. Vite por DX e build rápido.                                                             |
| Roteamento   | **React Router v6**              | Padrão.                                                                                                        |
| Estado/HTTP  | **TanStack Query** (React Query) + **Zustand** | React Query para estado de servidor (cache, retry, invalidation); Zustand para estado de UI (sessão, modais). |
| HTTP client  | **Axios**                        | Interceptor de auth + refresh token simples.                                                                   |
| Estilo       | **Tailwind CSS** + **shadcn/ui** | **shadcn/ui é a base de UI do MVP, não opcional.** Componentes acessíveis (Radix), customizáveis via tokens, copiados pro projeto (sem dependência runtime opaca). Tailwind para estilização ad-hoc. Inspiração visual: LinkedIn — ver seção 9. |
| Ícones       | **lucide-react**                 | Padrão do ecossistema shadcn. Estilo limpo e consistente.                                                      |
| Datas        | **date-fns**                     | Formatação relativa ("há 2 horas") com locale `pt-BR`.                                                         |
| Toasts       | **sonner**                       | Já recomendado pelo shadcn — toasts elegantes pra confirmações e erros.                                        |
| Editor       | **Tiptap** (`@tiptap/react`)     | Headless, baseado em ProseMirror, extensível. Suporta imagens, vídeo embed, links, listas, headings nativamente. Alternativa: Editor.js (block-based) — preferir Tiptap pela maturidade em React. |
| Player vídeo | **react-player**                 | Suporta arquivos locais, YouTube, Vimeo, Twitch em uma única API.                                              |
| Player áudio | **react-h5-audio-player**        | Player customizável, acessível, sem dependências pesadas.                                                      |
| Forms        | **React Hook Form** + **Zod**    | Performance + schema validation client-side espelhando o backend.                                              |
| Dev/Deploy   | **Docker Compose**               | Subir backend + MySQL + frontend em um comando.                                                                |

---

## 3. Arquitetura em alto nível

```
┌──────────────────────┐         ┌──────────────────────┐         ┌──────────────────┐
│   React SPA (Vite)   │ ──HTTP─▶│  FastAPI (uvicorn)   │ ──SQL──▶│   MySQL 8.0      │
│  - Tiptap editor     │ ◀──JSON─│  - Routers           │ ◀───────│                  │
│  - React Query       │         │  - Services          │         └──────────────────┘
│  - Tailwind/shadcn   │         │  - SQLAlchemy        │
└──────────────────────┘         │  - JWT auth          │         ┌──────────────────┐
            │                    │  - File uploads      │ ──FS───▶│  Local storage   │
            │                    └──────────────────────┘         │  /storage/uploads│
            │                                │                    └──────────────────┘
            │                                │
            └────────────── serve /uploads/* ──────────────┘
                       (FastAPI StaticFiles ou Nginx em prod)
```

**Pontos de atenção arquiteturais:**

- Backend e frontend são **desacoplados** (SPA + API). Sem SSR no MVP.
- CORS configurado no FastAPI para permitir origem do frontend em dev (`http://localhost:5173`).
- Uploads servidos pelo próprio FastAPI via `StaticFiles` no MVP. Em produção, na frente entra Nginx servindo `/uploads/*` direto do filesystem, e o FastAPI só lida com a API.
- **Interface de storage abstraída**: classe `StorageBackend` com método `save(file, path) -> url`. Implementação MVP: `LocalStorageBackend`. Próxima: `S3StorageBackend` — sem mudar nenhum router.

---

## 4. Modelo de dados (MySQL)

### 4.1. Diagrama entidade-relacionamento (textual)

```
users ──┐
        ├──< user_interests >── interests
        │
        ├──< posts ──┐
        │            ├──< post_media
        │            └──< comments
        │
        └─── (FK user_id em comments)

editorias ──< posts
```

### 4.2. Tabelas

#### `users`

| Coluna         | Tipo                                                                            | Observações                                |
| -------------- | ------------------------------------------------------------------------------- | ------------------------------------------ |
| `id`           | `BIGINT UNSIGNED PK AUTO_INCREMENT`                                             |                                            |
| `email`        | `VARCHAR(255) NOT NULL UNIQUE`                                                  |                                            |
| `username`     | `VARCHAR(50) NOT NULL UNIQUE`                                                   | Handle público, ex.: `@victor.silva`       |
| `password_hash`| `VARCHAR(255) NOT NULL`                                                         | bcrypt                                     |
| `display_name` | `VARCHAR(120) NOT NULL`                                                         | Nome de exibição                           |
| `account_type` | `ENUM('student','professor','professional','alumni') NOT NULL DEFAULT 'student'`| Tipo de conta — base para selos futuros    |
| `bio`          | `TEXT NULL`                                                                     | Bio livre, até ~500 caracteres validado em app|
| `avatar_url`   | `VARCHAR(500) NULL`                                                             | URL relativa em `/uploads/...`             |
| `cover_url`    | `VARCHAR(500) NULL`                                                             | Capa do perfil                             |
| `created_at`   | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`                                   |                                            |
| `updated_at`   | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`       |                                            |

Índices: `idx_users_username (username)`, `idx_users_email (email)`.

#### `interests`

| Coluna  | Tipo                                | Observações                                   |
| ------- | ----------------------------------- | --------------------------------------------- |
| `id`    | `INT UNSIGNED PK AUTO_INCREMENT`    |                                               |
| `slug`  | `VARCHAR(50) NOT NULL UNIQUE`       | `politica`, `esportes`, `cultura`, etc.       |
| `label` | `VARCHAR(80) NOT NULL`              | Rótulo de exibição em PT-BR                   |

Seed inicial: `politica`, `esportes`, `cultura`, `economia`, `ciencia`, `tecnologia`, `internacional`, `cotidiano`, `meio-ambiente`, `direitos-humanos`.

#### `user_interests` (tabela de junção)

| Coluna        | Tipo                | Observações                          |
| ------------- | ------------------- | ------------------------------------ |
| `user_id`     | `BIGINT UNSIGNED FK → users.id ON DELETE CASCADE`  |                  |
| `interest_id` | `INT UNSIGNED FK → interests.id ON DELETE CASCADE` |                  |

PK composta: `(user_id, interest_id)`.

#### `editorias`

| Coluna  | Tipo                                | Observações                                   |
| ------- | ----------------------------------- | --------------------------------------------- |
| `id`    | `INT UNSIGNED PK AUTO_INCREMENT`    |                                               |
| `slug`  | `VARCHAR(50) NOT NULL UNIQUE`       |                                               |
| `label` | `VARCHAR(80) NOT NULL`              |                                               |

Mesmo seed das `interests` no MVP — separamos as tabelas porque conceitualmente são coisas diferentes (editoria = categoria da matéria, interesse = tema acompanhado pelo usuário).

#### `posts`

| Coluna         | Tipo                                                                            | Observações                                              |
| -------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `id`           | `BIGINT UNSIGNED PK AUTO_INCREMENT`                                             |                                                          |
| `user_id`      | `BIGINT UNSIGNED NOT NULL FK → users.id`                                        | Autor                                                    |
| `title`        | `VARCHAR(280) NOT NULL`                                                         |                                                          |
| `subtitle`     | `VARCHAR(500) NULL`                                                             | Linha fina                                               |
| `format`       | `ENUM('text','photo','audio','video','mixed') NOT NULL`                         | Formato dominante — facilita filtros e ícones no feed    |
| `editoria_id`  | `INT UNSIGNED NOT NULL FK → editorias.id`                                       |                                                          |
| `content_html` | `LONGTEXT NOT NULL`                                                             | HTML sanitizado vindo do Tiptap                          |
| `content_json` | `JSON NULL`                                                                     | ProseMirror JSON original (para reedição fiel no Tiptap) |
| `cover_url`    | `VARCHAR(500) NULL`                                                             | Capa da matéria — destaque no feed                       |
| `visibility`   | `ENUM('public','restricted','private') NOT NULL DEFAULT 'public'`               | `restricted` = só logados; `private` = só o autor        |
| `published_at` | `DATETIME NULL`                                                                 | Null = rascunho                                          |
| `created_at`   | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`                                   |                                                          |
| `updated_at`   | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`       |                                                          |

Índices: `idx_posts_published_at (published_at DESC)`, `idx_posts_user_published (user_id, published_at DESC)`, `idx_posts_editoria (editoria_id, published_at DESC)`.

#### `post_media`

| Coluna       | Tipo                                                              | Observações                                                       |
| ------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `id`         | `BIGINT UNSIGNED PK AUTO_INCREMENT`                               |                                                                   |
| `post_id`    | `BIGINT UNSIGNED NOT NULL FK → posts.id ON DELETE CASCADE`        |                                                                   |
| `media_type` | `ENUM('image','video','audio','embed') NOT NULL`                  | `embed` = URL externa (YouTube, Vimeo, SoundCloud)                |
| `url`        | `VARCHAR(1000) NOT NULL`                                          | Para `embed`, é a URL original; para os demais, caminho em /uploads |
| `caption`    | `VARCHAR(500) NULL`                                               | Legenda jornalística                                              |
| `credit`     | `VARCHAR(200) NULL`                                               | Crédito do autor da mídia                                         |
| `position`   | `INT NOT NULL DEFAULT 0`                                          | Ordem na galeria                                                  |

Mídias **inline no corpo do texto** ficam dentro do `content_html` (Tiptap insere `<img src="...">`). Esta tabela é para **galeria/anexos do post** que ficam fora do corpo (ex.: galeria de fotos no fim, podcast embedado no topo).

#### `comments`

| Coluna       | Tipo                                                              | Observações                |
| ------------ | ----------------------------------------------------------------- | -------------------------- |
| `id`         | `BIGINT UNSIGNED PK AUTO_INCREMENT`                               |                            |
| `post_id`    | `BIGINT UNSIGNED NOT NULL FK → posts.id ON DELETE CASCADE`        |                            |
| `user_id`    | `BIGINT UNSIGNED NOT NULL FK → users.id`                          |                            |
| `content`    | `TEXT NOT NULL`                                                   | Plain text por enquanto    |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`                     |                            |

Índice: `idx_comments_post_created (post_id, created_at DESC)`.

> **Comentários hierárquicos** (replies) ficam fora do MVP. Quando entrar, adicionar `parent_id BIGINT UNSIGNED NULL FK → comments.id`.

---

## 5. Contrato de API

Prefixo: `/api/v1`. Todas as respostas em JSON. Autenticação via header `Authorization: Bearer <access_token>`.

### 5.1. Autenticação

| Método | Rota                      | Body                                       | Resposta                                      |
| ------ | ------------------------- | ------------------------------------------ | --------------------------------------------- |
| POST   | `/auth/register`          | `{email, username, password, display_name, account_type}` | `201` `{user, access_token, refresh_token}` |
| POST   | `/auth/login`             | `{email, password}`                        | `200` `{user, access_token, refresh_token}`   |
| POST   | `/auth/refresh`           | `{refresh_token}`                          | `200` `{access_token}`                        |
| GET    | `/auth/me`                | —                                          | `200` `{user}` (do token)                     |

Access token: 30 min. Refresh token: 7 dias. Ambos JWT assinados com `HS256`. Refresh **não** é persistido em banco no MVP (stateless) — adicionar `refresh_tokens` quando precisar revogar.

### 5.2. Usuários

| Método | Rota                          | Auth | Descrição                                          |
| ------ | ----------------------------- | ---- | -------------------------------------------------- |
| GET    | `/users/{username}`           | —    | Perfil público + contadores (posts, etc.)          |
| PATCH  | `/users/me`                   | ✓    | Atualiza `display_name`, `bio`                     |
| POST   | `/users/me/avatar`            | ✓    | Multipart, retorna `{avatar_url}`                  |
| POST   | `/users/me/cover`             | ✓    | Multipart, retorna `{cover_url}`                   |
| PUT    | `/users/me/interests`         | ✓    | Body `{interest_ids: [int]}` — substitui o set     |

### 5.3. Taxonomias

| Método | Rota                | Descrição                          |
| ------ | ------------------- | ---------------------------------- |
| GET    | `/interests`        | Lista de interesses para o selector|
| GET    | `/editorias`        | Lista de editorias para o selector |

### 5.4. Posts

| Método | Rota                                  | Auth | Descrição                                                                              |
| ------ | ------------------------------------- | ---- | -------------------------------------------------------------------------------------- |
| GET    | `/posts`                              | —    | Feed paginado. Query: `?editoria=politica&format=text&page=1&size=20`                  |
| GET    | `/posts/{id}`                         | —/✓  | Detalhe do post. Respeita visibility.                                                  |
| POST   | `/posts`                              | ✓    | Cria post (rascunho se `published_at` não enviado)                                     |
| PATCH  | `/posts/{id}`                         | ✓    | Edita (somente autor)                                                                  |
| DELETE | `/posts/{id}`                         | ✓    | Soft delete opcional; no MVP, hard delete                                              |
| POST   | `/posts/{id}/publish`                 | ✓    | Define `published_at = NOW()`                                                          |
| GET    | `/users/{username}/posts`             | —    | Posts públicos de um usuário                                                           |
| POST   | `/posts/{id}/media`                   | ✓    | Anexa mídia (multipart ou JSON com URL para embed)                                     |
| DELETE | `/posts/{id}/media/{media_id}`        | ✓    |                                                                                        |

### 5.5. Comentários

| Método | Rota                            | Auth | Descrição                                  |
| ------ | ------------------------------- | ---- | ------------------------------------------ |
| GET    | `/posts/{id}/comments`          | —    | Paginado, mais recentes primeiro           |
| POST   | `/posts/{id}/comments`          | ✓    | Body `{content}`                           |
| DELETE | `/comments/{id}`                | ✓    | Autor ou autor do post                     |

### 5.6. Uploads

| Método | Rota                  | Auth | Body         | Resposta                            |
| ------ | --------------------- | ---- | ------------ | ----------------------------------- |
| POST   | `/uploads/image`      | ✓    | multipart    | `{url, thumb_url, width, height}`   |
| POST   | `/uploads/video`      | ✓    | multipart    | `{url, mime_type, size_bytes}`      |
| POST   | `/uploads/audio`      | ✓    | multipart    | `{url, mime_type, size_bytes, duration_seconds?}` |

**Limites no MVP**:
- Imagem: máx 10 MB, formatos `jpg/png/webp/gif`, gera thumb 400px (lado maior) via Pillow.
- Vídeo: máx 200 MB, formatos `mp4/webm`.
- Áudio: máx 100 MB, formatos `mp3/m4a/ogg/wav`.

Validação por **magic number** (use `python-magic`), não por extensão. Nome final: `<uuid4>.<ext>`. Path: `/storage/uploads/<yyyy>/<mm>/<uuid>.<ext>`. URL servida em `/uploads/<yyyy>/<mm>/...`.

### 5.7. Esquema padrão de resposta de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "O título é obrigatório.",
    "details": { "field": "title" }
  }
}
```

---

## 6. Estrutura de pastas

### 6.1. Backend (`/backend`)

```
backend/
├── app/
│   ├── main.py                  # FastAPI app, middlewares, CORS, static files
│   ├── config.py                # Settings via Pydantic BaseSettings (.env)
│   ├── database.py              # Engine, SessionLocal, Base
│   ├── deps.py                  # Dependency injection (get_db, get_current_user)
│   ├── security.py              # JWT encode/decode, password hashing
│   ├── storage/
│   │   ├── base.py              # StorageBackend interface
│   │   └── local.py             # LocalStorageBackend
│   ├── models/                  # SQLAlchemy models
│   │   ├── user.py
│   │   ├── interest.py
│   │   ├── editoria.py
│   │   ├── post.py
│   │   ├── post_media.py
│   │   └── comment.py
│   ├── schemas/                 # Pydantic schemas (request/response)
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── post.py
│   │   └── comment.py
│   ├── services/                # Lógica de negócio reutilizável
│   │   ├── auth_service.py
│   │   ├── post_service.py
│   │   └── upload_service.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── posts.py
│   │   ├── comments.py
│   │   ├── uploads.py
│   │   └── taxonomies.py
│   └── utils/
│       ├── sanitize.py          # HTML sanitization (bleach) para content_html
│       └── slugify.py
├── alembic/
│   ├── versions/
│   └── env.py
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_posts.py
│   └── test_uploads.py
├── scripts/
│   └── seed.py                  # Popula editorias, interests, usuários demo, posts demo
├── storage/
│   └── uploads/                 # gitignore'd
├── alembic.ini
├── pyproject.toml               # ou requirements.txt
├── .env.example
└── Dockerfile
```

### 6.2. Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx                  # Router + providers (QueryClient, Toaster)
│   ├── lib/
│   │   ├── api.ts               # Axios instance + interceptors (auth, refresh)
│   │   ├── auth.ts              # Zustand store de sessão
│   │   └── utils.ts             # cn(), formatDate(), etc.
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePosts.ts          # React Query hooks
│   │   └── useUpload.ts
│   ├── components/
│   │   ├── ui/                  # shadcn/ui generated (Button, Input, Dialog, ...)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── editor/
│   │   │   ├── PostEditor.tsx           # Tiptap wrapper
│   │   │   ├── EditorToolbar.tsx
│   │   │   ├── ImageUploadButton.tsx
│   │   │   └── EmbedDialog.tsx          # YouTube/Vimeo/SoundCloud
│   │   ├── posts/
│   │   │   ├── PostCard.tsx             # Card no feed
│   │   │   ├── PostDetail.tsx
│   │   │   ├── MediaGallery.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   └── CommentList.tsx
│   │   └── profile/
│   │       ├── ProfileHeader.tsx
│   │       ├── InterestsPicker.tsx
│   │       └── AvatarUpload.tsx
│   ├── pages/
│   │   ├── HomePage.tsx                 # Feed
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProfilePage.tsx              # /@username
│   │   ├── ProfileEditPage.tsx
│   │   ├── PostNewPage.tsx
│   │   ├── PostDetailPage.tsx
│   │   └── PostEditPage.tsx
│   ├── routes.tsx                       # Definição de rotas + guards
│   └── styles/
│       └── globals.css                  # Tailwind base + tokens shadcn
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── Dockerfile
```

---

## 7. Editor de postagens (Tiptap)

O coração da experiência. Configuração mínima:

```ts
// PostEditor.tsx (esqueleto)
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'

export function PostEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,                                 // bold, italic, headings, lists, blockquote, code
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ controls: true }),
      Placeholder.configure({ placeholder: 'Comece sua reportagem...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange({
      html: editor.getHTML(),
      json: editor.getJSON(),
    }),
  })
  return (
    <>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="prose prose-lg max-w-none" />
    </>
  )
}
```

**Fluxo de imagem inline**: botão "Imagem" na toolbar dispara `<input type="file">` → `POST /uploads/image` → resposta `{url}` → `editor.chain().focus().setImage({ src: url, alt: '...' }).run()`.

**Fluxo de vídeo embed**: dialog com input de URL → `editor.chain().focus().setYoutubeVideo({ src: url }).run()`.

**Sanitização**: o `content_html` chega no backend e passa por `bleach.clean()` com allowlist de tags (`p, h1-h4, ul, ol, li, blockquote, a, img, strong, em, code, pre`) e atributos seguros antes de salvar. **Nunca** confiar no HTML do cliente.

**Mídia "anexada" ao post** (galeria/podcast principal, fora do corpo): componente separado `MediaAttacher` na página de edição, que chama `POST /posts/{id}/media`. Esta separação evita atrelar o player de áudio principal a markup HTML — fica como recurso estruturado consultável.

---

## 8. Autenticação — fluxo

1. **Register/Login** → backend retorna `access_token` (30min) + `refresh_token` (7d) + dados do usuário.
2. Frontend salva ambos em **localStorage** (MVP — em produção, refresh em cookie httpOnly).
3. Axios interceptor injeta `Authorization: Bearer <access>` em toda request.
4. Em `401`, interceptor tenta `POST /auth/refresh` com o refresh; se obter novo access, retenta a request original; se falhar, desloga e redireciona para `/login`.
5. Hook `useAuth()` (Zustand) expõe `{user, login, logout, isAuthenticated}` para guards de rota.

```ts
// routes.tsx (guard simples)
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
```

---

## 9. Design System & UI/UX — inspirado em LinkedIn

A direção visual é deliberadamente **clean, profissional e moderna**, espelhando padrões do LinkedIn (que é o benchmark de rede profissional no mercado). Isso reforça o posicionamento da plataforma como **ambiente profissional, não rede social genérica** — exatamente o diferencial que a proposta original sustenta.

### 9.1. Princípios de design

- **Muito espaço em branco.** Tela respira, conteúdo manda.
- **Cards como unidade visual primária.** Tudo no feed e nos perfis é card com `border` sutil + `shadow-sm`, fundo branco sobre canvas cinza-claro.
- **Hierarquia tipográfica clara.** Títulos pesados, corpo legível, metadados em cinza médio.
- **Cores contidas.** Cinzas neutros dominam; cor de destaque (accent) só em CTAs, links e estados ativos — nunca em decoração.
- **Densidade moderada.** Mais informação por viewport que um Instagram, mas com folga visual — não é um Bloomberg Terminal.
- **Bordas arredondadas.** `rounded-lg` (8px) em cards e botões; `rounded-full` em avatares e chips.
- **Acessibilidade baseline.** Contraste WCAG AA, focus rings visíveis (`focus-visible:ring-2`), alt obrigatório em imagens, labels em todos os inputs. shadcn/ui já entrega isso de graça via Radix.

### 9.2. Tokens visuais (Tailwind + shadcn theme)

Configuração em `tailwind.config.ts` + `globals.css` (CSS variables no padrão shadcn). Sugestão de paleta:

```css
/* globals.css — modo claro (default) */
:root {
  --background: 0 0% 96%;           /* canvas cinza muito claro (#F4F4F5) */
  --foreground: 222 47% 11%;        /* texto principal quase preto */
  --card: 0 0% 100%;                /* branco puro pros cards */
  --card-foreground: 222 47% 11%;
  --muted: 210 20% 96%;
  --muted-foreground: 215 16% 47%;  /* metadados, datas, secundário */
  --border: 214 32% 91%;            /* bordas sutis dos cards */
  --input: 214 32% 91%;
  --primary: 158 64% 32%;           /* verde-jornal (#1E7B4E) — accent institucional */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 94%;            /* hover de itens de menu */
  --destructive: 0 84% 60%;
  --ring: 158 64% 32%;
  --radius: 0.5rem;                 /* 8px — base do shadcn */
}
```

> **Por que verde e não azul?** Diferenciação do LinkedIn (azul) e do Twitter/X (azul). Verde remete a "verificação" e "checagem" — coerente com a tese editorial da plataforma. Decisão estética aberta — qualquer accent funciona com a estrutura visual proposta.

**Tipografia:** **Inter** via Google Fonts (mesma família do LinkedIn moderno). Configurar em `tailwind.config.ts`:

```ts
fontFamily: {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  serif: ['"Source Serif Pro"', 'Georgia', 'serif'],  // opcional: corpo de matéria longa
}
```

Para o corpo de **matérias longas** (Tiptap renderizado em `PostDetailPage`), considerar serif (`Source Serif Pro` ou `Lora`) — convenção jornalística. Aplicar via `prose-serif` num wrapper específico.

### 9.3. Componentes shadcn/ui a instalar

Comandos para o agente desenvolvedor rodar **antes** de implementar as telas:

```bash
# bootstrap do shadcn (CLI já assume Tailwind configurado)
npx shadcn@latest init

# componentes do MVP
npx shadcn@latest add button input textarea label
npx shadcn@latest add card avatar badge separator
npx shadcn@latest add dialog dropdown-menu popover tooltip
npx shadcn@latest add tabs select checkbox radio-group
npx shadcn@latest add form sonner skeleton scroll-area
npx shadcn@latest add navigation-menu sheet            # sheet = drawer mobile
```

**Mapeamento componente → uso:**

| Componente shadcn         | Onde aparece                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `Card`                    | Post no feed, mini-perfil sidebar, blocos de "Sobre" e "Interesses" no perfil        |
| `Avatar`                  | Avatar do autor em todo lugar (feed, comentário, header)                             |
| `Badge`                   | Tipo de conta (Estudante, Professor, Egresso, Profissional), editoria, formato       |
| `Button`                  | CTAs primários (Publicar, Seguir, Editar perfil) e secundários (Salvar rascunho)     |
| `Tabs`                    | Abas no perfil ("Posts" \| "Sobre"), abas de filtro no feed                          |
| `Dialog`                  | Composer de post rápido (modal), embed de vídeo, confirmações destrutivas            |
| `Sheet`                   | Menu lateral mobile (sidebar vira drawer < 1024px)                                   |
| `DropdownMenu`            | Menu do usuário no navbar (perfil, configurações, sair), menu "..." em posts         |
| `Form` + React Hook Form  | Login, Register, edição de perfil, criação/edição de post                            |
| `Sonner (Toaster)`        | "Postagem publicada!", "Avatar atualizado", erros de upload                          |
| `Skeleton`                | Loading do feed e do perfil (UX melhor que spinners)                                 |
| `Select`                  | Seletor de editoria, formato, visibility                                             |
| `Tooltip`                 | Hover em ícones (formato, ações inline em posts)                                     |

### 9.4. Padrão de layout (LinkedIn-style 3 colunas)

**Desktop (≥1024px):** grid de 3 colunas com larguras assimétricas — espelho direto do LinkedIn.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky)  [logo] [busca]            [+ Postar] [🔔] [avatar ▾]  │
├──────────────┬──────────────────────────────────┬───────────────────────┤
│              │                                  │                       │
│  SIDEBAR     │      FEED CENTRAL                │   SIDEBAR DIREITA     │
│  ESQUERDA    │                                  │                       │
│              │   ┌────────────────────────┐     │  ┌─────────────────┐  │
│  [capa]      │   │ Composer (clique abre  │     │  │ Editorias em    │  │
│  [avatar]    │   │  dialog do editor)     │     │  │ destaque        │  │
│  Nome        │   └────────────────────────┘     │  │ • Política      │  │
│  @username   │                                  │  │ • Cultura       │  │
│  Tipo badge  │   ┌────────────────────────┐     │  │ • Esportes      │  │
│              │   │ PostCard               │     │  └─────────────────┘  │
│  ── stats ── │   │  [autor • editoria •   │     │                       │
│  Posts: 12   │   │   há 2h]               │     │  ┌─────────────────┐  │
│  Visitas:    │   │  Título da matéria     │     │  │ Sugestões para  │  │
│  342         │   │  Subtítulo se houver   │     │  │ seguir          │  │
│              │   │  [capa/galeria/player] │     │  │ (placeholder    │  │
│  ── nav ──   │   │  Conteúdo (trecho)     │     │  │  pós-MVP)       │  │
│  🏠 Início   │   │  💬 12  ❤ 24  ↗ Comp.  │     │  └─────────────────┘  │
│  👤 Perfil   │   └────────────────────────┘     │                       │
│  ✏  Novo     │                                  │                       │
│              │   ┌────────────────────────┐     │                       │
│              │   │ PostCard ...           │     │                       │
│              │   └────────────────────────┘     │                       │
│              │                                  │                       │
│  ~250px      │   ~640px (max)                   │   ~300px              │
└──────────────┴──────────────────────────────────┴───────────────────────┘
```

**Tablet (768–1023px):** esconde a sidebar direita; mantém esquerda colapsada (só nav).
**Mobile (<768px):** vira coluna única; sidebar esquerda vai pro `Sheet` (drawer) acionado por botão hambúrguer; navbar simplifica.

Implementação Tailwind:

```tsx
// AppLayout.tsx
<div className="min-h-screen bg-background">
  <Navbar />
  <main className="container mx-auto max-w-7xl px-4 py-6">
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_300px] gap-6">
      <aside className="hidden lg:block"><LeftSidebar /></aside>
      <section><Outlet /></section>
      <aside className="hidden xl:block"><RightSidebar /></aside>
    </div>
  </main>
</div>
```

### 9.5. Anatomia das telas-chave

#### 9.5.1. Navbar (sticky top)

- Altura `h-14`, fundo branco, `border-b`, `sticky top-0 z-50`.
- Esquerda: logo + campo de busca (`Input` shadcn com ícone `Search` lucide).
- Direita: botão **"+ Postar"** primário (verde) → abre dialog do editor; ícone de notificações (placeholder pós-MVP); `Avatar` que vira `DropdownMenu` com {Meu perfil, Editar perfil, Sair}.
- Mobile: busca vira ícone que expande, "Postar" vira só ícone.

#### 9.5.2. Composer (topo do feed)

Caixa clicável tipo LinkedIn — não é um editor inline, é um **trigger**:

```tsx
<Card className="p-4">
  <div className="flex items-center gap-3">
    <Avatar src={user.avatar_url} fallback={user.display_name[0]} />
    <button
      onClick={() => openPostDialog()}
      className="flex-1 text-left rounded-full border bg-muted/50 px-4 py-2.5
                 text-muted-foreground hover:bg-muted transition"
    >
      O que você está apurando, {user.display_name.split(' ')[0]}?
    </button>
  </div>
  <Separator className="my-3" />
  <div className="flex justify-around">
    <Button variant="ghost" size="sm"><ImageIcon /> Foto</Button>
    <Button variant="ghost" size="sm"><VideoIcon /> Vídeo</Button>
    <Button variant="ghost" size="sm"><MicIcon /> Áudio</Button>
    <Button variant="ghost" size="sm"><FileTextIcon /> Matéria</Button>
  </div>
</Card>
```

Clique em qualquer atalho abre o **dialog do editor Tiptap** já com o formato pré-selecionado.

#### 9.5.3. PostCard (item do feed)

Estrutura LinkedIn-like:

```
┌──────────────────────────────────────────────┐
│ [Avatar] Nome do autor                  [...]│   ← header com menu
│          @username · Estudante               │
│          Política · há 2 horas               │
├──────────────────────────────────────────────┤
│ TÍTULO DA MATÉRIA                            │   ← clica e vai pro detalhe
│ Subtítulo opcional em cinza médio            │
│                                              │
│ Trecho do conteúdo em texto plano, limitado  │
│ a ~3 linhas com fade ou "...ver mais".       │
├──────────────────────────────────────────────┤
│ [    capa em 16:9 / galeria / player    ]    │   ← cover_url ou media
├──────────────────────────────────────────────┤
│  💬 12 comentários                           │   ← contadores discretos
├──────────────────────────────────────────────┤
│  💬 Comentar    🔖 Salvar    ↗ Compartilhar  │   ← ações inline (ghost btn)
└──────────────────────────────────────────────┘
```

Header inclui `Badge` colorido pra tipo de conta (cores distintas por enum: estudante=cinza, professor=azul, egresso=roxo, profissional=verde). Data formatada com `formatDistanceToNow` do `date-fns` com locale PT-BR.

#### 9.5.4. ProfilePage

Layout LinkedIn clássico — capa + avatar com overlap:

```
┌────────────────────────────────────────────────────┐
│ [    cover_url (banner, h-48, object-cover)    ]   │
│                                                    │
│ ┌──[Avatar grande, -mt-12, ring branco]──         │
│ │  Nome de Exibição              [Editar perfil]   │
│ │  @username · Estudante de Jornalismo             │
│ │  📍 Localização (pós-MVP)                        │
│ │  Bio multilinha aqui, até ~500 caracteres,       │
│ │  com formatação simples preservada.              │
│ │                                                  │
│ │  Interesses: [chip] [chip] [chip] [chip]         │
│ └──────────────────────────────────────────────    │
├────────────────────────────────────────────────────┤
│  [ Posts ] [ Sobre ]    ← Tabs shadcn              │
├────────────────────────────────────────────────────┤
│  Aba Posts: lista vertical de PostCards do autor   │
└────────────────────────────────────────────────────┘
```

Avatar com `className="size-32 ring-4 ring-background -mt-16"` cria o overlap clássico. Botão "Editar perfil" só aparece se `user.id === profile.id`.

#### 9.5.5. PostDetailPage

Layout de leitura — coluna central mais larga, sidebar direita opcional com "Mais do autor":

```
┌────────────────────────────────────────────┐
│ [breadcrumb: Início > Política > Título]   │
├────────────────────────────────────────────┤
│ TÍTULO GRANDE (text-4xl font-bold)         │
│ Subtítulo serif italic (text-xl)           │
│                                            │
│ [Avatar] Nome do autor (link)              │
│          Estudante · Política · há 2h      │
│          [Seguir]   (pós-MVP)              │
├────────────────────────────────────────────┤
│ [    cover_url full-width                ] │
├────────────────────────────────────────────┤
│                                            │
│  Corpo da matéria renderizado a partir do  │
│  content_html, com classes `prose` do      │
│  Tailwind Typography. Use serif aqui.      │
│                                            │
│  Imagens inline, embeds de vídeo, etc.     │
│                                            │
├────────────────────────────────────────────┤
│ [Galeria de post_media — se houver]        │
│ [Player de áudio principal — se houver]    │
├────────────────────────────────────────────┤
│  💬 Comentários (12)                       │
│  ┌────────────────────────────────────┐    │
│  │ [Avatar] [Textarea: "Comentar..."] │    │
│  │                       [Enviar]     │    │
│  └────────────────────────────────────┘    │
│                                            │
│  [Avatar] Nome · há 1h                     │
│  Conteúdo do comentário...                 │
│                                            │
│  [Avatar] Nome · há 30min                  │
│  Conteúdo do comentário...                 │
└────────────────────────────────────────────┘
```

Instalar `@tailwindcss/typography` para a classe `prose` renderizar bem o HTML do Tiptap.

#### 9.5.6. PostNewPage / PostEditPage

**Não usar dialog aqui** — escrever matéria é tarefa longa, merece página inteira. Layout em duas colunas em telas grandes (editor + painel lateral de metadados):

```
┌────────────────────────────────────────────────────────────────┐
│ [← Voltar]                              [Salvar rascunho] [Publicar] │
├────────────────────────────────────────┬───────────────────────┤
│                                        │ FORMATO               │
│ TÍTULO (input grande, sem borda,       │ ○ Texto               │
│ text-3xl font-bold)                    │ ○ Foto                │
│                                        │ ○ Áudio               │
│ Subtítulo (input médio, italic, gray)  │ ○ Vídeo               │
│                                        │ ○ Misto               │
│ ┌────────────────────────────────┐     │                       │
│ │ Toolbar Tiptap                 │     │ EDITORIA              │
│ │ [B] [I] [H1][H2] [•] [1.]      │     │ [Select]              │
│ │ [Link] [Img] [Vídeo] [─]       │     │                       │
│ ├────────────────────────────────┤     │ CAPA                  │
│ │                                │     │ [Upload area]         │
│ │  Comece sua reportagem...      │     │                       │
│ │                                │     │ MÍDIA ANEXADA         │
│ │  (editor com prose-lg)         │     │ [+ Adicionar]         │
│ │                                │     │ • foto1.jpg [×]       │
│ │                                │     │ • podcast.mp3 [×]     │
│ └────────────────────────────────┘     │                       │
│                                        │ VISIBILIDADE          │
│                                        │ ○ Pública             │
│                                        │ ○ Restrita            │
│                                        │ ○ Privada (rascunho)  │
└────────────────────────────────────────┴───────────────────────┘
```

Em mobile, painel lateral colapsa em `Accordion` no fim da página.

### 9.6. Estados e microinterações

- **Loading:** sempre `Skeleton` no formato do conteúdo final (cards skeletonizados no feed, blocos no perfil). Nada de spinner global.
- **Vazio:** ilustração simples + texto + CTA. Ex.: feed vazio → "Nenhuma matéria ainda. Que tal publicar a primeira?" com botão.
- **Erro:** `Toast` (sonner) com mensagem clara e ação de retry quando aplicável.
- **Hover sutil:** cards ganham `hover:shadow-md transition-shadow`; botões ghost ganham `hover:bg-accent`.
- **Focus visível:** `focus-visible:ring-2 ring-ring ring-offset-2` em todos os interativos — vem por padrão no shadcn.

### 9.7. Referências visuais explícitas

O agente desenvolvedor deve consultar, ao implementar cada tela, a tela equivalente no LinkedIn como referência de espaçamento, hierarquia e densidade:

| Tela do MVP        | Referência LinkedIn                                  |
| ------------------ | ---------------------------------------------------- |
| `HomePage`         | Feed `/feed/` — composer + cards + sidebars         |
| `ProfilePage`      | `/in/<usuario>` — capa, avatar overlap, abas         |
| `PostDetailPage`   | Artigo do Pulse (`/pulse/...`) — leitura confortável |
| `PostNewPage`      | Editor de artigo do LinkedIn (`/article/new`)        |
| Navbar             | Topbar global do LinkedIn                            |

Não é cópia visual — é apropriação de **padrões de organização**, mantendo a identidade própria (cor accent, logo, voz editorial em PT-BR).

---

## 10. Telas do MVP — resumo de rotas

| Rota                    | Componente          | Auth | Layout                                                                                          |
| ----------------------- | ------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| `/`                     | `HomePage`          | —    | 3 colunas (sidebar esquerda mini-perfil, feed central com composer + cards, sidebar direita com editorias) |
| `/login`                | `LoginPage`         | —    | Centralizada, card único `max-w-md`                                                             |
| `/register`             | `RegisterPage`      | —    | Centralizada, card único, com seletor de tipo de conta (radio) e chips de interesses            |
| `/@:username`           | `ProfilePage`       | —    | Capa full-width + avatar overlap + tabs (Posts \| Sobre)                                        |
| `/me/edit`              | `ProfileEditPage`   | ✓    | Form em coluna única, max-w-2xl centralizada                                                    |
| `/post/new`             | `PostNewPage`       | ✓    | Página inteira: editor à esquerda + painel de metadados à direita                               |
| `/post/:id`             | `PostDetailPage`    | —/✓  | Coluna central de leitura (max-w-3xl), corpo serif, comentários no fim                          |
| `/post/:id/edit`        | `PostEditPage`      | ✓    | Mesma UI da new, hidratada com `content_json`                                                   |

**Componentes-chave (detalhes visuais na seção 9):**

- `PostCard` — header (avatar + nome + tipo badge + editoria + data relativa) → título → subtítulo → trecho de conteúdo (3 linhas com fade) → capa/galeria/player → contadores → ações inline.
- `Composer` no topo do feed — caixa clicável estilo LinkedIn que abre o dialog do editor.
- Chips de filtro de editoria sobre o feed (chamando `GET /posts?editoria=...`).

---

## 11. Setup e execução

### 11.1. `docker-compose.yml`

```yaml
version: "3.9"
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: redacao_escola
      MYSQL_USER: app
      MYSQL_PASSWORD: apppass
    ports: ["3306:3306"]
    volumes: ["mysql_data:/var/lib/mysql"]
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      retries: 20

  backend:
    build: ./backend
    depends_on:
      db: { condition: service_healthy }
    environment:
      DATABASE_URL: mysql+asyncmy://app:apppass@db:3306/redacao_escola
      JWT_SECRET: change-me-in-prod
      STORAGE_PATH: /app/storage/uploads
      CORS_ORIGINS: http://localhost:5173
    ports: ["8000:8000"]
    volumes: ["./backend/storage:/app/storage"]
    command: >
      sh -c "alembic upgrade head &&
             python scripts/seed.py &&
             uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

  frontend:
    build: ./frontend
    environment:
      VITE_API_BASE_URL: http://localhost:8000/api/v1
    ports: ["5173:5173"]
    command: npm run dev -- --host 0.0.0.0

volumes:
  mysql_data:
```

### 11.2. Comandos

```bash
docker-compose up --build
# Frontend:  http://localhost:5173
# API docs:  http://localhost:8000/docs  (Swagger gerado pelo FastAPI)
```

### 11.3. Seed de demonstração (`scripts/seed.py`)

Deve criar:
- 10 editorias e 10 interests (slugs definidos na seção 4.2).
- 4 usuários demo, **um de cada `account_type`**: `aluno@demo.br`, `professor@demo.br`, `egresso@demo.br`, `profissional@demo.br` (senha `demo1234`).
- 8 posts demo distribuídos entre formatos (`text`, `photo`, `audio`, `video`, `mixed`), com mídias de exemplo (usar fixtures em `backend/scripts/fixtures/`).
- 12 comentários espalhados.

---

## 12. O que **não** está no MVP (roadmap pós-demo)

Em ordem aproximada da Fase 2 → Fase 4 da proposta original. Cada item já tem um lugar previsto na arquitetura — nada exige refactor estrutural.

| Próximo módulo                       | Onde encaixa                                              |
| ------------------------------------ | --------------------------------------------------------- |
| **Selos de verificação** por tipo de conta | Já existe `account_type`; adicionar `verified: bool` + UI de badge. |
| **Sistema de níveis** (Estagiário → Editor-Chefe) | Novo serviço `level_service` lendo agregações de posts/comentários. |
| **Módulo pedagógico (turmas, rubricas, correção inline)** | Novas tabelas `classes`, `assignments`, `rubrics`, `submissions`, `inline_feedback`. |
| **Integração LMS (LTI 1.3, CSV)**    | Endpoint dedicado em `/integrations/lti`.                |
| **IA editorial (pré-revisão, plágio, detecção de IA, fact-check)** | Microsserviço separado consumido via fila (Redis/Celery) para não bloquear o request. |
| **Network/mentoria (matching, agenda)** | Tabelas `mentorships`, `sessions`; algoritmo de matching offline. |
| **Banco de pautas + parcerias**      | Tabelas `briefs`, `partner_outlets`; novo papel `outlet_editor`. |
| **Gamificação (pontos, badges, ranking)** | Tabelas `achievements`, `user_achievements`, leaderboard materializado. |
| **Vitrine pública institucional**    | Rota pública SSR-friendly (avaliar Next.js no momento da virada).|
| **SSO institucional (SAML/OAuth)**   | Substituir `auth_service` por adapter SAML/OIDC.         |
| **LGPD: trilha de auditoria, takedown, retenção** | Tabela `audit_log`, fluxo de moderação.           |
| **Editor multimídia (corte de áudio, tratamento de imagem)** | Cliente: integração com ffmpeg.wasm ou serviço backend assíncrono. |

---

## 13. Checklist de implementação (ordem sugerida)

Para o agente desenvolvedor, em sprints iterativos:

1. ☐ Bootstrap dos dois projetos (`backend/` e `frontend/`), Docker Compose, MySQL subindo.
2. ☐ Schema + migrações Alembic + seed básico (editorias e interests).
3. ☐ Auth completo: register, login, refresh, `/auth/me`, JWT middleware, hash bcrypt.
4. ☐ CRUD de usuário: `GET /users/{username}`, `PATCH /users/me`, upload de avatar/capa, interesses.
5. ☐ **Frontend: setup do design system** — Tailwind + `shadcn init` + tokens (seção 9.2) + Inter via Google Fonts + instalação dos componentes shadcn da seção 9.3.
6. ☐ **Frontend: AppLayout 3 colunas** (seção 9.4) — Navbar sticky + LeftSidebar (mini-perfil) + área central + RightSidebar + responsividade (Sheet drawer no mobile).
7. ☐ Frontend: páginas Login/Register (forms com shadcn `Form` + Zod), store Zustand, axios interceptors.
8. ☐ Frontend: `ProfilePage` (capa + avatar overlap + tabs) e `ProfileEditPage`.
9. ☐ Backend: CRUD de posts (sem mídia ainda), feed paginado, filtros.
10. ☐ Frontend: `PostCard` (anatomia da seção 9.5.3) + `HomePage` com composer (9.5.2) e cards do feed.
11. ☐ Frontend: integrar Tiptap em `PostNewPage` (layout da seção 9.5.6), salvar `content_html` + `content_json`.
12. ☐ Backend: endpoints de upload (imagem, vídeo, áudio) com Pillow para thumbs.
13. ☐ Frontend: botão de imagem na toolbar do Tiptap consumindo o endpoint.
14. ☐ Backend + Frontend: `post_media` (galeria/podcast/vídeo anexado fora do corpo).
15. ☐ Frontend: `PostDetailPage` (seção 9.5.5) com renderização de HTML sanitizado via `@tailwindcss/typography` + galeria + players (react-player, react-h5-audio-player).
16. ☐ Comentários: endpoints + UI no fim da página de detalhe.
17. ☐ Seed completo (usuários demo, posts demo, comentários).
18. ☐ **Polimento visual:** Skeletons (não spinners) em todos os loadings, empty states com ilustração + CTA, toasts via sonner, hover sutil em cards, focus rings visíveis. Comparar lado a lado com referências do LinkedIn (seção 9.7).
19. ☐ README com instruções de demo, credenciais dos usuários seed, screenshots opcionais.

---

## 14. Decisões abertas que o desenvolvedor pode resolver

- **Driver MySQL async vs sync** — recomendado `asyncmy` para alinhar com FastAPI async, mas `pymysql` + endpoints sync funciona e é mais simples para quem não conhece async SQLAlchemy. Escolha conforme conforto.
- **TypeScript no frontend** — recomendado, mas se prazo apertar, JS puro com PropTypes serve para MVP.
- **Internacionalização** — UI inteira em PT-BR hardcoded no MVP; se quiser preparar para i18n, usar `react-i18next` desde já com keys.
- **Tema dark/light** — opcional; shadcn/ui suporta nativo via `next-themes` (compatível com Vite).

---

**Fim do documento.** Qualquer ambiguidade que surgir durante a implementação deve ser resolvida na direção do que está descrito no documento de proposta original (módulos 4.1, 4.2, 4.3, 4.10) — esta versão MVP é deliberadamente um subconjunto daquela visão.
