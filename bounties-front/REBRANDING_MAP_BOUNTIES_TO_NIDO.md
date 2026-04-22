# Mapa de rebranding: **Bounties** → **Nido** (frontend)

Objetivo: listar onde o nome **Bounties** (e variações) aparece no front, com foco no que o usuário **visualiza** primeiro. Itens técnicos (cookies/keys/etc.) ficam no fim para troca gradual.

> Base: varredura em `bounties.front/bounties-front/src` e referências em `public/` e arquivos de configuração do app.

---

## Prioridade 1 — O que o usuário vê (UI + SEO + previews)

### 1) Meta/SEO/Preview (aba do navegador, Google, OG/Twitter)

- **Arquivo**: `src/app/layout.tsx`
  - **Título**: `default: "Bounties"` e `template: "%s | Bounties"`
  - **Descrição**: menciona Bounties
  - **OpenGraph/Twitter**:
    - `siteName: "Bounties"`
    - `title: "Bounties - Web3 Campaign Hub"`
    - imagens apontando para `https://bounties.work/assets/bounties-framer-illustration.png`
  - **Ícones**:
    - `icon`, `shortcut`, `apple`: `/assets/navbar/logoBounties_new_bg.png`
  - **Canonical**:
    - `metadataBase: new URL("https://bounties.work")`
    - `openGraph.url: "https://bounties.work"`
    - `alternates.canonical: "https://bounties.work"`
  - **Metas explícitas**:
    - `og:image` e `twitter:image` com `https://bounties.work/assets/bounties-framer-illustration.png`

### 2) Sitemap e robots (buscadores)

- **Arquivo**: `src/app/sitemap.ts`
  - URLs com host `https://bounties.work`

- **Arquivo**: `src/app/robots.ts`
  - `sitemap: 'https://bounties.work/sitemap.xml'`

---

## Prioridade 2 — Logo, nome da marca e links na UI

### 3) Navbars, sidebar, footer (logo + texto "Bounties")

Esses componentes exibem **logo** e/ou texto **"Bounties"**:

- `src/components/layout/navbar/NavbarGuest.tsx`
  - `src="/assets/navbar/logoBounties_new_bg.png"`
  - texto "Bounties"
  - chave de retorno: `const RETURN_TO_KEY = "bounties:returnTo"` (técnico)

- `src/components/layout/navbar/NavbarHost.tsx`
  - logo + texto "Bounties"

- `src/components/layout/navbar/NavbarCreator.tsx`
  - logo + texto "Bounties"

- `src/components/layout/navbar/NavbarAdmin.tsx`
  - logo + texto "Bounties"

- `src/components/layout/AdminSidebar.tsx`
  - logo + texto "Bounties"

- `src/components/layout/Footer.tsx`
  - logo + texto "Bounties"
  - `©2025 Bounties. All rights reserved`
  - links para X e Telegram (ver seção de links)

- `src/components/docs/DocsNavbar.tsx`
  - logo + texto "Bounties"
  - link `https://bounties.work`

- `src/components/auth/AutoRedirectFromHome.tsx`
  - logo/alt "Bounties"

### 4) Links externos visíveis (marca + canais)

- `src/components/layout/navbar/NavbarSocialLinks.tsx`
  - `https://x.com/bountiesdotwork`
  - `http://t.me/nidodotglobal`

- `src/components/layout/Footer.tsx`
  - `https://x.com/bountiesdotwork`
  - `http://t.me/nidodotglobal`

- `src/components/host/plans/PlanCardEnterprise.tsx`
  - `http://t.me/nidodotglobal`

- `src/components/host/HostContactForm.tsx`
  - `http://t.me/nidodotglobal`

- `src/components/form/WaitlistForm.tsx`
  - `http://t.me/nidodotglobal`

---

## Prioridade 3 — Textos de produto (home/waitlist/onboarding/host/admin)

### 5) Home / Waitlist / Onboarding

- `src/components/form/WaitlistText.tsx`
  - frases com "Bounties is..." / "Bounties lets you..." etc.

- `src/components/form/ImageSection.tsx`
  - imagem `/assets/home/waitlist/bounties.png`
  - `alt="Bounties"`

- `src/components/home/WelcomeBanner.tsx`
  - texto: "earn a bounties today?" (minúsculo; pode ser “recompensas”, mas hoje aparece como branding)

- `src/components/host/create/CreateHostHeroSection.tsx`
  - texto: `WELCOME TO BOUNTIES HOST`

- `src/components/auth/CreatorOnboardingModal.tsx`
  - string: `"Welcome to Bounties!"`

### 6) Fluxo host pendente (texto + logo)

- `src/app/host/pending-activation/page.tsx`
  - texto: `"Hello! My Bounties host account is pending activation."`
  - texto: "...use the Bounties dashboard..."
  - logo: `/assets/navbar/logoBounties_new_bg.png`

### 7) Admin (cópias)

- `src/app/admin/hosts/page.tsx`
  - cópia em PT: `"Liberada — pode usar o Bounties"`

---

## Prioridade 4 — Jurídico (Terms/Privacy)

### 8) Termos de serviço

- `src/app/terms/page.tsx`
  - título: `TERMS OF SERVICE OF THE BOUNTIES PLATFORM`
  - várias ocorrências de "Bounties Platform" / ("Bounties", "Platform")
  - menciona `nidodotglobal@gmail.com` e `bounties.work`

