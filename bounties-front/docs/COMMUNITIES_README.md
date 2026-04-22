# Communities — Nova Funcionalidade

## Visão Geral

A funcionalidade de **Comunidades** permite que Hosts (marcas/empresas) criem espaços exclusivos para conectar-se com Creators (influenciadores). Dentro de uma comunidade, o Host pode gerenciar membros, publicar avisos, criar campanhas exclusivas, conversar em grupo e acompanhar métricas — tudo em um só lugar.

---

## O que o Host pode fazer

### Criar e gerenciar comunidades
- Criar comunidades com nome, descrição, regras, logo e plataformas exigidas (Instagram, TikTok, YouTube, Discord, Telegram)
- Editar informações da comunidade a qualquer momento
- Deletar comunidades quando necessário

### Gerenciar membros
- Visualizar solicitações de entrada de Creators
- Aprovar ou rejeitar solicitações
- Remover membros existentes
- Ver as redes sociais de cada Creator (com ícones das plataformas)

### Publicar avisos (Announcements)
- Criar avisos com título, descrição, link e até 5 imagens
- Editar e excluir avisos
- Suporte a formatação de texto (negrito, itálico, listas, links)

### Chat em grupo
- Conversar com todos os membros da comunidade em tempo real
- Enviar emojis (picker com categorias: Smileys, Gestos, Corações, Objetos, Bandeiras)
- Moderar mensagens (deletar qualquer mensagem)
- Badge "HOST" destacado nas mensagens do Host

### Campanhas exclusivas
- Criar campanhas vinculadas à comunidade
- Visualizar todas as campanhas em tabela com status, prize pool e submissions
- Acessar detalhes e gerenciar cada campanha (submissions, winners, pagamentos)

### Analytics
- Métricas detalhadas por campanha: views, likes, retweets, replies, quotes, bookmarks
- Tabela de performance individual de cada Creator
- Disponível para planos Enterprise (com mensagem de upgrade para outros planos)

### Navegação
- Link "Communities" na navbar do Host
- Dropdown de "Campaigns" na navbar (Campaigns + Manage Campaigns)
- Sidebar lateral dentro da comunidade com seções organizadas:
  - **Community**: Informações gerais, Regras
  - **Channels**: Avisos, Chat em grupo
  - **Management**: Membros
  - **Campaigns**: Lista de campanhas, Analytics
  - **Manage Campaigns**: Acesso rápido ao gerenciamento
  - **Settings**: Configurações da comunidade

---

## O que o Creator pode fazer

### Explorar comunidades
- Visualizar todas as comunidades disponíveis na plataforma
- Ver quais plataformas são exigidas para entrar
- Solicitar entrada com confirmação antes de enviar

### Status de participação
- Ver status da solicitação: Membro, Pendente ou Rejeitado
- Re-solicitar entrada caso tenha sido rejeitado
- Validação automática de plataformas exigidas (mostra quais estão faltando)

### Participar da comunidade
- Ver avisos publicados pelo Host
- Participar do chat em grupo (enviar e deletar próprias mensagens)
- Visualizar campanhas exclusivas da comunidade
- Acessar detalhes de cada campanha

### Minhas comunidades
- Alternar entre "Explorar" e "Minhas Comunidades"
- Acesso rápido às comunidades onde é membro aprovado

### Navegação
- Link "Communities" na navbar do Creator
- Sidebar lateral dentro da comunidade:
  - **Community**: Informações gerais, Regras
  - **Channels**: Avisos, Chat em grupo
  - **Content**: Campanhas

---

## O que o Admin pode fazer

### Visão geral de comunidades
- Tabela com todas as comunidades: nome, host, membros, pendentes, data de criação

### Detalhes de cada comunidade
- Informações gerais e regras
- Dados do Host (empresa, username, email)
- Lista de membros com status e redes sociais
- Avisos publicados
- Chat em grupo (somente leitura — campo desabilitado)
- Campanhas vinculadas
- Remover membros quando necessário

### Navegação
- Link "Communities" na sidebar do Admin

---

## Outras melhorias incluídas

### Campanhas (Admin)
- Coluna "Host" na tabela de campanhas
- Informações do Host no modal de detalhes da campanha
- Métricas agora incluem dados do Host

### Creators Recorrentes (Admin)
- Filtro por tipo de campanha: Todas, Públicas ou Privadas
- Badge visual indicando se a campanha é Pública ou Privada

### Creator Insights (Admin)
- Cards de estatísticas de perfil: total de creators e quantidade por plataforma (Twitter, Instagram, TikTok, YouTube, Telegram, Discord)
- Percentual de adoção por plataforma

### Perfil do Creator
- Campo "Twitter/X Handle" no formulário de onboarding e edição de perfil
- Suporte a login via Google (onde o Twitter não é preenchido automaticamente)

### Navbar do Host
- Dropdown para "Campaigns" com sub-menu (Campaigns + Manage Campaigns)
- Menos itens na barra principal, mais organizado

---

## Resumo de telas criadas

| Tela | Rota | Role |
|------|------|------|
| Minhas Comunidades | /host/communities | Host |
| Criar Comunidade | /host/communities/create | Host |
| Detalhes da Comunidade | /host/communities/:id | Host |
| Criar Campanha na Comunidade | /host/communities/:id/create-campaign | Host |
| Explorar Comunidades | /creator/communities | Creator |
| Detalhes da Comunidade | /creator/communities/:id | Creator |
| Lista de Comunidades | /admin/communities | Admin |
| Detalhes da Comunidade | /admin/communities/:id | Admin |
