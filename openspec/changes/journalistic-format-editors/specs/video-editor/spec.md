## ADDED Requirements

### Requirement: Upload de arquivo de vídeo com preview
O VideoEditor SHALL permitir upload de arquivo de vídeo (mp4, webm) e exibir um player `<video>` nativo para preview antes do envio ao servidor.

#### Scenario: Arquivo selecionado exibe preview
- **WHEN** o usuário seleciona ou arrasta um arquivo de vídeo
- **THEN** um player `<video>` HTML5 é exibido com o arquivo carregado localmente

### Requirement: Trim de vídeo com scrubber de início e fim
O VideoEditor SHALL exibir dois controles deslizantes (`<input type="range">`) para definir o ponto de início e fim do corte, sincronizados com o `currentTime` do player de vídeo.

#### Scenario: Scrubbers sincronizados com o player
- **WHEN** o usuário arrasta o scrubber de início ou fim
- **THEN** o player avança para o ponto correspondente para visualização

#### Scenario: Aplicar corte de vídeo
- **WHEN** o usuário clica em "Aplicar Corte"
- **THEN** FFmpeg.wasm processa o vídeo com `-ss {start} -to {end} -c copy`, o resultado é exibido no player para preview

### Requirement: Upload do arquivo processado ao servidor
Após o trim (ou diretamente), o VideoEditor SHALL enviar o arquivo via `POST /uploads/video` ao confirmar.

#### Scenario: Arquivo enviado ao confirmar
- **WHEN** o usuário confirma o vídeo
- **THEN** o arquivo é enviado via `useUploadVideo()` e a URL é salva como PostMedia com `media_type: 'video'`

### Requirement: Tab de link YouTube
O VideoEditor SHALL oferecer uma aba alternativa para inserir uma URL do YouTube.

#### Scenario: Preview de YouTube
- **WHEN** o usuário insere uma URL do YouTube
- **THEN** um embed de preview é exibido via react-player

#### Scenario: YouTube salvo como embed
- **WHEN** o usuário confirma o link YouTube
- **THEN** a URL é salva como PostMedia com `media_type: 'embed'`
