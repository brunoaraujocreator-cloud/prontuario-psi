# Configuração de Secrets do GitHub

Para que o workflow de deploy automático funcione, é necessário configurar os seguintes secrets no repositório GitHub.

## Como Configurar Secrets no GitHub

1. Acesse o repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada um dos secrets abaixo:

## Secrets Necessários

### 1. VITE_SUPABASE_URL
- **Descrição**: URL do projeto Supabase
- **Onde encontrar**: Dashboard do Supabase → Settings → API → Project URL
- **Exemplo**: `https://xxxxx.supabase.co`

### 2. VITE_SUPABASE_ANON_KEY
- **Descrição**: Chave pública (anon key) do Supabase
- **Onde encontrar**: Dashboard do Supabase → Settings → API → Project API keys → `anon` `public`
- **Exemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. VPN_HOST
- **Descrição**: Endereço IP ou domínio do servidor VPN Hostinger
- **Exemplo**: `123.456.789.0` ou `meuservidor.com.br`

### 4. VPN_USER
- **Descrição**: Nome de usuário para SSH no servidor
- **Exemplo**: `root` ou `deploy`

### 5. VPN_SSH_KEY
- **Descrição**: Chave privada SSH para autenticação no servidor
- **Como gerar**:
  ```bash
  ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key
  ```
- **Importante**: Adicione a chave pública (`github_actions_key.pub`) ao servidor:
  ```bash
  ssh-copy-id -i ~/.ssh/github_actions_key.pub usuario@servidor
  ```
- **Conteúdo**: Cole o conteúdo completo do arquivo `github_actions_key` (chave privada)

### 6. SUPABASE_SERVICE_KEY (Opcional - para backend)
- **Descrição**: Chave de serviço do Supabase (usada no backend)
- **Onde encontrar**: Dashboard do Supabase → Settings → API → Project API keys → `service_role` `secret`
- **Atenção**: Esta chave deve ser configurada no servidor como variável de ambiente, não no GitHub (por segurança)

## Variáveis de Ambiente no Servidor

Além dos secrets do GitHub, você precisa configurar as seguintes variáveis de ambiente no servidor VPN:

Crie um arquivo `.env` em `/opt/prontuario-psi/current/backend/.env`:

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
FRONTEND_URL=https://seudominio.com.br
```

## Testando o Deploy

Após configurar todos os secrets:

1. Faça um push para a branch `main`:
   ```bash
   git push origin main
   ```

2. Ou dispare manualmente o workflow:
   - Vá em **Actions** no GitHub
   - Selecione o workflow **Deploy to VPN Hostinger**
   - Clique em **Run workflow**

3. Acompanhe o progresso na aba **Actions**

## Troubleshooting

### Erro de autenticação SSH
- Verifique se a chave SSH está correta
- Teste a conexão manualmente: `ssh -i ~/.ssh/github_actions_key usuario@servidor`

### Erro de build
- Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas
- Verifique os logs do workflow para mais detalhes

### Erro no servidor
- Verifique se o PM2 está instalado: `npm install -g pm2`
- Verifique os logs: `pm2 logs prontuario-psi`
- Verifique se a porta 3001 está aberta no firewall

