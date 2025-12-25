# Como Navegar para a Pasta Correta

## 🎯 Você Está na Pasta Errada!

Você está em: `C:\Users\bruno\.cursor`
Você precisa estar em: `C:\Users\bruno\.cursor\prontuario-psi`

## ✅ Solução: Navegar para a Pasta Correta

### No CMD, digite:

```cmd
cd prontuario-psi
```

### Depois verifique:

```cmd
cd
```

**Deve mostrar:** `C:\Users\bruno\.cursor\prontuario-psi`

### Agora verifique as pastas:

```cmd
dir node_modules
dir frontend\node_modules
dir backend\node_modules
```

**Se aparecerem listas de pastas** = ✅ Instalação funcionou!

---

## 🚀 Próximo Passo: Iniciar o Sistema

Após navegar para a pasta correta:

```cmd
npm run dev
```

Isso vai iniciar:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 💡 Dica: Atalho Rápido

**No Cursor:**
1. Clique com botão direito na pasta `prontuario-psi`
2. Escolha **"Open in Integrated Terminal"**
3. O terminal já abre na pasta correta!

---

## 📋 Comandos Completos (Copie e Cole)

```cmd
cd C:\Users\bruno\.cursor\prontuario-psi
dir node_modules
npm run dev
```

