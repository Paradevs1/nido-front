# Documentação: Regras de Detecção de Bot do Twitter

Este documento descreve todas as regras implementadas na função `detectTwitterBot` para identificar contas suspeitas de serem bots no Twitter.

## Visão Geral

A função `detectTwitterBot` analisa dados de uma conta do Twitter e retorna um resultado indicando se a conta é suspeita de ser um bot. A detecção é baseada em múltiplas regras que avaliam diferentes aspectos da conta.

**Resultado:**
- A função retorna `isBot: true` se **QUALQUER** uma das regras abaixo for violada
- Todas as regras violadas são listadas no array `reasons` para transparência
- Se nenhuma regra for violada, retorna `isBot: false` com array de reasons vazio

## Regras de Detecção

### 1. Conta Muito Nova

**Critério:** Conta criada há menos de 15 dias

**Descrição:**
- Verifica a data de criação da conta através da API do Twitter ou dados fornecidos
- Calcula a diferença entre a data atual e a data de criação
- Se a diferença for menor que 15 dias, a conta é marcada como suspeita

**Razão retornada:** `"Account created less than 15 days ago"`

**Motivo:** Bots frequentemente usam contas recém-criadas para evitar rastreamento histórico.

---

### 2. Imagem de Perfil Padrão ou Ausente

**Critério:** URL da imagem de perfil contém padrões de imagem padrão do Twitter ou está ausente

**Descrição:**
- Verifica se a URL da imagem de perfil contém `'default_profile'` ou `'default_profile_images'`
- Se a URL não existir (undefined/null), também é considerada suspeita

**Razão retornada:** `"Default profile image or missing"`

**Motivo:** Contas legítimas geralmente personalizam suas imagens de perfil. Bots frequentemente deixam a imagem padrão.

---

### 3. Poucos Seguidores

**Critério:** Conta possui menos de 100 seguidores

**Descrição:**
- Verifica o número de seguidores através da API do Twitter ou dados fornecidos
- Se o número de seguidores for menor que 100, a conta é marcada como suspeita
- O número exato de seguidores é incluído na mensagem de razão

**Razão retornada:** `"Few followers (X)"` onde X é o número de seguidores

**Motivo:** Contas legítimas geralmente acumulam seguidores ao longo do tempo. Contas com muito poucos seguidores podem indicar contas automatizadas ou recém-criadas.

---

### 4. Poucos Tweets

**Critério:** Conta possui menos de 10 tweets

**Descrição:**
- Verifica o número total de tweets através da API do Twitter ou dados fornecidos
- Se o número de tweets for menor que 10, a conta é marcada como suspeita
- O número exato de tweets é incluído na mensagem de razão

**Razão retornada:** `"Few tweets (X)"` onde X é o número de tweets

**Motivo:** Contas legítimas geralmente têm histórico de atividade. Contas com muito poucos tweets podem indicar baixa atividade ou contas automatizadas.

---

### 5. Padrão Suspeito de Username

**Critério:** Username segue padrões comuns de bots

**Descrição:**
O sistema verifica múltiplos padrões de username suspeitos:

#### 5.1. Padrão "user" + Números
- Username que começa com "user" (case-insensitive) seguido de 5 ou mais dígitos
- **Exemplos:** `user12345`, `USER67890`, `User99999`

#### 5.2. Letras + Números Sequenciais
- 5 ou mais letras seguidas de 4 ou mais números
- **Exemplos:** `abcde1234`, `testuser5678`, `random9876`

#### 5.3. Underscores com Números no Meio
- Padrão que contém letras, underscore, números, underscore, letras
- **Exemplos:** `user_123_name`, `test_456_account`, `abc_789_xyz`

#### 5.4. Muitos Números Consecutivos
- 5 ou mais dígitos consecutivos em qualquer parte do username
- **Exemplos:** `john12345`, `test67890`, `user99999`

#### 5.5. Muitos Underscores
- 3 ou mais underscores no username
- **Exemplos:** `user__name__test`, `a_b_c_d`, `test__user__bot`

#### 5.6. Combinação Números + Underscores
- 5 ou mais números **E** 2 ou mais underscores combinados
- **Exemplos:** `user12345_678_test`, `abc123_456_def`, `test_123_456_789`

**Razão retornada:** `"Suspicious username pattern"`

**Motivo:** Bots frequentemente usam padrões de nomenclatura automatizados que seguem essas estruturas.

