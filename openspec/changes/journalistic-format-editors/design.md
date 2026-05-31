## Context

O projeto é uma plataforma de jornalismo escolar com frontend React 18 + TypeScript (Vite), Tailwind CSS, Radix UI e backend FastAPI + SQLAlchemy + MySQL. Posts são criados via `PostNewPage.tsx` e editados via `PostEditPage.tsx`, ambos usando sempre o editor Tiptap independentemente do formato. O backend já possui endpoints `/uploads/audio` e `/uploads/video` com hooks frontend (`useUploadAudio`, `useUploadVideo`) que nunca foram conectados a nenhum componente de UI. O enum `PostFormat` (text/photo/audio/video/mixed) é mantido no banco — apenas os labels e a experiência de criação mudam.

O ambiente de desenvolvimento roda via Docker Compose no WSL. Todo código novo deve ser testado em execução real (`wsl docker compose up`) antes de considerar a tarefa concluída.

## Goals / Non-Goals

**Goals:**
- Modal de seleção de formato jornalístico ao criar nova matéria
- Editor especializado por formato: Tiptap (matéria), AudioEditor com waveform + trim (podcast), VideoEditor com preview + trim (vídeo), PhotoEditor com galeria multi-imagem (fotorreportagem)
- Trim lossless de áudio e vídeo via FFmpeg.wasm no cliente
- Labels jornalísticos nos badges de formato do feed
- Compatibilidade com PostEditPage (carregar editor correto ao editar post existente)
- Testar cada editor no ambiente Docker/WSL após implementação

**Non-Goals:**
- Alterações no backend ou banco de dados
- Drag-to-reorder de fotos na galeria
- Entrevista como formato separado
- Edição de vídeo além de trim (corte de início/fim)
- Suporte a formatos de arquivo além dos já aceitos pelo backend

## Decisions

### 1. Labels jornalísticos: frontend only
`FORMAT_LABELS` em `lib/utils.ts` muda de `{ text: 'Texto', ... }` para `{ text: 'Matéria', photo: 'Fotorreportagem', audio: 'Podcast', video: 'Vídeo', mixed: 'Multimídia' }`. O enum backend permanece intocado. `Composer.tsx` e qualquer hard-code de labels de formato no frontend são atualizados para os novos nomes.

### 2. FormatPickerModal: Radix UI Dialog
Usa `<Dialog>` do `@radix-ui/react-dialog` (já instalado). Aparece automaticamente em `PostNewPage` quando nenhum formato está pré-selecionado via query param. Também pode ser reaberto via botão "Trocar formato" no sidebar da página de edição. Não bloqueia navegação — se o usuário fechar sem escolher, vai para o formato padrão `text`.

### 3. Estrutura dos editores: componentes independentes
Cada editor é um componente autônomo que recebe e emite `{ html, json }` para conteúdo de texto, e `mediaItems` para mídia. `PostNewPage` e `PostEditPage` fazem o switch baseado em `format`:

```
switch(format) {
  case 'text':  → <PostEditor> (Tiptap atual, sem alteração)
  case 'audio': → <AudioEditor>
  case 'video': → <VideoEditor>
  case 'photo': → <PhotoEditor>
  case 'mixed': → <PostEditor> (Tiptap, igual ao text)
}
```

**Alternativa considerada:** criar um único `UnifiedEditor` com seções condicionais. Rejeitado — acoplamento desnecessário, dificulta manutenção independente de cada editor.

### 4. FFmpeg.wasm: versão single-thread + lazy load
Usar `@ffmpeg/ffmpeg` + `@ffmpeg/util` v0.12. Optar pela variante **single-thread** (`@ffmpeg/core`) para evitar a exigência de `SharedArrayBuffer` (que requer headers COOP/COEP e pode causar problemas com hot reload do Vite em dev).

O módulo FFmpeg é importado com `React.lazy` + `Suspense` ou carregado dinamicamente via `import()` apenas quando o usuário abre AudioEditor ou VideoEditor. Os arquivos `.wasm` e `.js` do core são carregados via CDN (unpkg) na primeira inicialização — sem impacto no bundle principal.

