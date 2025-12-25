# Resolver Erro: "Execução de Scripts Desabilitada"

## 🔧 Solução Rápida (Recomendada)

### Método 1: Executar PowerShell como Administrador

1. **Fechar o terminal atual** (se estiver aberto)

2. **Abrir PowerShell como Administrador:**
   - Pressione **Windows + X**
   - Escolha **"Windows PowerShell (Admin)"** ou **"Terminal (Admin)"**
   - OU clique com botão direito no menu Iniciar > **"Windows PowerShell (Admin)"**

3. **Executar este comando:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Confirmar:**
   - Digite **S** e pressione Enter quando perguntar

5. **Fechar o PowerShell Admin** e abrir o terminal normal do Cursor novamente

6. **Tentar novamente:**
   ```powershell
   cd C:\Users\bruno\.cursor\prontuario-psi
   npm run install:all
   ```

---

## 🔧 Solução Alternativa: Usar CMD ao invés de PowerShell

Se não quiser alterar a política do PowerShell:

1. **No Cursor, abra um terminal CMD:**
   - Pressione `Ctrl + Shift + P`
   - Digite: `Terminal: Select Default Profile`
   - Escolha **"Command Prompt"**

2. **Ou abra CMD diretamente:**
   - Pressione **Windows + R**
   - Digite `cmd` e pressione Enter
   - Navegue até a pasta:
   ```cmd
   cd C:\Users\bruno\.cursor\prontuario-psi
   ```

3. **Execute os comandos normalmente:**
   ```cmd
   npm run install:all
   ```

---

## 🔧 Solução 3: Alterar Política Apenas para Esta Sessão

Se não quiser alterar permanentemente:

1. **No terminal do Cursor, execute:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   ```

2. **Depois execute:**
   ```powershell
   npm run install:all
   ```

⚠️ **Nota:** Esta mudança só vale para esta sessão do terminal. Você precisará executar novamente se fechar e abrir o terminal.

---

## ✅ Verificar se Funcionou

Após aplicar uma das soluções, teste:

```powershell
Get-ExecutionPolicy
```

Deve mostrar: `RemoteSigned` ou `Bypass`

---

## 📝 Explicação

O Windows bloqueia a execução de scripts por segurança. As opções são:

- **Restricted** (padrão): Bloqueia tudo
- **RemoteSigned**: Permite scripts locais, bloqueia scripts baixados
- **Bypass**: Permite tudo (menos seguro)
- **Unrestricted**: Permite tudo com aviso (menos seguro)

**Recomendação:** Use `RemoteSigned` - é seguro e permite executar scripts locais.

---

## 🆘 Se Nada Funcionar

Use o **Git Bash** ou **CMD**:

### Git Bash:
1. Se tiver Git instalado, abra **Git Bash**
2. Navegue até a pasta:
   ```bash
   cd /c/Users/bruno/.cursor/prontuario-psi
   ```
3. Execute:
   ```bash
   npm run install:all
   ```

### CMD (Prompt de Comando):
1. Abra **CMD** (Windows + R > cmd)
2. Navegue:
   ```cmd
   cd C:\Users\bruno\.cursor\prontuario-psi
   ```
3. Execute:
   ```cmd
   npm run install:all
   ```

---

## 💡 Dica

**A solução mais simples é usar CMD no Cursor:**
- Não precisa alterar políticas
- Funciona imediatamente
- É o que a maioria dos desenvolvedores usa no Windows



