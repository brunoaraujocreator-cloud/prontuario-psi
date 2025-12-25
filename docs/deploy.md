# Guia de Deploy - Prontuário PSI

## Pré-requisitos

- Servidor VPN Hostinger com acesso SSH
- Node.js 18+ instalado
- PM2 instalado
- Nginx instalado
- Domínio configurado

## Configuração Inicial do Servidor

### 1. Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Instalar PM2

```bash
sudo npm install -g pm2
```

### 3. Instalar Nginx

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

### 4. Configurar Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Deploy Manual

### 1. Clonar Repositório

```bash
cd /var/www
sudo git clone https://github.com/[usuario]/prontuario-psi.git
sudo chown -R $USER:$USER prontuario-psi
cd prontuario-psi
```

### 2. Instalar Dependências

```bash
npm run install:all
```

### 3. Configurar Variáveis de Ambiente

**backend/.env**
```
PORT=3001
SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_KEY=sua_chave_service
NODE_ENV=production
FRONTEND_URL=https://seu-dominio.com
```

### 4. Build Frontend

```bash
cd frontend
npm run build
cd ..
```

### 5. Iniciar com PM2

```bash
cd backend
pm2 start src/server.js --name prontuario-psi
pm2 save
pm2 startup
```

## Configurar Nginx

Crie `/etc/nginx/sites-available/prontuario-psi`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    # Frontend
    location / {
        root /var/www/prontuario-psi/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar site:

```bash
sudo ln -s /etc/nginx/sites-available/prontuario-psi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL com Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## Deploy Automático via GitHub Actions

O deploy automático está configurado via GitHub Actions. Basta fazer push para a branch `main`.

Configure os secrets no GitHub:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `VPN_HOST`
- `VPN_USER`
- `VPN_SSH_KEY`
- `API_URL`

## Comandos Úteis

```bash
# Ver logs
pm2 logs prontuario-psi

# Reiniciar aplicação
pm2 restart prontuario-psi

# Parar aplicação
pm2 stop prontuario-psi

# Status
pm2 status
```

## Troubleshooting

### Aplicação não inicia
- Verificar logs: `pm2 logs prontuario-psi`
- Verificar variáveis de ambiente
- Verificar porta 3001 disponível

### Erro 502 Bad Gateway
- Verificar se backend está rodando: `pm2 status`
- Verificar configuração do Nginx
- Verificar firewall

### Erro de conexão com Supabase
- Verificar variáveis de ambiente
- Verificar RLS policies no Supabase
- Verificar API keys



