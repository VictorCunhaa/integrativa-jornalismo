## 1. Tema Global (globals.css)

- [x] 1.1 Abrir `frontend/src/styles/globals.css` e localizar as variáveis `--primary`, `--primary-foreground` e `--ring` no bloco `:root`
- [x] 1.2 Atualizar `--primary` para `201 96% 32%` (sky-700 — `#0369a1`)
- [x] 1.3 Atualizar `--ring` para `201 96% 32%` (mesmo valor que `--primary`)
- [x] 1.4 Manter `--primary-foreground` como `0 0% 100%` (branco — contraste adequado)
- [x] 1.5 Verificar se o bloco `.dark` também possui essas variáveis e atualizar de forma equivalente se existir

## 2. Estrutura do Layout Split-Screen

- [x] 2.1 Abrir `frontend/src/pages/LoginPage.tsx` e remover o layout atual de card centralizado
- [x] 2.2 Criar wrapper raiz com `min-h-screen flex` para dividir as duas colunas
- [x] 2.3 Adicionar coluna esquerda: `hidden lg:block lg:w-1/2 relative overflow-hidden`
- [x] 2.4 Inserir `<img src="/auth-imagem.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />` dentro da coluna esquerda
- [x] 2.5 Adicionar coluna direita: `w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 bg-background`

## 3. Branding UniPauta

- [x] 3.1 No topo da coluna direita, adicionar uma `<div>` com `flex items-center gap-2 mb-8`
- [x] 3.2 Inserir `<img src="/uniplac-logo.png" alt="Uniplac" className="h-8 w-auto" />`
- [x] 3.3 Inserir `<span className="text-xl font-bold text-foreground">UniPauta</span>` ao lado da logo
- [x] 3.4 Remover qualquer referência ao ícone `<Newspaper>` ou ao texto "Redação-Escola Digital"

## 4. Botão "Continuar com Google"

- [x] 4.1 Abaixo do bloco de branding, adicionar um `<Button variant="outline" className="w-full max-w-sm">` com ícone SVG do Google inline e texto "Continuar com Google"
- [x] 4.2 Adicionar SVG do Google com cores oficiais (vermelho, amarelo, verde, azul) — inserir como SVG inline com `width="18" height="18"`
- [x] 4.3 Conectar `onClick` ao `toast("Autenticação com Google em breve")` via `sonner` (já importado no projeto)
- [x] 4.4 Adicionar separador visual entre o botão Google e o formulário: `<div className="flex items-center gap-2 w-full max-w-sm"><hr className="flex-1" /><span className="text-xs text-muted-foreground">ou</span><hr className="flex-1" /></div>`

## 5. Formulário de Login

- [x] 5.1 Manter os campos existentes de e-mail e senha com a lógica `react-hook-form` + `zod` intacta
- [x] 5.2 Manter o `onSubmit` que chama `POST /auth/login` via `useAuthStore` sem alterações
- [x] 5.3 Limitar o formulário a `w-full max-w-sm` para alinhar com o botão Google
- [x] 5.4 Remover completamente o link `<Link to="/register">` e qualquer texto "Criar conta" / "Registrar" / "Não tem conta?"
- [x] 5.5 Manter o link "Esqueceu a senha?" se existir, ou omitir se não existia no layout original
- [x] 5.6 Manter a dica de credenciais demo se ela existia no layout original (avaliar se mantém ou remove por ser de desenvolvimento)

## 6. Verificação Visual no Browser

- [ ] 6.1 Iniciar o frontend (`docker compose up` ou `npm run dev` no diretório frontend)
- [ ] 6.2 Acessar `/login` e verificar: imagem à esquerda, formulário à direita, logo UniPauta visível
- [ ] 6.3 Verificar que o botão "Continuar com Google" exibe o toast ao clicar
- [ ] 6.4 Verificar que não há link de registro visível
- [ ] 6.5 Redimensionar para mobile (< 1024px) e confirmar que apenas a coluna do formulário é exibida
- [ ] 6.6 Verificar que os botões e elementos primários (ex: botão "Entrar") exibem a cor sky-700 azul
- [ ] 6.7 Navegar para outra página (ex: feed) e verificar que o tema sky-700 está aplicado globalmente
- [ ] 6.8 Confirmar que o login funcional com credenciais demo (`aluno@demo.br / demo1234`) continua operando normalmente
