# Guia de Instalação Local

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Conta Google com acesso à pasta do Drive (`1m5ImibAKuM0OAWwFXoBLgbwECSyaIP9T`) e à planilha (`1zsZD5dgyqOCosqxjFHn0qp0Y0xQT-CPuB3o_hQ9rosE`)

## Passos

1. Instale as dependências do projeto:
   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do modelo `.env.example` (nunca versione `.env`):
   ```bash
   cp .env.example .env
   ```

3. Preencha no `.env`:
   - `APPS_SCRIPT_URL`: URL da implantação Web App do Apps Script
   - `APPS_SCRIPT_SECRET`: Segredo forte compartilhado apenas entre backend e Apps Script
   - `GOOGLE_DRIVE_FOLDER_ID=1m5ImibAKuM0OAWwFXoBLgbwECSyaIP9T`
   - `GOOGLE_SHEET_ID=1zsZD5dgyqOCosqxjFHn0qp0Y0xQT-CPuB3o_hQ9rosE`
   - `ADMIN_EMAIL`: E-mail do administrador (opcional se cadastrar via primeiro acesso)
   - `SESSION_SECRET`: String aleatória longa (32+ bytes em hexadecimal)

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   A aplicação abrirá em `http://localhost:3000`.

5. Verificação de tipos e build:
   ```bash
   npm run lint
   npm run build
   ```
