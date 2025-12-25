# Setup Supabase

Este guia explica como configurar o Supabase para o projeto Prontuário PSI.

## Passo 1: Criar Projeto no Supabase

1. Acesse [Supabase](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: `prontuario-psi` (ou outro nome de sua preferência)
   - **Database Password**: Crie uma senha forte (guarde em local seguro)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
4. Clique em **"Create new project"**
5. Aguarde alguns minutos enquanto o projeto é criado

## Passo 2: Obter Credenciais

1. No dashboard do projeto, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Chave pública (segura para frontend)
   - **service_role key**: Chave de serviço (NUNCA exponha no frontend, apenas backend)

## Passo 3: Configurar Autenticação

1. Vá em **Authentication** → **Providers**
2. Certifique-se de que **Email** está habilitado
3. Configure as opções de email (opcional):
   - **Enable email confirmations**: Desmarque se quiser login imediato
   - **Site URL**: Configure com a URL do seu frontend

## Passo 4: Executar Migrations

1. Vá em **SQL Editor** no dashboard do Supabase
2. Abra o arquivo `database/migrations/001_initial.sql`
3. Copie todo o conteúdo do arquivo
4. Cole no SQL Editor do Supabase
5. Clique em **"Run"** para executar

Isso criará:
- Todas as tabelas necessárias
- Índices para performance
- Triggers para updated_at
- Row Level Security (RLS) habilitado
- Políticas RLS para isolamento de dados por usuário

## Passo 5: Verificar RLS

1. Vá em **Authentication** → **Policies**
2. Verifique se as políticas foram criadas para cada tabela:
   - `patients`
   - `sessions`
   - `groups`
   - `events`
   - `expenses`
   - `receivables`
   - `invoices`
   - `reports`
   - `settings`

Cada tabela deve ter políticas para:
- SELECT: Usuários podem ver apenas seus próprios dados
- INSERT: Usuários podem criar apenas seus próprios dados
- UPDATE: Usuários podem atualizar apenas seus próprios dados
- DELETE: Usuários podem excluir apenas seus próprios dados

## Passo 6: Configurar Variáveis de Ambiente

### Frontend (.env)

Crie o arquivo `frontend/.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_public
VITE_API_URL=http://localhost:3001
```

### Backend (.env)

Crie o arquivo `backend/.env`:

```env
PORT=3001
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=sua_chave_service_role
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: Nunca commite arquivos `.env` no Git!

## Passo 7: Testar Conexão

### Opção 1: Iniciar Tudo Junto (Recomendado)

1. Abra o **Prompt de Comando** (CMD) ou **PowerShell**
2. Navegue até a pasta do projeto:
   ```bash
   cd c:\Users\bruno\.cursor\prontuario-psi
   ```
3. Execute:
   ```bash
   npm run dev
   ```
   Isso inicia backend e frontend ao mesmo tempo.

### Opção 2: Iniciar Separadamente

**Terminal 1 - Backend:**
```bash
cd c:\Users\bruno\.cursor\prontuario-psi\backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\bruno\.cursor\prontuario-psi\frontend
npm run dev
```

### Verificar se Funcionou

1. **Backend**: Acesse http://localhost:3001/api/health
   - Deve retornar: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Acesse http://localhost:3000
   - Deve mostrar a tela de login

3. **Teste completo**:
   - Crie uma conta
   - Faça login
   - Verifique se os dados aparecem no dashboard do Supabase em **Table Editor**

> 💡 **Dica**: Se você ainda não instalou as dependências, execute primeiro: `npm run install:all`

## Troubleshooting

### Erro de conexão
- Verifique se as URLs e chaves estão corretas
- Certifique-se de que o projeto Supabase está ativo
- Verifique se as migrations foram executadas

### Erro de autenticação
- Verifique se o provider Email está habilitado
- Verifique as configurações de email no Supabase
- Veja os logs em **Authentication** → **Logs**

### Erro de RLS
- Verifique se as políticas foram criadas
- Teste as políticas manualmente no SQL Editor
- Certifique-se de que `auth.uid()` está funcionando

## Próximos Passos

Após configurar o Supabase:
1. Configure o [GitHub](setup-github.md)
2. Configure o [servidor VPN](vpn-setup.md)
3. Faça o [deploy](deploy.md)

