# Próximos Passos - Guia Prático

## 🎯 Passo 1: Configurar Supabase (15-20 minutos)

### 1.1 Criar Conta e Projeto
1. Acesse https://supabase.com
2. Clique em "Start your project" e crie uma conta (pode usar GitHub)
3. Clique em "New Project"
4. Preencha:
   - **Name**: prontuario-psi
   - **Database Password**: Anote esta senha! (você precisará depois)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project" e aguarde ~2 minutos

### 1.2 Obter Credenciais
1. No projeto criado, vá em **Settings** (ícone de engrenagem) > **API**
2. Copie e anote:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public** key (começa com `eyJ...`)
   - **service_role** key (começa com `eyJ...`) - ⚠️ MANTENHA SECRETO!

### 1.3 Executar Migrations

**⚠️ IMPORTANTE: Você NÃO precisa subir no GitHub primeiro!** Execute diretamente do arquivo local.

**Passo a Passo Detalhado:**

1. **Abra o arquivo localmente:**
   - No Cursor, abra: `prontuario-psi/database/migrations/001_initial.sql`
   - Selecione TODO o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)

2. **No Supabase:**
   - Acesse https://supabase.com e faça login
   - Abra seu projeto
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New query** (botão "+ New query" no topo)

3. **Cole e execute:**
   - Cole o conteúdo copiado no editor (Ctrl+V)
   - Clique no botão **Run** (ou pressione Ctrl+Enter)
   - Aguarde alguns segundos
   - Deve aparecer: **"Success. No rows returned"** ✅

4. **Verificar:**
   - No menu lateral, clique em **Table Editor**
   - Você deve ver todas as tabelas criadas:
     - users, patients, sessions, groups, events
     - expenses, receivables, invoices, reports, settings

**💡 Dica:** Se preferir, veja o guia completo em `COMO_EXECUTAR_MIGRATIONS.md`

---

## 🔧 Passo 2: Configurar Variáveis de Ambiente (5 minutos)

### 2.1 Frontend
1. Crie o arquivo `prontuario-psi/frontend/.env`
2. Cole o seguinte conteúdo (substitua pelos valores do Supabase):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_API_URL=http://localhost:3001
```

### 2.2 Backend
1. Crie o arquivo `prontuario-psi/backend/.env`
2. Cole o seguinte conteúdo (substitua pelos valores do Supabase):

```env
PORT=3001
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_chave_service_aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**: Não commite esses arquivos `.env` no Git! Eles já estão no `.gitignore`

---

## 📦 Passo 3: Instalar Dependências (5-10 minutos)

Abra o terminal na pasta `prontuario-psi` e execute:

```bash
# Instala dependências da raiz, frontend e backend
npm run install:all
```

Isso pode levar alguns minutos na primeira vez.

---

## 🚀 Passo 4: Testar Localmente (5 minutos)

### 4.1 Iniciar o Sistema
No terminal, ainda na pasta `prontuario-psi`:

```bash
npm run dev
```

Isso vai iniciar:
- Frontend em http://localhost:3000
- Backend em http://localhost:3001

### 4.2 Criar Primeiro Usuário
1. Abra http://localhost:3000 no navegador
2. Você verá a tela de login
3. Clique em **"Criar conta"** (link na parte inferior)
4. Preencha:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
5. Clique em **"Criar Conta"**
6. ✅ Sua conta será criada automaticamente!

⚠️ **Nota**: O Supabase pode enviar um email de confirmação. Se estiver em desenvolvimento, você pode confirmar o email manualmente no Supabase Dashboard (Authentication > Users > Confirmar email).

### 4.3 Fazer Login
1. Volte para http://localhost:3000
2. Digite o email e senha do usuário criado
3. Clique em "Entrar"
4. Você deve ver o Dashboard! 🎉

---

## 📝 Passo 5: Testar Funcionalidades Básicas

### 5.1 Criar um Paciente
1. No menu lateral, clique em **Pacientes**
2. Clique em **Novo Paciente**
3. Preencha os dados e salve
4. Verifique se aparece na lista

