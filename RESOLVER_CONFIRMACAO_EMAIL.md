# Resolver: Email Not Confirmed

## 🔧 Solução 1: Confirmar Email Manualmente no Supabase

### Passo a Passo Detalhado:

1. **Acesse o Supabase:**
   - Vá para https://supabase.com
   - Faça login na sua conta

2. **Abra seu projeto:**
   - Clique no projeto "prontuario-psi" (ou o nome que você deu)

3. **Vá para Authentication:**
   - No menu lateral esquerdo, clique em **"Authentication"**
   - Depois clique em **"Users"** (ou "Usuários")

4. **Encontrar seu usuário:**
   - Você verá uma lista de usuários
   - Procure pelo email que você usou para criar a conta
   - Se não aparecer, pode estar na segunda página

5. **Confirmar o email:**
   - Clique nos **3 pontinhos (...)** na linha do seu usuário
   - OU clique diretamente no usuário para abrir os detalhes
   - Procure por **"Confirm email"** ou **"Send confirmation email"**
   - Clique nessa opção

6. **OU editar diretamente:**
   - Clique no usuário para ver os detalhes
   - Procure o campo **"Email Confirmed"** ou **"Email Verified"**
   - Mude de `false` para `true`
   - Salve

---

## 🔧 Solução 2: Desabilitar Verificação de Email (Mais Fácil)

### Passo a Passo:

1. **No Supabase, vá em Settings:**
   - Menu lateral > **Settings** (ícone de engrenagem)
   - OU clique no ícone de engrenagem no canto superior direito

2. **Vá em Authentication:**
   - No menu de Settings, clique em **"Authentication"**

3. **Encontre Email Auth:**
   - Role a página até encontrar **"Email Auth"** ou **"Email"**

4. **Desabilite a confirmação:**
   - Procure por **"Confirm email"** ou **"Enable email confirmations"**
   - **Desmarque** essa opção (deixe desmarcado)
   - Role até o final e clique em **"Save"** ou **"Update"**

5. **Teste novamente:**
   - Volte para o sistema
   - Tente fazer login novamente
   - Agora deve funcionar sem precisar confirmar email

---

## 🔧 Solução 3: Confirmar via SQL (Avançado)

Se as opções acima não funcionarem:

1. **No Supabase, vá em SQL Editor**

2. **Execute este SQL** (substitua o email):

```sql
-- Confirmar email de um usuário específico
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'seu@email.com';
```

3. **Execute o SQL** (botão Run)

4. **Tente fazer login novamente**

---

## 🔧 Solução 4: Criar Usuário Diretamente no Supabase

Se nada funcionar, crie o usuário diretamente:

1. **No Supabase, vá em Authentication > Users**

2. **Clique em "Add user"** ou **"Add user"** (botão no topo)

3. **Escolha "Create new user"**

4. **Preencha:**
   - Email: seu@email.com
   - Password: sua senha
   - **IMPORTANTE**: Marque **"Auto Confirm User"** ✅

5. **Clique em "Create user"**

6. **Agora você pode fazer login diretamente!**

---

## 🔧 Solução 5: Modificar Código para Auto-Confirmar (Temporário)

Se você quiser que novos usuários sejam confirmados automaticamente:

### No Supabase Dashboard:

1. Vá em **Settings** > **Authentication** > **Email Auth**
2. Desmarque **"Confirm email"**
3. Salve

### OU via SQL:

```sql
-- Desabilitar confirmação de email para todos os usuários
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
```

---

## ✅ Verificar se Funcionou

Após aplicar uma das soluções:

1. **Tente fazer login novamente**
2. **Se funcionar** = ✅ Problema resolvido!
3. **Se não funcionar**, tente:
   - Limpar cache do navegador (Ctrl + Shift + Delete)
   - Fazer logout e login novamente
   - Verificar se as credenciais estão corretas

---

## 🆘 Se Nada Funcionar

### Criar Novo Usuário com Auto-Confirmação:

1. **No Supabase:**
   - Authentication > Users > Add user
   - Create new user
   - Preencha email e senha
   - **Marque "Auto Confirm User"** ✅
   - Create user

2. **No sistema:**
   - Use esse email e senha para fazer login
   - Deve funcionar imediatamente

---

## 💡 Dica: Para Desenvolvimento

**Recomendação para desenvolvimento local:**

Desabilite completamente a verificação de email:
- Settings > Authentication > Email Auth
- Desmarque "Confirm email"
- Salve

Isso torna o desenvolvimento mais rápido e fácil.

---

## 📝 Nota Importante

A verificação de email é uma medida de segurança. Em produção, você deve mantê-la habilitada. Mas para desenvolvimento local, pode desabilitar sem problemas.

---

## 🎯 Solução Mais Rápida (Recomendada)

**Para resolver AGORA:**

1. Supabase > Authentication > Users
2. Add user > Create new user
3. Preencha email e senha
4. **Marque "Auto Confirm User"** ✅
5. Create user
6. Faça login no sistema com essas credenciais

**Pronto! Funciona imediatamente!**

