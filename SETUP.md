# Guia de Setup - Prontuário PSI

## Passos para Configuração Inicial

### 1. Configurar Supabase

1. Acesse https://supabase.com e crie uma conta
2. Crie um novo projeto
3. Vá em Settings > API e copie:
   - Project URL
   - anon/public key
   - service_role key (mantenha segredo!)

4. Execute as migrations:
   - Acesse SQL Editor no Supabase
   - Execute o conteúdo de `database/migrations/001_initial.sql`

### 2. Configurar Variáveis de Ambiente

**Frontend** (`frontend/.env`):
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_API_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```
PORT=3001
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_KEY=sua_chave_service
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Instalar Dependências

```bash
# Na raiz do projeto
npm run install:all
```

### 4. Iniciar Desenvolvimento

```bash
# Inicia frontend e backend simultaneamente
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

### 5. Criar Primeiro Usuário

1. Acesse http://localhost:3000
2. Clique em "Registrar" (ou use Supabase Auth UI)
3. Crie sua conta
4. Faça login

### 6. Configurar GitHub

```bash
git init
git remote add origin https://github.com/[seu-usuario]/prontuario-psi.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### 7. Configurar Secrets no GitHub

Vá em Settings > Secrets and variables > Actions e adicione:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `VPN_HOST`
- `VPN_USER`
- `VPN_SSH_KEY`
- `API_URL`

## Próximos Passos

1. Configure a VPN Hostinger seguindo `docs/deploy.md`
2. Configure o domínio e SSL
3. Faça o primeiro deploy
4. Configure CI/CD para deploy automático

## Estrutura Criada

✅ Estrutura de pastas modular
✅ Frontend com Vite
✅ Backend com Express
✅ Autenticação com Supabase
✅ Módulos principais (Dashboard, Pacientes, Sessões)
✅ Editor Quill para relatórios
✅ Geração de PDF com Puppeteer
✅ Criptografia de dados sensíveis
✅ Migrations do banco de dados
✅ CI/CD com GitHub Actions
✅ Documentação de deploy

## Notas

- Os módulos que ainda não foram totalmente implementados (Groups, Events, Calendar, etc.) têm estrutura básica e podem ser expandidos conforme necessário
- O sistema está configurado para uso pessoal com RLS básico
- Todos os dados são isolados por usuário através do Row Level Security