### 5.2 Criar uma Sessão
1. Clique em **Sessões**
2. Clique em **Nova Sessão**
3. Preencha os dados e salve

### 5.3 Testar Relatórios
1. Clique em **Relatórios**
2. Digite algum texto no editor Quill
3. Clique em **Gerar PDF**
4. Deve abrir um PDF em nova aba

---

## 🔄 Passo 6: Configurar GitHub (10 minutos)

### 6.1 Criar Repositório
1. Acesse https://github.com
2. Clique em **New repository**
3. Nome: `prontuario-psi`
4. Deixe **Private** (já que é pessoal)
5. **NÃO** marque "Initialize with README"
6. Clique em **Create repository**

### 6.2 Fazer Primeiro Commit
No terminal, na pasta `prontuario-psi`:

```bash
# Inicializar Git
git init

# Adicionar todos os arquivos (exceto .env que está no .gitignore)
git add .

# Fazer commit
git commit -m "Initial commit - Sistema Prontuário PSI modularizado"

# Adicionar remote (substitua [seu-usuario] pelo seu usuário do GitHub)
git remote add origin https://github.com/[seu-usuario]/prontuario-psi.git

# Renomear branch para main
git branch -M main

# Fazer push
git push -u origin main
```

---

## 🔐 Passo 7: Configurar Secrets no GitHub (5 minutos)

1. No GitHub, vá no seu repositório
2. Clique em **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret** e adicione cada um:

- **SUPABASE_URL**: A URL do seu projeto Supabase
- **SUPABASE_ANON_KEY**: A chave anon do Supabase
- **SUPABASE_SERVICE_KEY**: A chave service_role do Supabase
- **VPN_HOST**: (deixe vazio por enquanto, você preencherá quando configurar a VPN)
- **VPN_USER**: (deixe vazio por enquanto)
- **VPN_SSH_KEY**: (deixe vazio por enquanto)
- **API_URL**: `https://seu-dominio.com` (você preencherá depois)

---

## 🖥️ Passo 8: Configurar VPN Hostinger (quando estiver pronto)

Siga o guia completo em `docs/deploy.md` quando:
- Tiver acesso à VPN Hostinger
- Tiver um domínio configurado
- Quiser fazer o deploy em produção

---

## ✅ Checklist de Progresso

- [ ] Supabase criado e configurado
- [ ] Migrations executadas
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas
- [ ] Sistema rodando localmente
- [ ] Primeiro usuário criado (via tela de registro)
- [ ] Login funcionando
- [ ] Testado criar paciente
- [ ] Testado criar sessão
- [ ] Testado gerar PDF
- [ ] Repositório GitHub criado
- [ ] Código commitado e enviado
- [ ] Secrets configurados no GitHub

---

## 🆘 Problemas Comuns

### Erro ao instalar dependências
```bash
# Limpar cache e tentar novamente
npm cache clean --force
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

### Erro "Module not found"
- Verifique se executou `npm run install:all`
- Verifique se está na pasta correta (`prontuario-psi`)

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Verifique se copiou as chaves corretas (anon vs service_role)
- Verifique se o projeto Supabase está ativo

### Erro ao gerar PDF
- Verifique se o Puppeteer instalou corretamente
- No Windows, pode precisar instalar dependências adicionais

### Porta já em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número_do_pid] /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## 📞 Próximos Passos Após Setup Local

1. **Expandir módulos básicos**: Implementar completamente Groups, Events, Calendar, etc.
2. **Melhorar UI/UX**: Ajustar design conforme necessário
3. **Adicionar mais funcionalidades**: Baseado no sistema original
4. **Configurar VPN**: Quando estiver pronto para produção
5. **Deploy**: Colocar online na VPN Hostinger

---

**Dúvidas?** Consulte:
- `SETUP.md` - Guia de setup detalhado
- `docs/deploy.md` - Guia de deploy
- `README.md` - Documentação geral

