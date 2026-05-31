## Why

Os formatos de post atuais (Texto, Foto, Áudio, Vídeo, Multimídia) são categorias técnicas que não refletem o vocabulário jornalístico dos estudantes. Além disso, todos os formatos usam o mesmo editor Tiptap, sem uma experiência de criação adaptada ao tipo de conteúdo — áudio não tem waveform, vídeo não tem trim, foto não tem galeria dedicada. Esta mudança transforma a criação de posts em um fluxo orientado a gêneros jornalísticos com editores especializados por formato.

## What Changes

- **Novo modal de seleção de formato** (`FormatPickerModal`) exibido antes do editor ao criar uma nova matéria, com os formatos: Matéria, Podcast, Reportagem em Vídeo, Fotorreportagem, Multimídia
- **Novos labels jornalísticos** para os formatos existentes no frontend (`FORMAT_LABELS` e `Composer.tsx`) — sem alteração no backend enum (`text/audio/video/photo/mixed`)
- **`AudioEditor`** para o formato `audio` (Podcast): upload de arquivo + waveform via WaveSurfer.js com região de trim + trim lossless via FFmpeg.wasm + tab de link externo (Spotify/YouTube/SoundCloud)
- **`VideoEditor`** para o formato `video` (Reportagem em Vídeo): upload de arquivo + preview `<video>` nativo + scrubber de trim + trim via FFmpeg.wasm + tab de link YouTube
- **`PhotoEditor`** para o formato `photo` (Fotorreportagem): upload múltiplo de imagens com legenda e crédito por imagem, usando `useUploadImage()` já existente
- **Refatoração de `PostNewPage` e `PostEditPage`** para renderizar o editor correto conforme o formato selecionado
- Todos os novos editores devem ter o código testado no ambiente Docker (WSL) após cada implementação

## Capabilities

### New Capabilities
- `format-picker-modal`: Modal de seleção de formato jornalístico exibido na criação de nova matéria
- `audio-editor`: Editor especializado para posts de áudio com waveform, trim e suporte a links externos
- `video-editor`: Editor especializado para posts de vídeo com preview, trim e suporte a links YouTube
- `photo-editor`: Editor especializado para fotorreportagens com upload múltiplo e metadados por imagem

### Modified Capabilities
- `post-card-actions`: Labels dos formatos nos badges dos posts mudam de "Texto/Foto/Áudio/Vídeo/Multimídia" para "Matéria/Fotorreportagem/Podcast/Vídeo/Multimídia"

## Impact

- **Frontend (novos arquivos)**: `FormatPickerModal.tsx`, `AudioEditor.tsx`, `VideoEditor.tsx`, `PhotoEditor.tsx`
- **Frontend (modificados)**: `PostNewPage.tsx`, `PostEditPage.tsx`, `Composer.tsx`, `lib/utils.ts` (`FORMAT_LABELS`)
- **Novas dependências frontend**: `wavesurfer.js`, `@wavesurfer/plugins`, `@ffmpeg/ffmpeg`, `@ffmpeg/util`
- **Backend**: sem alterações (enum `PostFormat` mantido; rotas `/uploads/audio` e `/uploads/video` já existem)
- **Vite config**: adicionar headers COOP/COEP para habilitar `SharedArrayBuffer` (requisito do FFmpeg.wasm)
- **Docker/WSL**: ambiente de desenvolvimento; todos os editores devem ser testados em execução real após cada implementação
