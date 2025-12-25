# Prontuário PSI - Sistema de Gestão para Psicologia

Sistema completo de gestão para consultórios de psicologia, incluindo gestão de pacientes, sessões, agenda, financeiro e relatórios.

## 🚀 Tecnologias

### Frontend
- **Vite** - Build tool e dev server
- **Quill.js** - Editor de texto rico
- **Supabase JS Client** - Cliente para banco de dados e autenticação
- **Crypto-JS** - Criptografia de dados sensíveis

### Backend
- **Node.js + Express** - Servidor API
- **Puppeteer** - Geração de PDFs
- **Supabase JS Client** - Integração com banco de dados
- **JWT** - Autenticação

### Infraestrutura
- **Supabase** - Banco de dados PostgreSQL + Autenticação
- **VPN Hostinger** - Hospedagem
- **GitHub Actions** - CI/CD
- **PM2** - Gerenciamento de processos
- **Nginx** - Reverse proxy

## 📁 Estrutura do Projeto

```
prontuario-psi/
├── frontend/          # Aplicação frontend modular
├── backend/           # API Node.js/Express
├── database/         # Migrations e seeds Supabase
├── .github/          # Workflows CI/CD
├── scripts/          # Scripts de deploy
└── docs/             # Documentação
```

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Acesso VPN Hostinger

### Setup Local

1. **Clone o repositório**
```bash
git clone https://github.com/[usuario]/prontuario-psi.git
cd prontuario-psi
```

2. **Instale as dependências**
```bash
npm run install:all
```

3. **Configure variáveis de ambiente**

Crie arquivos `.env` em `frontend/` e `backend/`:

**frontend/.env**
```
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_API_URL=http://localhost:3001
```

**backend/.env**
```
PORT=3001
SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_KEY=sua_chave_service
NODE_ENV=development
```

4. **Execute o banco de dados**
```bash
# Execute as migrations no Supabase
# Veja database/migrations/
```

5. **Inicie o desenvolvimento**
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia frontend e backend em modo desenvolvimento
- `npm run build` - Build de produção
- `npm start` - Inicia apenas o backend
- `npm run install:all` - Instala dependências de todos os módulos

## 🔐 Segurança

- Autenticação via Supabase Auth
- Criptografia AES-256 para dados sensíveis (CPF, notas)
- Row Level Security (RLS) no Supabase
- HTTPS obrigatório em produção

## 📝 Funcionalidades

- ✅ Gestão de Pacientes
- ✅ Controle de Sessões
- ✅ Agenda e Calendário
- ✅ Gestão Financeira (Recebíveis, Faturamento, Despesas)
- ✅ Relatórios Personalizáveis
- ✅ Geração de PDFs
- ✅ Histórico e Auditoria
- ✅ Configurações Personalizáveis

## 🚢 Deploy

Veja [docs/deploy.md](docs/deploy.md) para instruções completas de deploy na VPN Hostinger.

## 📄 Licença

Uso pessoal - Não comercial

## 👤 Autor

Sistema desenvolvido para uso pessoal em consultório de psicologia.



