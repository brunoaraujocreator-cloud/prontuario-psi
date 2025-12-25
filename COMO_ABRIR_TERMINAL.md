# Como Abrir o Terminal e Executar Comandos

## 🖥️ Método 1: Terminal Integrado do Cursor (Mais Fácil)

### Passo a Passo:

1. **Abrir Terminal no Cursor:**
   - Pressione **Ctrl + `** (Ctrl + crase/backtick)
   - OU vá em **Terminal** > **New Terminal** no menu superior
   - OU clique com botão direito na pasta `prontuario-psi` e escolha **Open in Integrated Terminal**

2. **Navegar até a pasta:**
   - O terminal já deve estar na pasta correta
   - Se não estiver, digite:
   ```powershell
   cd prontuario-psi
   ```

3. **Verificar se está na pasta correta:**
   ```powershell
   Get-Location
   ```
   Deve mostrar: `C:\Users\bruno\.cursor\prontuario-psi`

4. **Executar comandos:**
   ```powershell
   npm run install:all
   ```

---

## 🖥️ Método 2: PowerShell do Windows

### Passo a Passo:

1. **Abrir PowerShell:**
   - Pressione **Windows + R**
   - Digite `powershell` e pressione Enter
   - OU procure "PowerShell" no menu Iniciar

2. **Navegar até a pasta:**
   ```powershell
   cd C:\Users\bruno\.cursor\prontuario-psi
   ```

3. **Verificar:**
   ```powershell
   Get-Location
   ```

4. **Executar comandos:**
   ```powershell
   npm run install:all
   ```

---

## 🖥️ Método 3: Terminal do Windows (CMD)

### Passo a Passo:

1. **Abrir CMD:**
   - Pressione **Windows + R**
   - Digite `cmd` e pressione Enter

2. **Navegar até a pasta:**
   ```cmd
   cd C:\Users\bruno\.cursor\prontuario-psi
   ```

3. **Executar comandos:**
   ```cmd
   npm run install:all
   ```

---

## ✅ Verificar se Node.js está Instalado

Antes de executar, verifique se o Node.js está instalado:

```powershell
node --version
npm --version
```

**Se não estiver instalado:**
1. Acesse https://nodejs.org
2. Baixe a versão LTS (Long Term Support)
3. Instale seguindo o assistente
4. Reinicie o terminal

---

## 📝 Comandos que Você Vai Usar

### 1. Instalar Dependências
```powershell
npm run install:all
```
⏱️ Tempo: 5-10 minutos (primeira vez)

### 2. Iniciar o Sistema
```powershell
npm run dev
```
⏱️ Tempo: Alguns segundos
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 3. Parar o Sistema
- Pressione **Ctrl + C** no terminal

---

## 🆘 Problemas Comuns

### Erro: "npm não é reconhecido"
- Node.js não está instalado
- Instale Node.js de https://nodejs.org
- Reinicie o terminal após instalar

### Erro: "Cannot find module"
- Execute `npm run install:all` primeiro
- Verifique se está na pasta `prontuario-psi`

### Erro: "Port already in use"
- Alguém já está usando a porta 3000 ou 3001
- Feche outros programas que usam essas portas
- Ou altere as portas nos arquivos `.env`

---

## 💡 Dica

**No Cursor, o terminal integrado é a melhor opção!**
- Já abre na pasta do projeto
- Mais fácil de usar
- Integrado com o editor

**Atalho rápido:** `Ctrl + ` (crase/backtick)



