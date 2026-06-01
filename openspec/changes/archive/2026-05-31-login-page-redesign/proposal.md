## Why

A página de login atual utiliza um layout minimalista de coluna única sem identidade visual da instituição, tornando a experiência genérica e sem conexão com a marca UniPauta/Uniplac. O redesign aplica o padrão `login-02` do shadcn/ui com layout split-screen, branding institucional e tema de cores alinhado à identidade visual da faculdade.

## What Changes

- Substituição completa do layout de `LoginPage.tsx` por um split-screen: imagem à esquerda, formulário à direita
- Inserção da imagem `auth-imagem.jpg` na coluna esquerda (full-height cover)
- Substituição do ícone genérico por `uniplac-logo.png` com o nome "UniPauta" no cabeçalho da coluna de login
- Adição de botão "Continuar com Google" (UI placeholder — sem backend OAuth)
- Remoção do link para registro (`/register`)
- Textos todos em português do Brasil (já existentes, revisados)
- Atualização global do `--primary` para sky-700 (`hsl(199 89% 48%)`), substituindo o verde emerald atual em toda a aplicação

## Capabilities

### New Capabilities

- `login-page`: Página de login com layout split-screen, branding UniPauta, tema sky-700 e botão Google (UI only)

### Modified Capabilities

- `post-card-actions`: Ajuste visual nos badges/botões de ação que usam a cor `--primary` (impacto indireto da troca de tema global)

## Impact

- `frontend/src/pages/LoginPage.tsx` — reescrita completa
- `frontend/src/styles/globals.css` — atualização das variáveis CSS `--primary`, `--primary-foreground`, `--ring` (impacto global de tema)
- Nenhuma nova dependência npm necessária
- Sem alterações no backend ou na lógica de autenticação existente
- `RegisterPage.tsx` não é alterado (continua existindo na rota `/register`, apenas o link é removido do login)
