## ADDED Requirements

### Requirement: Layout split-screen com imagem e formulário
A página de login SHALL exibir um layout dividido em duas colunas em telas grandes (≥ `lg`): coluna esquerda com imagem de fundo, coluna direita com o formulário de autenticação. Em telas menores que `lg`, a coluna da imagem SHALL estar oculta e apenas a coluna do formulário SHALL ser exibida.

#### Scenario: Layout split-screen em desktop
- **WHEN** a página `/login` é acessada em uma tela com largura ≥ 1024px
- **THEN** a coluna esquerda exibe a imagem `auth-imagem.jpg` em modo cover ocupando toda a altura
- **AND** a coluna direita exibe o formulário de login

#### Scenario: Layout single-column em mobile
- **WHEN** a página `/login` é acessada em uma tela com largura < 1024px
- **THEN** apenas a coluna do formulário é exibida, centralizada, sem imagem lateral

### Requirement: Branding institucional UniPauta
O cabeçalho da coluna de formulário SHALL exibir a logo `uniplac-logo.png` seguida do texto "UniPauta" em lugar de qualquer ícone ou nome genérico.

#### Scenario: Logo e nome exibidos
- **WHEN** a coluna de formulário é renderizada
- **THEN** a imagem `/uniplac-logo.png` é exibida com dimensões adequadas (height ~32px)
- **AND** o texto "UniPauta" aparece ao lado ou abaixo da logo

### Requirement: Botão de autenticação com Google (UI placeholder)
A página de login SHALL exibir um botão "Continuar com Google" com ícone do Google antes do formulário de e-mail/senha. Ao ser clicado, o botão SHALL exibir um toast informativo indicando que a funcionalidade está em desenvolvimento. Nenhuma requisição de rede SHALL ser feita.

#### Scenario: Botão Google visível
- **WHEN** a página de login é renderizada
- **THEN** um botão com ícone Google e texto "Continuar com Google" é exibido acima do formulário

#### Scenario: Clique no botão Google exibe toast
- **WHEN** o usuário clica em "Continuar com Google"
- **THEN** um toast é exibido com a mensagem "Autenticação com Google em breve"
- **AND** nenhuma navegação ou requisição de rede ocorre

### Requirement: Remoção do link de registro
A página de login SHALL NOT exibir qualquer link ou referência à página de registro (`/register`).

#### Scenario: Ausência do link de registro
- **WHEN** a página `/login` é renderizada
- **THEN** nenhum link para `/register` ou texto "Criar conta" / "Registrar" é exibido

### Requirement: Tema global sky-700
As variáveis CSS `--primary` e `--ring` SHALL ser atualizadas para a cor sky-700 (`hsl(201 96% 32%)`) em `globals.css`, afetando todos os componentes que usam a cor primária na aplicação.

#### Scenario: Cor primária aplicada globalmente
- **WHEN** qualquer página da aplicação é renderizada
- **THEN** botões, rings de foco e elementos que usam `bg-primary` ou `text-primary` exibem a cor sky-700
