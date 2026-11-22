# Configuração e Publicação do Google Apps Script

O projeto Apps Script localizado em `apps-script/` atua como ponte autenticada entre o backend da Vercel e o Google Drive / Google Sheets do proprietário.

## 1. Criar o Projeto no Apps Script

1. Acesse [script.google.com](https://script.google.com) conectado com a conta proprietária da pasta do Drive e da planilha.
2. Clique em **Novo projeto** e nomeie como `Luan Hercules Tattoo API`.
3. Crie os 6 arquivos dentro do editor (copiando o conteúdo da pasta `apps-script/`):
   - `Config.gs`
   - `Utils.gs`
   - `Auth.gs`
   - `DriveService.gs`
   - `SheetsService.gs`
   - `Code.gs`

## 2. Configurar Propriedades do Script (Segredo)

Nunca escreva o segredo diretamente no código `.gs`.

1. No editor do Apps Script, vá em **Configurações do projeto** (ícone de engrenagem).
2. Role até **Propriedades do script** e clique em **Adicionar propriedade de script**:
   - `APPS_SCRIPT_SECRET`: gere uma senha aleatória longa (ex.: 48+ caracteres)
   - `GOOGLE_DRIVE_FOLDER_ID`: `1m5ImibAKuM0OAWwFXoBLgbwECSyaIP9T`
   - `GOOGLE_SHEET_ID`: `1zsZD5dgyqOCosqxjFHn0qp0Y0xQT-CPuB3o_hQ9rosE`

## 3. Publicar como Web App

1. Clique em **Implantar > Nova implantação**.
2. Em **Selecionar tipo**, escolha **App da Web**.
3. Configure:
   - **Executar como**: **Eu** (a conta proprietária do Drive e da planilha).
   - **Quem pode acessar**: **Qualquer pessoa** (necessário para que as funções serverless da Vercel alcancem o endpoint HTTPS sem fluxo OAuth interativo; toda operação protegida exige o `APPS_SCRIPT_SECRET` no corpo JSON).
4. Clique em **Implantar**, autorize as permissões de acesso ao Drive e Sheets solicitadas na primeira vez, e copie a **URL do app da Web** gerada (`/exec`).

## 4. Inicializar Pastas e Abas

1. Cole a URL em `APPS_SCRIPT_URL` e o mesmo segredo em `APPS_SCRIPT_SECRET` no seu ambiente/Vercel.
2. Acesse `/admin`, faça login e clique em **Sincronizar Drive e Sheets** no Dashboard.
3. O Apps Script criará automaticamente as 12 pastas no Drive (`01_CONFIGURACOES` até `12_ARQUIVOS_GERAIS`) e as 18 abas estruturadas na planilha.
