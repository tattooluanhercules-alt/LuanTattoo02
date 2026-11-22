# LUAN HÉRCULES TATTOO

Sistema institucional completo e painel administrativo para o estúdio autoral **Luan Hércules Tattoo**, projetado com React, TypeScript, Tailwind CSS, backend Node.js/Express compatível com Vercel Serverless Functions e camada de integração via Google Apps Script para Google Drive e Google Sheets.

Domínio previsto de produção: `https://luanhtattoo.vercel.app`

---

## Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend / API**: Node.js + Express (`server.ts`, `server/`, `api/index.ts`)
- **Integração Google Workspace**: Google Apps Script (`apps-script/*.gs`) conectado ao Google Drive e Google Sheets
- **Segurança**: Hash `scrypt` com salt aleatório, tokens HMAC-SHA256 em memória (`Authorization: Bearer`), rate limiting, validação de uploads, sanitização contra XSS e Formula Injection
- **SEO**: Meta tags dinâmicas, Open Graph, Twitter Cards, Schema.org (`TattooParlor`), `robots.txt` e `sitemap.xml`

---

## Estrutura de Pastas

```text
├── api/
│   └── index.ts                  # Entrypoint Vercel Serverless para /api/*
├── apps-script/
│   ├── Auth.gs                   # Validação constante do segredo e ações permitidas
│   ├── Code.gs                   # Roteador doGet / doPost
│   ├── Config.gs                 # IDs do Drive/Sheets, 12 pastas e 18 abas
│   ├── DriveService.gs           # CRUD seguro de arquivos e pastas no Drive
│   ├── SheetsService.gs          # Leitura e gravação nas 18 abas do Sheets
│   └── Utils.gs                  # Padronização JSON, fuso America/Maceio, sanitização
├── docs/
│   ├── ADMIN.md
│   ├── API.md
│   ├── APPS_SCRIPT.md
│   ├── DEPLOY.md
│   ├── INSTALL.md
│   └── SECURITY.md
├── public/
│   ├── icons/favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
├── server/
│   ├── routes/
│   │   ├── adminRoutes.ts        # Rotas protegidas de autenticação, conteúdo e Drive
│   │   └── publicRoutes.ts       # Rotas públicas e proxy seguro de mídia
│   ├── app.ts                    # Instância Express com cabeçalhos de segurança
│   ├── appsScriptClient.ts       # Cliente HTTP com timeout, cache e fallback
│   ├── config.ts                 # Leitura de variáveis de ambiente no backend
│   ├── defaultData.ts            # Conteúdo inicial sem dados pessoais fictícios
│   └── security.ts               # scrypt, HMAC tokens, rate limit e validações
├── src/
│   ├── assets/images/            # Imagens editoriais iniciais do estúdio
│   ├── components/               # AmbientMusicPlayer, BookingForm, ConfirmDialog, LightboxModal, StudioImage
│   ├── contexts/                 # RouterContext, SiteContext
│   ├── layouts/                  # PublicLayout
│   ├── pages/
│   │   ├── admin/                # AdminAuthScreen, DashboardTab, ContentTab, MediaTab, MusicTab, SecurityTab
│   │   ├── AboutPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── PortfolioPage.tsx
│   │   ├── PricesPage.tsx
│   │   └── ServicesPage.tsx
│   ├── services/                 # apiClient.ts
│   └── types/                    # studio.ts
├── .env.example
├── server.ts                     # Servidor Node.js para desenvolvimento e produção
└── vercel.json                   # Roteamento e cabeçalhos na Vercel
```

---

## Instalação Local Rápida

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha os valores quando disponíveis:
   ```bash
   cp .env.example .env
   ```
3. Inicie o ambiente de desenvolvimento (porta `3000`):
   ```bash
   npm run dev
   ```
4. Para gerar o build de produção e checar tipagem:
   ```bash
   npm run lint
   npm run build
   ```

Para instruções completas, consulte:
- [docs/INSTALL.md](docs/INSTALL.md)
- [docs/APPS_SCRIPT.md](docs/APPS_SCRIPT.md)
- [docs/DEPLOY.md](docs/DEPLOY.md)
- [docs/ADMIN.md](docs/ADMIN.md)
- [docs/SECURITY.md](docs/SECURITY.md)
- [docs/API.md](docs/API.md)
