# Como Executar as Migrations no Supabase

## Método 1: Copiar e Colar (Mais Simples) ✅

### Passo a Passo:

1. **Abra o arquivo localmente:**
   - No Cursor/VS Code, abra o arquivo: `prontuario-psi/database/migrations/001_initial.sql`
   - Selecione TODO o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)

2. **No Supabase:**
   - Acesse https://supabase.com e faça login
   - Abra seu projeto
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New query** (ou use o botão "+ New query")

3. **Cole o SQL:**
   - Cole o conteúdo copiado no editor (Ctrl+V)
   - Verifique se todo o código está lá

4. **Execute:**
   - Clique no botão **Run** (ou pressione Ctrl+Enter)
   - Aguarde alguns segundos
   - Deve aparecer: **"Success. No rows returned"** ✅

5. **Verificar:**
   - No menu lateral, clique em **Table Editor**
   - Você deve ver todas as tabelas criadas:
     - users
     - patients
     - sessions
     - groups
     - events
     - expenses
     - receivables
     - invoices
     - reports
     - settings

---

## Método 2: Via Supabase CLI (Avançado)

Se você preferir usar linha de comando:

### Instalar Supabase CLI:

```bash
# Windows (via npm)
npm install -g supabase

# Ou via Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Conectar ao projeto:

```bash
# Na pasta do projeto
cd prontuario-psi

# Login no Supabase
supabase login

# Linkar ao projeto (você precisará do Project ID e API key)
supabase link --project-ref seu-project-id
```

### Executar migrations:

```bash
# Executar todas as migrations
supabase db push

# Ou executar uma migration específica
supabase migration up
```

---

## Método 3: Upload do Arquivo (Alternativa)

Se preferir fazer upload do arquivo:

1. No Supabase SQL Editor, clique em **Upload SQL file**
2. Selecione o arquivo `prontuario-psi/database/migrations/001_initial.sql`
3. Clique em **Run**

---

## ⚠️ Problemas Comuns

### Erro: "relation already exists"
- Significa que algumas tabelas já existem
- Você pode:
  - **Opção A**: Deletar as tabelas existentes e executar novamente
  - **Opção B**: Executar apenas as partes que faltam
  - **Opção C**: Adicionar `IF NOT EXISTS` (já está no código)

### Erro: "permission denied"
- Verifique se está usando a conta correta
- Verifique se tem permissões de administrador no projeto

### Erro: "extension uuid-ossp does not exist"
- O Supabase já tem essa extensão habilitada por padrão
- Se der erro, você pode ignorar essa linha ou removê-la do SQL

### Nada acontece ao clicar em Run
- Verifique se selecionou todo o código
- Tente executar em partes menores
- Verifique o console do navegador (F12) para erros

---

## ✅ Checklist de Verificação

Após executar as migrations, verifique:

- [ ] Todas as tabelas foram criadas (Table Editor)
- [ ] Row Level Security (RLS) está habilitado
- [ ] Políticas RLS foram criadas
- [ ] Índices foram criados
- [ ] Triggers foram criados

---

## 📝 Nota Importante

**Você NÃO precisa subir no GitHub primeiro!** 

As migrations são executadas diretamente no Supabase, usando o arquivo local. O GitHub é apenas para versionamento do código, não é necessário para executar as migrations.

---

## 🆘 Precisa de Ajuda?

Se tiver problemas:
1. Tire um print do erro
2. Verifique qual linha está dando erro
3. Tente executar em partes menores
4. Consulte a documentação do Supabase: https://supabase.com/docs



