# Referência da API Interna (`/api/*`)

Todas as rotas respondem em JSON no padrão:

```json
{
  "success": true,
  "message": "Descrição da operação",
  "data": {}
}
```

## Rotas Públicas

- `GET /api/health` — Estado do servidor e da integração Apps Script / Drive / Sheets
- `GET /api/site` — Pacote completo de conteúdo público (com cache controlado)
- `GET /api/config` — Configurações gerais do estúdio
- `GET /api/gallery` — Itens da galeria
- `GET /api/portfolio` — Obras do portfólio
- `GET /api/banners` — Banners ativos
- `GET /api/services` — Serviços do estúdio
- `GET /api/prices` — Faixas de referência e aviso de orçamento
- `GET /api/testimonials` — Depoimentos publicados
- `GET /api/contacts` — Dados de contato do estúdio
- `POST /api/contacts` — Envio do formulário público de avaliação/agendamento
- `GET /api/social` — Redes sociais ativas
- `GET /api/music` — Configuração do player de música ambiente
- `GET /api/menu` — Itens de navegação
- `GET /api/theme` — Paleta de tema
- `GET /api/seo` — Metadados de SEO
- `GET /api/media/:fileId` — Entrega autenticada pelo servidor de arquivos do Google Drive

## Rotas Administrativas

Rotas protegidas exigem `Authorization: Bearer <token>`.

- `GET /api/admin/bootstrap-status` — Verifica se o cadastro inicial do admin está pendente
- `POST /api/admin/bootstrap` — Cadastra o primeiro administrador (bloqueado após uso)
- `POST /api/admin/login` — Autentica e retorna token Bearer
- `POST /api/admin/logout` — Revoga o token da sessão atual *(protegida)*
- `GET /api/admin/session` — Valida a sessão ativa *(protegida)*
- `POST /api/admin/change-password` — Altera a senha do administrador *(protegida)*
- `GET /api/admin/dashboard` — Status, métricas, solicitações e logs *(protegida)*
- `POST /api/admin/sync` — Sincroniza as 12 pastas no Drive e 18 abas no Sheets *(protegida)*
- `GET /api/admin/files` — Lista arquivos do Drive por pasta *(protegida)*
- `POST /api/admin/upload` — Valida e envia arquivo para pasta do Drive *(protegida)*
- `PATCH /api/admin/files/:id` — Renomeia ou vincula arquivo a uma seção *(protegida)*
- `DELETE /api/admin/files/:id` — Remove arquivo mediante `{ "confirm": true }` *(protegida)*
- `PUT /api/admin/content/:section` — Atualiza `config`, `portfolio`, `gallery`, `banners`, `services`, `prices`, `testimonials`, `contacts`, `social`, `music`, `menu`, `seo` ou `theme` *(protegida)*
