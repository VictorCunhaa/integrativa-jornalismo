## Context

O projeto é uma SPA Vite + React 18 + TypeScript com shadcn/ui já configurado (estilo `default`, CSS variables, base color `slate`). O sistema de autenticação é custom JWT via Zustand (`useAuthStore`) e Axios. A página de login atual (`LoginPage.tsx`) é um card centralizado de coluna única sem identidade visual da instituição. O tema global usa verde emerald como `--primary`. Os assets `auth-imagem.jpg` e `uniplac-logo.png` já existem em `frontend/public/`.

## Goals / Non-Goals

**Goals:**
- Aplicar layout split-screen inspirado no `login-02` do shadcn/ui (imagem esquerda, form direita)
- Incorporar branding institucional: logo `uniplac-logo.png` + nome "UniPauta"
- Substituir tema global `--primary` de emerald para sky-700
- Adicionar botão "Continuar com Google" como UI placeholder com feedback via toast
- Remover o link de registro da página de login
- Manter toda a lógica de autenticação existente intacta

**Non-Goals:**
- Implementar fluxo OAuth real com Google (backend não suporta)
- Alterar `RegisterPage.tsx` ou qualquer outra página
- Criar novos componentes reutilizáveis (tudo fica dentro de `LoginPage.tsx`)
- Suporte a dark mode
- Alterações no backend ou nos tokens JWT

## Decisions

### 1. Adaptar o padrão login-02 sem instalar o bloco pelo CLI

**Decisão:** Implementar o layout manualmente em `LoginPage.tsx` em vez de rodar `npx shadcn@latest add login-02`.

**Rationale:** O bloco login-02 do shadcn é projetado para Next.js (usa `next/image`, `next/link`). O projeto usa Vite + React Router. Adaptar manualmente evita conflitos e mantém as importações corretas (`react-router-dom`, tags `<img>` padrão). O padrão visual é simples o suficiente para replicação direta.

**Alternativa descartada:** Instalar via CLI e ajustar — gera arquivos extras e risco de sobrescrever componentes existentes.

---

### 2. Troca global de `--primary` para sky-700

**Decisão:** Atualizar as variáveis CSS em `globals.css` (modos light e dark):
```css
--primary: 199 89% 48%;          /* sky-700: #0369a1 → hsl(199 89% 48%) — aproximação */
--primary-foreground: 0 0% 100%;
--ring: 199 89% 48%;
```

> Nota: sky-700 no Tailwind é `#0369a1`. Em HSL: aproximadamente `hsl(201 96% 32%)`. Será usado o valor exato do Tailwind para consistência.

**Rationale:** O usuário solicitou sky-700 como cor principal da faculdade aplicada globalmente. Alterar apenas as variáveis CSS afeta toda a aplicação de forma consistente sem tocar em nenhum componente individualmente.

**Alternativa descartada:** Criar uma classe utilitária local no login — não atenderia o requisito de tema global.

---

### 3. Botão Google como UI placeholder

**Decisão:** O botão "Continuar com Google" exibe um `toast` via `sonner` com a mensagem "Autenticação com Google em breve" ao ser clicado. Não faz nenhuma chamada de rede.

**Rationale:** Backend não possui endpoint OAuth. A instrução explícita do usuário foi "UI only (placeholder)". O toast é o padrão já usado no projeto para feedback de ações.

**Ícone Google:** Usar SVG inline com as cores oficiais do Google (sem dependência extra).

---

### 4. Layout responsivo

**Decisão:** A coluna da imagem usa `hidden lg:block` (oculta em telas menores que `lg`). Em mobile, apenas a coluna do formulário é exibida, centralizada e com padding adequado.

**Rationale:** Comportamento padrão do bloco login-02 do shadcn. Garante usabilidade em dispositivos móveis sem lógica extra.

## Risks / Trade-offs

- **Impacto visual global da troca de tema:** Ao mudar `--primary` de emerald para sky-700, todos os botões, rings, badges e elementos que usam a cor primária mudarão visualmente. Isso é intencional conforme solicitado, mas requer inspeção visual das outras páginas após a implementação.
  → Mitigação: A mudança é somente nas variáveis CSS — revertível em um único commit.

- **sky-700 em HSL:** O valor exato do Tailwind sky-700 (`#0369a1`) em HSL é `201 96% 32%`, que é mais escuro que sky-500. Deve ser verificado visualmente se o contraste com `--primary-foreground: white` é adequado (WCAG AA exige ratio 4.5:1).
  → Mitigação: Testar no browser após implementar; se necessário, ajustar para sky-600 (`#0284c7`, HSL `201 90% 40%`).

## Open Questions

- Nenhuma questão em aberto — todas as decisões foram validadas com o usuário antes da proposta.
