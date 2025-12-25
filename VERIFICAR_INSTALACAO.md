# Como Verificar se a Instalação Funcionou

## ✅ Sinais de que a Instalação Funcionou

### 1. Mensagem de Sucesso no Terminal

Após executar `npm run install:all`, você deve ver:

```
✅ Mensagens como:
- "added X packages"
- "up to date"
- "audited X packages"
- Sem erros vermelhos críticos
```

### 2. Pastas `node_modules` Criadas

Verifique se as pastas foram criadas:

```cmd
dir node_modules
dir frontend\node_modules
dir backend\node_modules
```

**Se as pastas existirem** = ✅ Instalação funcionou!

---

## 🔍 Verificação Passo a Passo

### Passo 1: Verificar Estrutura

No CMD, na pasta `prontuario-psi`, execute:

```cmd
dir
```

Você deve ver:
- ✅ `node_modules\` (pasta)
- ✅ `frontend\` (pasta)
- ✅ `backend\` (pasta)
- ✅ `package.json` (arquivo)

### Passo 2: Verificar Frontend

```cmd
dir frontend\node_modules
```

**Se aparecer uma lista de pastas** = ✅ Frontend instalado!

### Passo 3: Verificar Backend

```cmd
dir backend\node_modules
```

**Se aparecer uma lista de pastas** = ✅ Backend instalado!

### Passo 4: Testar Comando npm

```cmd
npm --version
```

**Deve mostrar:** `10.x.x` ou similar = ✅ npm funcionando!

---

## 🚀 Testar se Tudo Está Funcionando

### Teste 1: Verificar se os Scripts Funcionam

```cmd
npm run --help
```

**Deve mostrar:** Lista de scripts disponíveis = ✅ Funcionando!

### Teste 2: Tentar Iniciar o Sistema

```cmd
npm run dev
```

**O que deve acontecer:**

1. **Frontend inicia:**
   ```
   VITE v5.x.x  ready in XXX ms
   ➜  Local:   http://localhost:3000/
   ```

2. **Backend inicia:**
   ```
   🚀 Server running on port 3001
   📝 Environment: development
   ```

3. **Nenhum erro crítico** (alguns avisos são normais)

**Se aparecer isso** = ✅ Tudo funcionando perfeitamente!

---

## ⚠️ Problemas Comuns

### Erro: "npm não é reconhecido"

**Solução:**
- Node.js não está instalado ou não está no PATH
- Reinstale Node.js de https://nodejs.org
- Reinicie o CMD após instalar

### Erro: "Cannot find module"

**Solução:**
- A instalação não completou
- Execute novamente: `npm run install:all`
- Aguarde até terminar completamente

### Erro: "Port 3000 already in use"

**Solução:**
- Alguém já está usando a porta
- Feche outros programas
- Ou altere a porta no `frontend/vite.config.js`

### Erro: "Missing .env file"

**Solução:**
- Você precisa criar os arquivos `.env` primeiro!
- Veja `CONFIGURAR_ENV.md` para instruções

---

## 📋 Checklist Completo

Marque conforme verifica:

- [ ] `npm run install:all` executou sem erros críticos
- [ ] Pasta `node_modules` existe na raiz
- [ ] Pasta `frontend\node_modules` existe
- [ ] Pasta `backend\node_modules` existe
- [ ] `npm --version` mostra uma versão
- [ ] `npm run dev` inicia sem erros
- [ ] Frontend abre em http://localhost:3000
- [ ] Backend responde em http://localhost:3001

**Se todos estiverem marcados** = ✅ Instalação completa e funcionando!

---

## 🎯 Próximo Passo Após Verificar

Se tudo estiver funcionando:

1. **Criar os arquivos `.env`** (se ainda não criou)
   - Veja `CONFIGURAR_ENV.md`

2. **Iniciar o sistema:**
   ```cmd
   npm run dev
   ```

3. **Acessar no navegador:**
   - http://localhost:3000

4. **Criar sua conta:**
   - Clique em "Criar conta"
   - Preencha os dados
   - Faça login

---

## 💡 Dica

**Se `npm run dev` funcionar e abrir as URLs, está tudo certo!**

Não precisa verificar tudo manualmente - se o sistema iniciar, significa que a instalação foi bem-sucedida.