**Alternativa considerada:** variante multi-thread com SharedArrayBuffer + headers Vite. Rejeitada — complexidade de configuração COOP/COEP pode quebrar iframes de preview do Tiptap e causar problemas com assets externos.

### 5. AudioEditor: WaveSurfer.js + Regions plugin
`wavesurfer.js` v7 + `@wavesurfer/plugins` (Regions). Fluxo:
1. Usuário seleciona arquivo → `URL.createObjectURL()` → WaveSurfer carrega localmente (sem upload ainda)
2. Regions plugin renderiza uma região arrastável sobre o waveform
3. Usuário posiciona início/fim do corte
4. "Aplicar Corte" → FFmpeg executa `-ss {start} -to {end} -c copy` → `Blob` resultante
5. Preview do resultado no mesmo player
6. "Confirmar" → `useUploadAudio()` → salva URL como `PostMedia`

Tab "Link externo" (Spotify, YouTube, SoundCloud): campo de URL + `react-player` preview. Nenhum upload, salva URL diretamente como `PostMedia` com `media_type: 'embed'`.

### 6. VideoEditor: `<video>` nativo + range scrubber
Não usa WaveSurfer. O elemento `<video>` HTML5 nativo tem seek via `currentTime`. A UI de trim é dois inputs `<input type="range">` sincronizados com `currentTime`:
- Range inferior (início do trim)
- Range superior (fim do trim)
- Preview em loop da região selecionada

"Aplicar Corte" → mesmo FFmpeg.wasm com `-ss {start} -to {end} -c copy` → `Blob` → upload via `useUploadVideo()`.

Tab "YouTube/Link": campo de URL + `react-player` preview. Salva como `PostMedia` com `media_type: 'embed'`.

### 7. PhotoEditor: upload sequencial com useUploadImage
Cada imagem é carregada individualmente via `useUploadImage()` ao ser selecionada (sem batch). A lista de `PostMedia` é mantida em estado local e enviada em sequência via `POST /posts/:id/media` após a criação/atualização do post.

### 8. Integração com PostNewPage e PostEditPage
`PostNewPage` já passa `?format=` via query param do Composer. A lógica de criação do post (título, subtítulo, editoria, visibilidade) permanece no sidebar. O corpo central exibe o editor correto. Ao salvar, o post é criado primeiro (`POST /posts`), depois as mídias são adicionadas via `POST /posts/:id/media`.

`PostEditPage` carrega o post existente e inicializa o editor correto com o `format` já salvo. Para posts de áudio/vídeo existentes, o editor mostra o player do arquivo já salvo com opção de substituir.

## Risks / Trade-offs

- **[FFmpeg.wasm + arquivos grandes]** → O trim de vídeos grandes (>200MB) pode ser lento no single-thread. Mitigação: exibir spinner de progresso com `ffmpeg.on('progress')`. Para uso escolar, arquivos tendem a ser menores.
- **[WaveSurfer + re-renders]** → WaveSurfer inicializa no DOM diretamente (não é React-controlled). Deve ser inicializado em `useEffect` com container ref, e destruído no cleanup para evitar memory leaks.
- **[PostEditPage + áudio/vídeo]** → Posts existentes têm a mídia salva em `post.media`. O editor deve detectar se já existe uma mídia e exibir o player do arquivo salvo em vez da tela de upload vazia.
- **[CDN FFmpeg.wasm offline]** → Se o usuário estiver sem internet, os arquivos .wasm não carregam. Mitigação: erro claro na UI + fallback de upload sem trim.
- **[React StrictMode double-mount]** → Em dev, `useEffect` roda duas vezes. A inicialização do WaveSurfer deve ser idempotente (destroy antes de re-init).

## Migration Plan

1. Instalar dependências no container frontend (rebuild necessário)
2. Configurar Vite dev server (sem headers COOP/COEP por causa da escolha single-thread)
3. Implementar componentes na ordem: FormatPickerModal → PhotoEditor → AudioEditor → VideoEditor
4. Atualizar PostNewPage e PostEditPage
5. Testar cada editor no ambiente Docker/WSL após implementação
6. Rollback: os novos editores são aditivos; reverter significa apenas restaurar o switch para sempre renderizar `<PostEditor>`