---

### 6. Conta Privada

**Critério:** Conta está protegida (privada)

**Descrição:**
- Verifica se a flag `protected` está definida como `true` na API do Twitter ou dados fornecidos
- Se a conta estiver protegida, é marcada como suspeita

**Razão retornada:** `"Private account"`

**Motivo:** Bots frequentemente usam contas privadas para evitar detecção e análise de seus conteúdos.

---

### 7. Conta Automatizada (Flag da API)

**Critério:** API do Twitter indica que a conta é automatizada

**Descrição:**
- Verifica a flag `isAutomated` retornada pela API oficial do Twitter
- Se `isAutomated === true`, a conta é marcada como suspeita
- Esta é uma flag direta fornecida pela API oficial do Twitter

**Razão retornada:** `"Automated account detected"`

**Motivo:** Esta é uma indicação direta da própria plataforma Twitter de que a conta é automatizada.

---

### 8. Múltiplos Logins em Período Curto (DESABILITADA)

**Critério:** Múltiplas verificações de login em menos de 5 minutos

**Descrição:**
- Esta regra está atualmente **desabilitada** no código (comentada)
- Verificaria se há múltiplas verificações de login da conta Twitter em um período muito curto
- Se a diferença entre `firstVerifiedAt` e `latestVerifiedAt` for menor que 5 minutos, seria marcada como suspeita

**Razão retornada:** `"Suspicious activity: multiple logins in a short period"` (quando habilitada)

**Status:** ⚠️ **DESABILITADA** - Não está sendo aplicada atualmente

---

## Fontes de Dados

A função utiliza dados de duas fontes principais, com prioridade para a API do Twitter:

1. **API do Twitter** (`fetchTwitterUserData`): Busca dados atualizados através do endpoint `/api/twitter/user-info`
2. **Dados Locais** (`userData.twitter`): Utiliza dados já disponíveis no objeto `TwitterUserData`

**Prioridade de dados:**
- `createdAt`: `apiData.data.createdAt` → `twitter.createdAt` → `twitter.created_at`
- `profileImageUrl`: `apiData.data.profilePicture` → `twitter.profilePictureUrl` → `twitter.profile_image_url`
- `followersCount`: `apiData.data.followers` → `twitter.followersCount` → `twitter.followers_count`
- `tweetCount`: `apiData.data.statusesCount` → `twitter.tweetCount` → `twitter.tweet_count`
- `isAutomated`: `apiData.data.isAutomated` (apenas da API)
- `protected`: `apiData.data.protected` → `twitter.protected`

## Exemplo de Uso

```typescript
const result = await detectTwitterBot({
  twitter: {
    username: 'user12345',
    followersCount: 50,
    tweetCount: 5,
    createdAt: '2024-01-01T00:00:00Z'
  }
});

// Resultado:
// {
//   isBot: true,
//   reasons: [
//     'Suspicious username pattern',
//     'Few followers (50)',
//     'Few tweets (5)',
//     'Account created less than 15 days ago'
//   ]
// }
```

## Considerações Importantes

1. **Lógica OR (OU)**: A função usa lógica OR - se **qualquer** regra for violada, `isBot` será `true`
2. **Transparência**: Todas as regras violadas são retornadas no array `reasons` para que o usuário saiba exatamente por que a conta foi marcada
3. **Dados Opcionais**: Se os dados do Twitter não estiverem disponíveis, a função retorna `isBot: false` sem razões
4. **API Externa**: A função faz uma chamada à API do Twitter quando um username está disponível, o que pode adicionar latência à operação
5. **Falsos Positivos**: Algumas regras podem gerar falsos positivos (ex: contas legítimas recém-criadas podem ser marcadas como bots)

## Funções Auxiliares

### `fetchTwitterUserData(username: string)`
Busca dados atualizados do usuário através da API do Twitter.

### `isSuspiciousUsername(username: string)`
Verifica se um username segue padrões suspeitos de bots.

### `isAccountTooNew(createdAt: string)`
Verifica se uma conta foi criada há menos de 15 dias.

### `hasDefaultProfileImage(profileImageUrl: string)`
Verifica se a imagem de perfil é padrão ou está ausente.

### `isSpamLogin(linkedAccounts: LinkedAccount[])`
Verifica múltiplos logins em período curto (atualmente desabilitada).

