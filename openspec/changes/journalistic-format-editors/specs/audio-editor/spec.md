## ADDED Requirements

### Requirement: Upload de arquivo de áudio com waveform
O AudioEditor SHALL permitir upload de arquivo de áudio (mp3, wav, ogg) e exibir o waveform do arquivo via WaveSurfer.js. O arquivo é carregado localmente antes do upload ao servidor.

#### Scenario: Arquivo selecionado gera waveform
- **WHEN** o usuário seleciona ou arrasta um arquivo de áudio
- **THEN** o waveform é renderizado via WaveSurfer.js e o arquivo ainda não foi enviado ao servidor

#### Scenario: Controles de playback disponíveis
- **WHEN** o waveform está renderizado
- **THEN** o usuário pode dar play, pause e navegar pelo áudio clicando no waveform

### Requirement: Trim de áudio com região visual
O AudioEditor SHALL exibir uma região arrastável sobre o waveform para definir o ponto de início e fim do corte. O sistema SHALL usar o plugin Regions do WaveSurfer.js.

#### Scenario: Região de trim visível
- **WHEN** o waveform é renderizado
- **THEN** uma região sombreada é exibida sobre o waveform com handles arrastáveis de início e fim

#### Scenario: Aplicar corte
- **WHEN** o usuário clica em "Aplicar Corte"
- **THEN** FFmpeg.wasm processa o arquivo com `-ss {start} -to {end} -c copy`, o resultado é exibido no player para preview, e o arquivo original é substituído pelo cortado

### Requirement: Upload do arquivo processado ao servidor
Após o trim (ou diretamente se não houver trim), o AudioEditor SHALL enviar o arquivo via `POST /uploads/audio` ao confirmar.

#### Scenario: Arquivo enviado ao confirmar
- **WHEN** o usuário confirma o áudio (com ou sem trim aplicado)
- **THEN** o arquivo é enviado via `useUploadAudio()` e a URL retornada é salva como PostMedia com `media_type: 'audio'`

### Requirement: Tab de link externo
O AudioEditor SHALL oferecer uma aba alternativa para inserir um link externo (Spotify, YouTube, SoundCloud) em vez de fazer upload.

#### Scenario: Preview de link externo
- **WHEN** o usuário insere uma URL válida na aba de link externo
- **THEN** um player de preview é exibido via react-player

#### Scenario: Link salvo como embed
- **WHEN** o usuário confirma o link externo
- **THEN** a URL é salva como PostMedia com `media_type: 'embed'`
