# Troubleshooting - Prontuário PSI

Guia de resolução de problemas comuns.

## Problemas de Instalação

### Erro ao instalar dependências

**Problema**: `npm install` falha com erros de permissão

**Solução**:
```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

### Erro de versão do Node.js

**Problema**: Erro "Node version not supported"

**Solução**:
- Instalar Node.js 18 ou superior
- Usar nvm para gerenciar versões:
  ```bash
  nvm install 18
  nvm use 18
  ```

## Problemas de Desenvolvimento

### Frontend não carrega

**Problema**: Página em branco ou erros no console

**Soluções**:
1. Verificar se variáveis de ambiente estão configuradas:
   ```bash
   # frontend/.env deve ter:
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

2. Limpar cache do Vite:
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   npm run dev
   ```

3. Verificar console do navegador para erros específicos

### Backend não inicia

**Problema**: Erro ao iniciar servidor

**Soluções**:
1. Verificar se porta 3001 está disponível:
   ```bash
   lsof -i :3001
   # ou no Windows:
   netstat -ano | findstr :3001
   ```

2. Verificar variáveis de ambiente:
   ```bash
   # backend/.env deve ter:
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   ```

3. Verificar logs:
   ```bash
   cd backend
   npm run dev
   # Verificar mensagens de erro
   ```

### Erro de CORS

**Problema**: Erro "CORS policy" no navegador

**Solução**:
- Verificar `FRONTEND_URL` no backend/.env
- Verificar se backend está permitindo origem correta
- Verificar configuração CORS em `backend/src/server.js`

## Problemas com Supabase

### Erro de conexão

**Problema**: "Failed to connect to Supabase"

**Soluções**:
1. Verificar URLs e chaves nas variáveis de ambiente
2. Verificar se projeto Supabase está ativo
3. Verificar conexão de internet
4. Verificar firewall não está bloqueando

### Erro de autenticação

**Problema**: Login não funciona

**Soluções**:
1. Verificar se provider Email está habilitado no Supabase
2. Verificar configurações de email no Supabase
3. Verificar logs em Authentication → Logs
4. Tentar resetar senha

### Erro de RLS (Row Level Security)

**Problema**: "Permission denied" ao acessar dados

**Soluções**:
1. Verificar se migrations foram executadas:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'patients';
   ```

2. Verificar se usuário está autenticado:
   ```javascript
   const { data: { user } } = await supabase.auth.getUser();
   console.log(user);
   ```

3. Testar políticas manualmente no SQL Editor

### Dados não aparecem

**Problema**: Tabelas vazias mesmo após criar registros

**Soluções**:
1. Verificar se RLS está bloqueando
2. Verificar se user_id está sendo passado corretamente
3. Verificar logs do backend para erros
4. Verificar no Table Editor do Supabase se dados existem

## Problemas de Deploy

### PM2 não inicia

**Problema**: Aplicação não inicia com PM2

**Soluções**:
```bash
# Ver logs
pm2 logs prontuario-psi

# Verificar variáveis de ambiente
pm2 env prontuario-psi

# Reiniciar
pm2 restart prontuario-psi

# Se necessário, remover e recriar
pm2 delete prontuario-psi
pm2 start src/server.js --name prontuario-psi
```

### Nginx 502 Bad Gateway

**Problema**: Erro 502 ao acessar aplicação

**Soluções**:
1. Verificar se backend está rodando:
   ```bash
   pm2 status
   ```

2. Verificar configuração do Nginx:
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

3. Verificar se proxy_pass está correto (deve apontar para localhost:3001)

### SSL não funciona

**Problema**: Certificado SSL inválido ou expirado

**Soluções**:
```bash
# Renovar certificado
sudo certbot renew

# Verificar certificado
sudo certbot certificates

# Recriar certificado se necessário
sudo certbot --nginx -d seu-dominio.com
```

## Problemas de Performance

### Aplicação lenta

**Soluções**:
1. Verificar uso de recursos:
   ```bash
   pm2 monit
   ```

2. Verificar queries lentas no Supabase
3. Verificar se índices estão criados
4. Verificar tamanho do bundle do frontend:
   ```bash
   cd frontend
   npm run build
   # Verificar tamanho de dist/
   ```

### PDF não gera

**Problema**: Erro ao gerar PDF

**Soluções**:
1. Verificar se Puppeteer está instalado:
   ```bash
   cd backend
   npm list puppeteer
   ```

2. Verificar se há dependências do sistema:
   ```bash
   # No servidor Linux
   sudo apt-get install -y \
     chromium-browser \
     fonts-liberation \
     libappindicator3-1 \
     libasound2 \
     libatk-bridge2.0-0 \
     libatk1.0-0 \
     libcups2 \
     libdbus-1-3 \
     libdrm2 \
     libgbm1 \
     libgtk-3-0 \
     libnspr4 \
     libnss3 \
     libxcomposite1 \
     libxdamage1 \
     libxfixes3 \
     libxrandr2 \
     xdg-utils
   ```

3. Verificar logs do backend para erros específicos

## Problemas de Criptografia

### CPF não descriptografa

**Problema**: CPF aparece criptografado na interface

**Soluções**:
1. Verificar se senha do usuário está correta
2. Verificar se salt está sendo gerado/carregado corretamente
3. Verificar logs do console para erros de descriptografia
4. Testar função de criptografia manualmente

## Problemas de GitHub Actions

### Deploy falha

**Problema**: Workflow do GitHub Actions falha

**Soluções**:
1. Verificar logs do workflow no GitHub
2. Verificar se secrets estão configurados
3. Verificar se chave SSH está correta
4. Verificar se servidor está acessível

### Build falha

**Problema**: Build do frontend falha no CI/CD

**Soluções**:
1. Verificar se variáveis de ambiente estão nos secrets
2. Verificar versão do Node.js no workflow
3. Testar build localmente:
   ```bash
   cd frontend
   npm run build
   ```

## Contato e Suporte

Se o problema persistir:

1. Verificar logs detalhados
2. Documentar passos para reproduzir
3. Verificar versões de dependências
4. Consultar documentação oficial:
   - [Supabase Docs](https://supabase.com/docs)
   - [Vite Docs](https://vitejs.dev)
   - [Express Docs](https://expressjs.com)

