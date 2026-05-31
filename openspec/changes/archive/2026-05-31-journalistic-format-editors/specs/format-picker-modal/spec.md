## ADDED Requirements

### Requirement: Modal de seleção de formato ao criar nova matéria
Ao navegar para `/post/new` sem um formato pré-selecionado via query param, o sistema SHALL exibir um modal de seleção de formato jornalístico antes de mostrar o editor. O modal SHALL listar as opções: Matéria, Podcast, Reportagem em Vídeo, Fotorreportagem, Multimídia.

#### Scenario: Modal abre automaticamente sem formato pré-selecionado
- **WHEN** o usuário navega para `/post/new` sem `?format=` na URL
- **THEN** o FormatPickerModal é exibido automaticamente sobre a página de edição

#### Scenario: Modal não abre quando formato já está definido
- **WHEN** o usuário navega para `/post/new?format=audio`
- **THEN** o FormatPickerModal não é exibido e o editor de áudio já aparece diretamente

#### Scenario: Seleção de formato
- **WHEN** o usuário clica em um dos cards de formato no modal
- **THEN** o modal fecha e o editor correspondente ao formato é exibido

#### Scenario: Fechar modal sem seleção
- **WHEN** o usuário fecha o modal sem selecionar um formato
- **THEN** o formato padrão `text` é aplicado e o editor de texto é exibido

### Requirement: Cards de formato com nome e ícone jornalístico
O modal SHALL exibir cada formato como um card com ícone e nome jornalístico: Matéria (FileText), Podcast (Mic), Reportagem em Vídeo (Video), Fotorreportagem (Camera), Multimídia (Layers).

#### Scenario: Cards renderizados corretamente
- **WHEN** o FormatPickerModal é aberto
- **THEN** cinco cards são exibidos, cada um com ícone Lucide e label jornalístico correspondente
