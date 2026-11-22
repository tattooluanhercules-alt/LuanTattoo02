# Guia de Deploy na Vercel

## 1. Preparação

- Certifique-se de que o código está em um repositório Git (GitHub/GitLab/Bitbucket).
- Conclua primeiro a publicação do Google Apps Script ([docs/APPS_SCRIPT.md](APPS_SCRIPT.md)).

## 2. Variáveis de Ambiente na Vercel

No painel do projeto na Vercel, acesse **Settings > Environment Variables** e adicione (para *Production* e *Preview*):

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `APPS_SCRIPT_URL` | Sim (produção) | URL `/exec` do Web App publicado no Apps Script |
| `APPS_SCRIPT_SECRET` | Sim (produção) | Mesmo segredo configurado nas Propriedades do Script |
| `GOOGLE_DRIVE_FOLDER_ID` | Sim | `1m5ImibAKuM0OAWwFXoBLgbwECSyaIP9T` |
| `GOOGLE_SHEET_ID` | Sim | `1zsZD5dgyqOCosqxjFHn0qp0Y0xQT-CPuB3o_hQ9rosE` |
| `SESSION_SECRET` | Sim (produção) | Chave aleatória de 32+ bytes para assinar tokens de sessão |
| `ADMIN_EMAIL` | Recomendada | E-mail principal autorizado para o painel administrativo |
| `APP_URL` | Recomendada | `https://luanhtattoo.vercel.app` |

**Importante:** Nenhuma dessas variáveis deve usar o prefixo `VITE_`. Elas são lidas exclusivamente pelo backend.

## 3. Configuração de Build na Vercel

O arquivo `vercel.json` já configura:
- Build command: `npm run build`
- Output directory: `dist`
- Roteamento de `/api/*` para `/api/index`
- Fallback SPA para `index.html` preservando `robots.txt` e `sitemap.xml`
- Cabeçalhos de segurança (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)

## 4. Domínio de Produção

Associe o domínio `luanhtattoo.vercel.app` (ou domínio customizado) nas configurações de **Domains** da Vercel e verifique `/api/health` após o deploy.
