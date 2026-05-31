## ADDED Requirements

### Requirement: Painel de comentários inline no card do feed
O `PostCard` SHALL exibir um painel de comentários inline abaixo do card ao clicar no botão "Comentar", sem navegar para outra página.

#### Scenario: Abrir painel
- **WHEN** o usuário clica no botão "Comentar" de um `PostCard`
- **THEN** um painel de comentários é exibido inline abaixo do card, sem mudança de rota

#### Scenario: Fechar painel
- **WHEN** o usuário clica novamente no botão "Comentar" com o painel aberto
- **THEN** o painel é ocultado

### Requirement: Preview dos 2 comentários mais recentes
O painel SHALL exibir no máximo os 2 comentários mais recentes do post quando aberto.

#### Scenario: Post com comentários
- **WHEN** o painel é aberto e o post possui comentários
- **THEN** os 2 comentários mais recentes são exibidos com avatar, nome do autor e texto

#### Scenario: Post sem comentários
- **WHEN** o painel é aberto e o post não possui comentários
- **THEN** uma mensagem indicando ausência de comentários é exibida

#### Scenario: Carregamento lazy
- **WHEN** o `PostCard` é renderizado no feed
- **THEN** nenhuma requisição para comentários é feita até o painel ser aberto pela primeira vez

### Requirement: Link "Mostrar mais" para a página de detalhes
O painel SHALL exibir um link "Mostrar mais" quando o post tiver mais de 2 comentários.

#### Scenario: Post com mais de 2 comentários
- **WHEN** o painel está aberto e `comment_count > 2`
- **THEN** o link "Mostrar mais" é exibido abaixo dos comentários

#### Scenario: Navegação ao clicar em "Mostrar mais"
- **WHEN** o usuário clica em "Mostrar mais"
- **THEN** o navegador vai para `/post/:id#comments`, exibindo a página de detalhes ancorada nos comentários

#### Scenario: Post com 2 ou menos comentários
- **WHEN** o painel está aberto e `comment_count <= 2`
- **THEN** o link "Mostrar mais" NÃO é exibido

### Requirement: Formulário de comentário inline para usuários autenticados
O painel SHALL exibir um formulário (textarea + botão Enviar) para usuários autenticados submeterem comentários sem sair do feed.

#### Scenario: Usuário autenticado vê o formulário
- **WHEN** o painel é aberto por um usuário autenticado
- **THEN** um textarea e um botão "Enviar" são exibidos no painel

#### Scenario: Submissão bem-sucedida
- **WHEN** o usuário preenche o textarea e clica em "Enviar"
- **THEN** o comentário é criado, o textarea é limpo e os comentários exibidos no painel são atualizados

#### Scenario: Botão desabilitado com textarea vazio
- **WHEN** o textarea está vazio ou contém apenas espaços
- **THEN** o botão "Enviar" está desabilitado

#### Scenario: Usuário não autenticado não vê o formulário
- **WHEN** o painel é aberto por um usuário não autenticado
- **THEN** o formulário de submissão NÃO é exibido

### Requirement: Atualização do contador de comentários
O `comment_count` exibido no botão "Comentar" do card SHALL refletir o valor atualizado após uma submissão bem-sucedida.

#### Scenario: Contador atualiza após envio
- **WHEN** um comentário é submetido com sucesso pelo painel inline
- **THEN** o `comment_count` no botão "Comentar" incrementa para refletir o novo total