### 9) Política de privacidade

- `src/app/privacy/page.tsx`
  - "At Bounties by Nido..."
  - link e texto `https://bounties.work/`
  - várias ocorrências de "Bounties"

---

## Prioridade 5 — Docs (conteúdo e rotas)

### 10) Landing de docs

- `src/app/docs/page.tsx`
  - "Bounties Documentation" + textos com "Bounties"

### 11) Rotas, slugs e títulos

- `src/lib/docs/config.ts`
  - slug: `introducao-ao-bounties`
  - title: "Introduction to Bounties"
  - comentário cita `docs.bounties.work`

- `src/lib/docs/content.ts`
  - titles/descriptions/headings com "Bounties"

- `src/app/docs/[section]/[slug]/page.tsx`
  - mapeia `introducao-ao-bounties`
  - fallback `title: "Docs | Bounties"`
  - texto "This documentation guides you through Bounties principles..."

### 12) Componentes de conteúdo (texto interno)

- `src/components/docs/overview/IntroductionToBounties.tsx`
- `src/components/docs/overview/MarketGap.tsx` (inclui "The Bounties Mechanism")
- `src/components/docs/protocol/GlobalStablecoinSettlement.tsx`
- `src/components/docs/para-empresas/ServiceModels.tsx`
- `src/components/docs/para-empresas/CampaignManagementWorkflow.tsx`
- `src/components/docs/seguranca/Infrastructure.tsx`

> Observação: além do texto, o **slug** em si aparece na URL; se trocar, pode exigir redirects/compat.

---

## Prioridade 6 — Links “copiáveis” com domínio

- `src/app/host/campaign/manage/private/[id]/page.tsx`
  - monta/exibe link: `https://bounties.work/creator/campaign/${campaign.id}`

- `src/app/host/campaign/manage/[id]/page.tsx`
  - monta link: `https://bounties.work/creator/campaign/${campaign.id}`

---

## Assets (imagens/logos) com nome "Bounties"

### 13) SVGs no repo (nome do arquivo contém "Bounties")

- `public/assets/footer/logoBounties_new.svg`
- `public/assets/chains/logoBounties.svg`
- `src/assets/navbar/logoBounties.svg`
- `src/assets/footer/logoBounties.svg`

### 14) Assets referenciados no código (paths)

- `/assets/navbar/logoBounties_new_bg.png` (muito usado em navbars/footer/docs)
- `/assets/home/waitlist/bounties.png`
- `https://bounties.work/assets/bounties-framer-illustration.png` (OG/Twitter)

---

## Baixa prioridade (técnico / pode mudar aos poucos)

### 15) Cookies / localStorage / chaves internas

Esses nomes **não aparecem pro usuário**, mas valem para padronizar depois:

- `bounties_token` (cookie + localStorage)
  - `src/middleware.ts`
  - `src/lib/contexts/UserContext.tsx`
  - `src/lib/contexts/AuthContext.tsx`
  - `src/lib/auth/persistSessionCookie.ts`
  - `src/lib/api/config.ts`
  - `src/components/auth/PrivyAuthMonitor.tsx`
  - `src/components/auth/OAuthModal.tsx`

- `bounties_user` (localStorage)
  - `src/lib/contexts/UserContext.tsx`
  - `src/lib/contexts/AuthContext.tsx`
  - `src/lib/api/config.ts`
  - `src/components/auth/PrivyAuthMonitor.tsx`
  - `src/components/auth/OAuthModal.tsx`

- `bounties:returnTo` (localStorage key)
  - `src/components/layout/navbar/NavbarGuest.tsx`
  - `src/components/home/HeroSection.tsx`
  - `src/components/auth/PrivyAuthMonitor.tsx`

- `bounties_host_email_verification_pending` (localStorage key)
  - `src/lib/auth/hostEmailVerificationPending.ts`

- `window.__bountiesEip6963Providers` (wallet)
  - `src/lib/wallet/config.ts`
  - `src/components/wallet/EvmWalletModal.tsx`
  - `src/components/providers/WalletProviders.tsx`

### 16) Outras referências técnicas / dev

- `src/lib/api/config.ts`
  - fallback `API_BASE_URL` para `https://bounties-api.vercel.app`
  - comentário "API do Bounties"

- `src/middleware.ts`
  - comentário citando `docs.bounties.work`

- Mock/data (nome de arquivo e funções)
  - `src/data/bounties.ts`
  - `src/data/index.ts` (reexport/uso de `bounties`)

- Repositório/dev
  - `README.md` (menções de marca)
  - `package.json` / `package-lock.json` (`name: "bounties-front"`)

---

## Sugestão de ordem (para “usuário primeiro”)

1. `src/app/layout.tsx` (title, OG, favicon, canonical, imagens)
2. Navbars/Sidebar/Footer/DocsNavbar (logo + "Bounties")
3. `terms` e `privacy` (jurídico)
4. Docs (landing + conteúdo + decidir sobre slug/redirect)
5. Home/waitlist/onboarding/host/admin copy
6. Links externos (X/Telegram/domínio) quando estiverem prontos
7. Chaves técnicas (`bounties_token`, etc.) por último (migrando com compat)

