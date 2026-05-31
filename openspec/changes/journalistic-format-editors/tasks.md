## 1. Dependências e Configuração

- [x] 1.1 Instalar `wavesurfer.js` e `@wavesurfer/plugins` no frontend: `npm install wavesurfer.js @wavesurfer/plugins`
- [x] 1.2 Instalar `@ffmpeg/ffmpeg` e `@ffmpeg/util` no frontend: `npm install @ffmpeg/ffmpeg @ffmpeg/util`
- [x] 1.3 Configurar `vite.config.ts` para servir os assets do FFmpeg.wasm com os headers necessários e adicionar `optimizeDeps.exclude` para `@ffmpeg/ffmpeg`
- [x] 1.4 Rebuild do container frontend e verificar que o app carrega sem erros: `wsl docker compose up -d --build frontend` e testar no browser

## 2. Labels Jornalísticos

- [x] 2.1 Atualizar `FORMAT_LABELS` em `frontend/src/lib/utils.ts`: `text→Matéria`, `photo→Fotorreportagem`, `audio→Podcast`, `video→Vídeo`, `mixed→Multimídia`
- [x] 2.2 Atualizar `Composer.tsx` para usar os novos labels e ícones jornalísticos nos botões de atalho
- [ ] 2.3 Verificar no browser que os badges de formato no feed exibem os novos labels

## 3. FormatPickerModal

- [x] 3.1 Criar `frontend/src/components/editor/FormatPickerModal.tsx` com os 5 cards de formato usando Radix UI Dialog, ícones Lucide (FileText, Mic, Video, Camera, Layers) e labels jornalísticos
- [ ] 3.2 Testar o modal no browser: abrir `/post/new`, confirmar que o modal aparece, selecionar cada formato e verificar que o modal fecha

## 4. PhotoEditor

- [x] 4.1 Criar `frontend/src/components/editor/PhotoEditor.tsx`: grid de upload múltiplo com `useUploadImage()`, miniaturas com botão de remoção, campos de legenda e crédito por imagem
- [x] 4.2 Integrar `PhotoEditor` em `PostNewPage` para o formato `photo` (substituir o Tiptap quando format === 'photo')
- [ ] 4.3 Testar no browser: criar post de Fotorreportagem, fazer upload de imagens, adicionar legendas, salvar e verificar que as imagens aparecem no post publicado
- [x] 4.4 Integrar `PhotoEditor` em `PostEditPage` carregando as mídias existentes do post

## 5. AudioEditor

- [x] 5.1 Criar `frontend/src/components/editor/AudioEditor.tsx` com Tab "Upload": dropzone de arquivo, inicialização do WaveSurfer.js com Regions plugin via `useEffect`, controles play/pause
- [x] 5.2 Implementar lógica de trim no `AudioEditor`: capturar `region.start` e `region.end`, chamar FFmpeg.wasm com `-ss {start} -to {end} -c copy`, exibir preview do resultado
- [x] 5.3 Implementar Tab "Link externo" no `AudioEditor`: input de URL + preview via `react-player` + salvar como `media_type: 'embed'`
- [x] 5.4 Integrar `AudioEditor` em `PostNewPage` para o formato `audio`
- [ ] 5.5 Testar no browser: criar post de Podcast, fazer upload de áudio, verificar waveform, aplicar trim, confirmar upload e verificar que o áudio aparece no post
- [x] 5.6 Integrar `AudioEditor` em `PostEditPage` carregando a mídia de áudio existente

## 6. VideoEditor

- [x] 6.1 Criar `frontend/src/components/editor/VideoEditor.tsx` com Tab "Upload": dropzone de vídeo, player `<video>` nativo, dois `<input type="range">` para trim sincronizados com `currentTime`
- [x] 6.2 Implementar lógica de trim no `VideoEditor`: capturar valores dos ranges, chamar FFmpeg.wasm com `-ss {start} -to {end} -c copy`, exibir preview do resultado
- [x] 6.3 Implementar Tab "YouTube/Link" no `VideoEditor`: input de URL + preview via `react-player` + salvar como `media_type: 'embed'`
- [x] 6.4 Integrar `VideoEditor` em `PostNewPage` para o formato `video`
- [ ] 6.5 Testar no browser: criar post de Vídeo, fazer upload, verificar player e scrubbers, aplicar trim, confirmar upload e verificar no post publicado
- [x] 6.6 Integrar `VideoEditor` em `PostEditPage` carregando a mídia de vídeo existente

## 7. Refatoração de PostNewPage

- [x] 7.1 Adicionar `FormatPickerModal` ao `PostNewPage`: abrir automaticamente quando `format` não está definido na URL, fechar ao selecionar ou ao clicar fora (defaultando para `text`)
- [x] 7.2 Substituir o `<PostEditor>` fixo pelo switch de editores: `text/mixed → PostEditor`, `audio → AudioEditor`, `video → VideoEditor`, `photo → PhotoEditor`
- [x] 7.3 Ajustar a lógica de save em `PostNewPage` para salvar as mídias via `POST /posts/:id/media` após criar o post (para photo/audio/video)
- [x] 7.4 Remover o RadioGroup de formato do sidebar de `PostNewPage` (substituído pelo modal)
- [ ] 7.5 Testar fluxo completo no browser: abrir `/post/new`, selecionar cada formato no modal, preencher e salvar, verificar resultado no feed

## 8. Refatoração de PostEditPage

- [x] 8.1 Substituir o `<PostEditor>` fixo pelo switch de editores em `PostEditPage`, usando o `format` do post carregado
- [x] 8.2 Remover o RadioGroup de formato do sidebar de `PostEditPage` (formato não deve ser alterado na edição)
- [ ] 8.3 Testar edição de posts existentes de cada formato no browser: abrir post de áudio/vídeo/foto no editor, verificar que o editor correto carrega com a mídia existente

## 9. Verificação Final

- [ ] 9.1 Testar fluxo completo de Matéria: criar, editar, publicar, visualizar no feed com badge "Matéria"
- [ ] 9.2 Testar fluxo completo de Podcast: upload de áudio, trim, publicar, verificar player no post
- [ ] 9.3 Testar fluxo completo de Vídeo: upload de vídeo, trim, publicar, verificar player no post
- [ ] 9.4 Testar fluxo completo de Fotorreportagem: upload de múltiplas fotos com legendas, publicar, verificar galeria no post
- [ ] 9.5 Verificar que os badges de formato no feed exibem os labels jornalísticos corretos para cada post
- [ ] 9.6 Verificar que não há erros de console no Docker/WSL durante nenhum dos fluxos acima
