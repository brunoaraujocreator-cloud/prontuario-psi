# Configuração do Repositório GitHub

Este guia explica como configurar o repositório GitHub para o projeto Prontuário PSI.

## Passo 1: Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito → **"New repository"**
3. Preencha os dados:
   - **Repository name**: `prontuario-psi`
   - **Description**: "Sistema de Prontuário PSI - ERP para Psicologia"
   - **Visibility**: Private (recomendado) ou Public
   - **NÃO marque** "Initialize this repository with a README" (já temos um)
4. Clique em **"Create repository"**

## Passo 2: Configurar Git Local

Execute os seguintes comandos no terminal, dentro da pasta do projeto:

### 2.1 Abrir Terminal

1. Abra o **Prompt de Comando** (CMD) ou **PowerShell**
2. Navegue até a pasta do projeto:
   ```bash
   cd c:\Users\bruno\.cursor\prontuario-psi
   ```

### 2.2 Configurar Remote

Configure o remote origin (substitua `[usuario]` pelo seu nome de usuário do GitHub):

```bash
git remote add origin https://github.com/[usuario]/prontuario-psi.git
```

**Exemplo**: Se seu usuário for `bruno123`:
```bash
git remote add origin https://github.com/bruno123/prontuario-psi.git
```

### 2.3 Configurar Branches

```bash
# Verifique se está na branch main
git branch -M main

# Crie a branch develop
git checkout -b develop
```

### 2.4 Preparar e Fazer Commit

```bash
# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Initial commit: Sistema Prontuário PSI modularizado"
```

### 2.5 Enviar para o GitHub

```bash
# Envie a branch main
git push -u origin main

# Envie a branch develop
git push -u origin develop
```

> ⚠️ **Nota**: Na primeira vez, o GitHub pode pedir autenticação. Use um **Personal Access Token** em vez da senha. Veja [COMO_CONFIGURAR_GITHUB.md](../COMO_CONFIGURAR_GITHUB.md) para instruções detalhadas.

## Passo 3: Configurar Branches de Proteção (Opcional)

Para proteger a branch `main`:

1. Vá em **Settings** → **Branches**
2. Clique em **"Add branch protection rule"**
3. Configure:
   - **Branch name pattern**: `main`
   - Marque **"Require pull request reviews before merging"**
   - Marque **"Require status checks to pass before merging"**
4. Salve as alterações

## Estrutura de Branches

- **main**: Branch de produção (sempre estável)
- **develop**: Branch de desenvolvimento (integração de features)

## Workflow de Trabalho

1. Crie uma branch a partir de `develop` para cada feature:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nome-da-feature
   ```

2. Faça commits na sua branch:
   ```bash
   git add .
   git commit -m "Descrição da alteração"
   ```

3. Envie para o GitHub:
   ```bash
   git push origin feature/nome-da-feature
   ```

4. Crie um Pull Request no GitHub de `feature/nome-da-feature` para `develop`

5. Após aprovação, merge para `develop`

6. Quando `develop` estiver estável, faça merge para `main` (deploy automático)

## Próximos Passos

Após configurar o GitHub:

1. Configure os [Secrets do GitHub](github-secrets.md) para o deploy automático
2. Teste o workflow de deploy fazendo um push para `main`

