# Resolver: PowerShell Pede Atualização Mesmo Após Instalar

## 🔧 Solução 1: Usar CMD (Mais Simples - RECOMENDADO)

**A melhor solução é simplesmente usar CMD ao invés de PowerShell!**

### No Cursor:

1. **Fechar o terminal atual** (ícone de lixeira ou `Ctrl + Shift + ``)

2. **Abrir novo terminal CMD:**
   - Pressione `Ctrl + Shift + P`
   - Digite: `Terminal: Select Default Profile`
   - Escolha **"Command Prompt"**

3. **Ou alterar o terminal atual:**
   - Clique no `+` ao lado do terminal
   - Escolha **"Command Prompt"**

4. **Navegar e executar:**
   ```cmd
   cd C:\Users\bruno\.cursor\prontuario-psi
   npm run install:all
   ```

✅ **CMD não tem esses problemas e funciona perfeitamente!**

---

## 🔧 Solução 2: Configurar PowerShell no Cursor

Se realmente quiser usar PowerShell:

### Passo 1: Verificar Instalação

1. **Abra PowerShell separado** (fora do Cursor):
   - Windows + X > Windows PowerShell
   - OU procure "PowerShell" no menu Iniciar

2. **Verificar versão:**
   ```powershell
   $PSVersionTable.PSVersion
   ```

3. **Se for PowerShell 5.x, instale PowerShell 7:**
   - Acesse: https://github.com/PowerShell/PowerShell/releases
   - Baixe: `PowerShell-7.x.x-win-x64.msi`
   - Instale normalmente

### Passo 2: Configurar Cursor para Usar PowerShell 7

1. **No Cursor, abra Settings:**
   - `Ctrl + ,` (vírgula)
   - OU File > Preferences > Settings

2. **Procure por:** `terminal.integrated.defaultProfile.windows`

3. **Altere para:** `PowerShell` (se tiver PowerShell 7) ou `Command Prompt`

4. **OU adicione no settings.json:**
   ```json
   {
     "terminal.integrated.defaultProfile.windows": "Command Prompt"
   }
   ```

### Passo 3: Reiniciar Cursor

- Feche completamente o Cursor
- Abra novamente
- Abra novo terminal (`Ctrl + ``)

---

## 🔧 Solução 3: Ignorar o Aviso e Usar Mesmo Assim

Se o PowerShell está funcionando apesar do aviso:

1. **Ignore o aviso** (se aparecer)
2. **Execute os comandos normalmente:**
   ```powershell
   cd C:\Users\bruno\.cursor\prontuario-psi
   npm run install:all
   ```

O aviso pode ser apenas informativo e não impedir a execução.

---

## 🔧 Solução 4: Desabilitar Aviso no Cursor

1. **Abra Settings do Cursor:**
   - `Ctrl + ,`

2. **Procure por:** `terminal.integrated.shellIntegration.enabled`

3. **Desabilite** (marque como `false`)

4. **Reinicie o terminal**

---

## ✅ Verificar Qual Terminal Está Sendo Usado

No terminal do Cursor, digite:

```powershell
$PSVersionTable
```

Ou simplesmente:
```cmd
echo %COMSPEC%
```

---

## 💡 Recomendação Final

**Use CMD (Command Prompt)!**

- ✅ Não tem problemas de versão
- ✅ Funciona imediatamente
- ✅ É o padrão no Windows
- ✅ Todos os comandos npm funcionam perfeitamente
- ✅ Não precisa configurar nada

**Para mudar para CMD no Cursor:**
1. `Ctrl + Shift + P`
2. Digite: `Terminal: Select Default Profile`
3. Escolha: **Command Prompt**

---

## 🆘 Se Nada Funcionar

**Use o terminal externo:**

1. **Abra CMD:**
   - Windows + R
   - Digite: `cmd`
   - Enter

2. **Navegue:**
   ```cmd
   cd C:\Users\bruno\.cursor\prontuario-psi
   ```

3. **Execute:**
   ```cmd
   npm run install:all
   ```

4. **Depois, para iniciar o sistema:**
   ```cmd
   npm run dev
   ```

---

## 📝 Nota

O aviso do PowerShell geralmente é apenas informativo. Se os comandos estão funcionando, você pode ignorá-lo. Mas a solução mais simples é usar CMD que não tem esses avisos.



