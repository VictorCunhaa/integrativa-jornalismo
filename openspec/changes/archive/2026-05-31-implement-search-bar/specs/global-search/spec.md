## ADDED Requirements

### Requirement: Endpoint de busca unificada
O sistema SHALL expor `GET /api/v1/search?q=<termo>&page=<int>&size=<int>` retornando perfis e posts que correspondam ao termo buscado. A busca SHALL ser case-insensitive. Quando `q` estiver ausente ou vazio, o endpoint SHALL retornar HTTP 400.

#### Scenario: Busca com termo válido
- **WHEN** cliente envia `GET /api/v1/search?q=maria`
- **THEN** sistema retorna HTTP 200 com `{ profiles: [...], posts: [...], total_profiles: int, total_posts: int }`

#### Scenario: Busca com query vazia
- **WHEN** cliente envia `GET /api/v1/search?q=`
- **THEN** sistema retorna HTTP 400

#### Scenario: Busca sem resultados
- **WHEN** cliente envia `GET /api/v1/search?q=xyzxyzxyz123`
- **THEN** sistema retorna HTTP 200 com `{ profiles: [], posts: [], total_profiles: 0, total_posts: 0 }`

#### Scenario: Busca case-insensitive
- **WHEN** cliente envia `GET /api/v1/search?q=MARIA`
- **THEN** sistema retorna os mesmos resultados que `?q=maria`

---

### Requirement: Campos indexados na busca de perfis
O sistema SHALL buscar o termo nos campos `username` e `display_name` do usuário usando correspondência parcial (`ILIKE '%q%'`).

#### Scenario: Match por username
- **WHEN** existe usuário com `username = "mariana_silva"` e cliente busca `?q=mariana`
- **THEN** esse perfil aparece em `profiles` na resposta

#### Scenario: Match por display_name
- **WHEN** existe usuário com `display_name = "Carlos Pereira"` e cliente busca `?q=carlos`
- **THEN** esse perfil aparece em `profiles` na resposta

---

### Requirement: Campos indexados na busca de posts
O sistema SHALL buscar o termo nos campos `title` e `subtitle` do post usando correspondência parcial. Somente posts com `published_at IS NOT NULL` e `visibility = 'public'` SHALL aparecer nos resultados.

#### Scenario: Match por título
- **WHEN** existe post com `title = "Eleições 2026"` e cliente busca `?q=eleições`
- **THEN** esse post aparece em `posts` na resposta

#### Scenario: Post rascunho não aparece
- **WHEN** existe post com `published_at = NULL` e cliente busca pelo seu título
- **THEN** esse post NÃO aparece em `posts` na resposta

#### Scenario: Post privado não aparece
- **WHEN** existe post com `visibility = 'private'` e cliente busca pelo seu título
- **THEN** esse post NÃO aparece em `posts` na resposta

---

### Requirement: Página de resultados de busca
O sistema SHALL exibir uma página em `/search?q=<termo>` com duas seções distintas: perfis encontrados (acima) e posts encontrados (abaixo), separados por uma linha divisória. A página SHALL atualizar os resultados sempre que o parâmetro `q` mudar na URL.

#### Scenario: Exibição das seções
- **WHEN** usuário acessa `/search?q=joao`
- **THEN** página exibe seção "Pessoas" com cards de perfil, seguida de `<Separator>`, seguida de seção "Matérias" com cards de post

#### Scenario: Seção vazia
- **WHEN** busca retorna `profiles: []` mas `posts` com resultados
- **THEN** seção "Pessoas" exibe mensagem "Nenhum perfil encontrado" e seção "Matérias" exibe os posts normalmente

#### Scenario: Estado de carregamento
- **WHEN** busca está em andamento (loading)
- **THEN** página exibe skeletons nas duas seções

#### Scenario: Nenhum resultado em nenhuma seção
- **WHEN** busca retorna `profiles: []` e `posts: []`
- **THEN** página exibe mensagem central "Nenhum resultado encontrado para `<termo>`"

---

### Requirement: Barra de pesquisa funcional na Navbar (desktop)
A Navbar SHALL conter um campo de texto com ícone de lupa. Ao pressionar Enter com texto não-vazio, o sistema SHALL navegar para `/search?q=<valor>`. O campo SHALL exibir o valor atual de `q` quando o usuário já estiver na página `/search`.

#### Scenario: Navegação ao pressionar Enter
- **WHEN** usuário digita "reportagem" no campo de busca e pressiona Enter
- **THEN** sistema navega para `/search?q=reportagem`

#### Scenario: Campo reflete query atual
- **WHEN** usuário está em `/search?q=clima`
- **THEN** o campo de busca na Navbar exibe "clima"

#### Scenario: Enter com campo vazio não navega
- **WHEN** usuário pressiona Enter com campo vazio
- **THEN** nenhuma navegação ocorre

---

### Requirement: Campo de busca no menu mobile
O menu mobile (drawer) SHALL conter um campo de busca com o mesmo comportamento de navegação do campo desktop.

#### Scenario: Busca via mobile
- **WHEN** usuário abre o menu mobile, digita "universidade" e pressiona Enter
- **THEN** drawer fecha e sistema navega para `/search?q=universidade`

---

### Requirement: Debounce na busca
O hook de busca no frontend SHALL aguardar 300ms após a última alteração no termo antes de disparar a chamada à API, para evitar requisições excessivas durante a digitação.

#### Scenario: Debounce impede chamadas intermediárias
- **WHEN** usuário digita "cli", depois "clim", depois "clima" em sequência rápida (< 300ms entre cada tecla)
- **THEN** apenas uma chamada à API é disparada com o termo "clima"
