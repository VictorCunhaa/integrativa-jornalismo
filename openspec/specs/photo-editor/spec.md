## ADDED Requirements

### Requirement: Upload múltiplo de imagens
O PhotoEditor SHALL permitir selecionar e enviar múltiplas imagens via `useUploadImage()`. Cada imagem é enviada individualmente ao ser selecionada.

#### Scenario: Imagens selecionadas são enviadas e exibidas
- **WHEN** o usuário seleciona uma ou mais imagens
- **THEN** cada imagem é enviada via `POST /uploads/image` e exibida como miniatura na galeria

#### Scenario: Imagem removida da galeria
- **WHEN** o usuário clica no botão de remover de uma miniatura
- **THEN** a imagem é removida da lista local (não do servidor)

### Requirement: Metadados por imagem (legenda e crédito)
O PhotoEditor SHALL permitir ao usuário definir legenda e crédito para cada imagem individualmente.

#### Scenario: Edição de metadados
- **WHEN** o usuário clica em uma miniatura
- **THEN** campos de legenda e crédito são exibidos e editáveis para aquela imagem

### Requirement: Lista de mídias sincronizada com o post
As imagens do PhotoEditor SHALL ser salvas como PostMedia via `POST /posts/:id/media` após a criação ou atualização do post.

#### Scenario: Mídias salvas após criação do post
- **WHEN** o usuário salva um post de fotorreportagem
- **THEN** o post é criado primeiro e em seguida cada imagem é registrada como PostMedia com `media_type: 'image'`, legenda e crédito
