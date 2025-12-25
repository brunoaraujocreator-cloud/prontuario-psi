# Primeiros Passos Após Login

## 🎉 Parabéns! O Sistema Está Funcionando!

Você está na tela de login. Agora precisa criar sua conta.

---

## 📝 Passo 1: Criar Sua Conta

### Na tela de login:

1. **Clique em "Criar conta"** (link na parte inferior)

2. **Preencha o formulário:**
   - **Nome Completo**: Seu nome
   - **Email**: Seu email (ex: seu@email.com)
   - **Senha**: Mínimo 6 caracteres
   - **Confirmar Senha**: Digite a senha novamente

3. **Clique em "Criar Conta"**

4. **Aguarde a confirmação:**
   - Pode aparecer uma mensagem sobre verificação de email
   - Isso é normal do Supabase

---

## ⚠️ Importante: Verificação de Email

O Supabase pode enviar um email de confirmação. Você tem 2 opções:

### Opção A: Confirmar Email Manualmente (Mais Rápido)

1. Acesse https://supabase.com
2. Faça login no seu projeto
3. Vá em **Authentication** > **Users**
4. Encontre seu usuário
5. Clique nos 3 pontinhos (...) > **Confirm email**

### Opção B: Desabilitar Verificação (Para Desenvolvimento)

1. No Supabase, vá em **Settings** > **Authentication**
2. Em **Email Auth**, desmarque **"Confirm email"**
3. Salve as alterações
4. Agora você pode fazer login sem confirmar email

---

## 🔐 Passo 2: Fazer Login

Após criar a conta:

1. **Volte para a tela de login**
2. **Digite seu email e senha**
3. **Clique em "Entrar"**

Se aparecer erro de "Email não confirmado", use a Opção A acima.

---

## 🎯 Passo 3: Explorar o Sistema

Após fazer login, você verá:

### Dashboard
- Visão geral com estatísticas
- Gráficos de sessões e receitas
- Cards com informações principais

### Menu Lateral
- **Dashboard**: Visão geral
- **Pacientes**: Gerenciar pacientes
- **Sessões**: Gerenciar sessões
- **Grupos**: Grupos de atendimento
- **Eventos**: Eventos e compromissos
- **Calendário**: Visualização mensal
- **Agenda**: Visualização semanal
- **Recebíveis**: Controle de recebimentos
- **Faturamento**: Emissão de notas fiscais
- **Despesas**: Controle de gastos
- **Relatórios**: Gerar relatórios e PDFs
- **Histórico**: Histórico de alterações
- **Pendências**: Itens pendentes
- **Configurações**: Ajustes do sistema

---

## ✅ Passo 4: Testar Funcionalidades Básicas

### 4.1 Criar um Paciente

1. Clique em **"Pacientes"** no menu
2. Clique em **"Novo Paciente"**
3. Preencha:
   - Nome (obrigatório)
   - CPF (opcional)
   - Telefone (opcional)
   - Email (opcional)
   - Data de nascimento (opcional)
   - Observações (opcional)
4. Clique em **"Salvar"**
5. O paciente deve aparecer na lista

### 4.2 Criar uma Sessão

1. Clique em **"Sessões"** no menu
2. Clique em **"Nova Sessão"**
3. Preencha os dados
4. Salve

### 4.3 Testar Relatórios

1. Clique em **"Relatórios"** no menu
2. Digite algum texto no editor
3. Clique em **"Gerar PDF"**
4. Deve abrir um PDF em nova aba

---

## 🔧 Configurações Importantes

### Verificar Variáveis de Ambiente

Certifique-se de que os arquivos `.env` estão configurados:

- ✅ `frontend/.env` com credenciais do Supabase
- ✅ `backend/.env` com credenciais do Supabase

Se não criou ainda, veja `CONFIGURAR_ENV.md`

---

## 🆘 Problemas Comuns

### Erro: "Email não confirmado"
- **Solução**: Confirme o email no Supabase (veja Opção A acima)
- **OU**: Desabilite verificação de email (veja Opção B acima)

### Erro: "Invalid login credentials"
- Verifique se o email e senha estão corretos
- Verifique se criou a conta primeiro

### Erro: "Network error" ou "Failed to fetch"
- Verifique se o backend está rodando (porta 3001)
- Verifique as variáveis de ambiente
- Verifique se as credenciais do Supabase estão corretas

### Tela em branco após login
- Abra o console do navegador (F12)
- Veja se há erros
- Verifique se o frontend está rodando (porta 3000)

---

## 📋 Checklist de Primeiros Passos

- [ ] Criar conta no sistema
- [ ] Confirmar email (ou desabilitar verificação)
- [ ] Fazer login com sucesso
- [ ] Ver o Dashboard
- [ ] Criar primeiro paciente
- [ ] Criar primeira sessão
- [ ] Testar geração de PDF

---

## 🎯 Próximos Passos

Após testar o básico:

1. **Configurar GitHub** (se ainda não fez)
   - Criar repositório
   - Fazer primeiro commit
   - Configurar secrets

2. **Expandir Funcionalidades**
   - Implementar módulos que ainda estão básicos
   - Adicionar mais funcionalidades do sistema original

3. **Preparar para Deploy**
   - Configurar VPN Hostinger
   - Seguir `docs/deploy.md`

---

## 💡 Dicas

- **Use o modo escuro**: Clique no ícone de lua/sol no canto superior direito
- **Explore o menu**: Todos os módulos estão acessíveis pelo menu lateral
- **Teste tudo**: Crie dados de teste para familiarizar-se com o sistema
- **Consulte a documentação**: Veja os arquivos `.md` para mais informações

---

**Bem-vindo ao Prontuário PSI! 🎉**

