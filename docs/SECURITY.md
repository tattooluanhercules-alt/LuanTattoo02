# Arquitetura de Segurança

## Princípios Aplicados

1. **Isolamento de Segredos**: `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET`, `SESSION_SECRET` e `ADMIN_PASSWORD_HASH` existem apenas no backend (`process.env`). Nenhum segredo é exposto ao navegador ou prefixado com `VITE_`.
2. **Autenticação Administrativa Segura**:
   - Senhas nunca são armazenadas em texto puro; utilizam `crypto.scryptSync` com salt aleatório de 16 bytes e comparação em tempo constante (`crypto.timingSafeEqual`).
   - No primeiro uso sem senha configurada, o sistema apresenta um formulário único de criação do primeiro administrador (`/api/admin/bootstrap`), que é bloqueado permanentemente após o cadastro inicial.
   - Sessões utilizam tokens HMAC-SHA256 assinados pelo servidor (`Authorization: Bearer`) mantidos apenas em memória na sessão React (nunca em `localStorage` ou `sessionStorage`), com revogação imediata no logout.
3. **Proteção do Apps Script**:
   - Toda chamada `doPost` valida o segredo em tempo constante contra `PropertiesService`.
   - Apenas operações explícitas na lista `ALLOWED_ACTIONS` são executadas.
   - Segredos nunca são retornados em respostas ou gravados na aba `LOGS`.
4. **Confinamento de Arquivos no Drive**:
   - `getFile`, `renameFile` e `deleteFile` verificam se o arquivo pertence estritamente à hierarquia da pasta principal configurada.
   - Exclusão requer parâmetro explícito `confirm: true` e confirmação em modal no painel.
   - Validação rigorosa de MIME type e tamanho (5 MB imagens, 15 MB áudio, 25 MB vídeo, 10 MB PDF).
5. **Proteção contra Abusos e Injeção**:
   - Rate limiting nas rotas `/api/admin/login`, `/api/admin/bootstrap`, `/api/admin/upload` e `/api/contacts`.
   - Validação de esquemas de URL (`http:`, `https:`, `/`) bloqueando `javascript:` e payloads inseguros.
   - Escapamento contra Formula Injection (`=`, `+`, `-`, `@`) antes de gravar células no Google Sheets.
