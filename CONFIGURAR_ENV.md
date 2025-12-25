# Como Configurar as Variáveis de Ambiente

## 📝 Passo a Passo

### 1. Obter Credenciais do Supabase

1. No Supabase, vá em **Settings** (ícone de engrenagem) > **API**
2. Você verá:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (começa com `eyJ...`)
   - **service_role** key (começa com `eyJ...`) - ⚠️ MANTENHA SECRETO!

### 2. Configurar Frontend

1. Abra o arquivo `prontuario-psi/frontend/.env`
2. Substitua os valores:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3001
```

### 3. Configurar Backend

1. Abra o arquivo `prontuario-psi/backend/.env`
2. Substitua os valores:

```env
PORT=3001
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Verificar

- ✅ `frontend/.env` existe e tem os 3 valores preenchidos
- ✅ `backend/.env` existe e tem os 5 valores preenchidos
- ✅ As URLs começam com `https://`
- ✅ As chaves começam com `eyJ`

---

## ⚠️ Importante

- **NÃO** commite os arquivos `.env` no Git (já estão no `.gitignore`)
- **NÃO** compartilhe as chaves, especialmente a `service_role`
- **COPIE** os valores exatamente como aparecem no Supabase

---

## 🆘 Problemas Comuns

### Erro: "Missing Supabase environment variables"
- Verifique se os arquivos `.env` existem
- Verifique se os nomes das variáveis estão corretos
- Reinicie o servidor após criar/editar `.env`

### Erro: "Invalid API key"
- Verifique se copiou a chave completa (elas são longas!)
- Verifique se não há espaços extras
- Verifique se está usando a chave correta (anon vs service_role)



