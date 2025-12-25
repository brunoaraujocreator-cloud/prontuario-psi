# Setup VPN Hostinger

Este guia explica como configurar o servidor VPN Hostinger para hospedar o Prontuário PSI.

## Pré-requisitos

- Conta VPN Hostinger ativa
- Acesso SSH ao servidor
- Domínio configurado (opcional, mas recomendado)

## Passo 1: Acessar Servidor via SSH

1. Obtenha as credenciais SSH da Hostinger:
   - IP do servidor
   - Usuário (geralmente `root` ou `u1234567`)
   - Senha ou chave SSH

2. Conecte via SSH:
   ```bash
   ssh usuario@ip-do-servidor
   # ou
   ssh -i chave.pem usuario@ip-do-servidor
   ```

## Passo 2: Atualizar Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

## Passo 3: Instalar Node.js 18+

```bash
# Instalar NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

## Passo 4: Instalar PM2

PM2 é um gerenciador de processos para Node.js:

```bash
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

## Passo 5: Instalar Nginx

Nginx será usado como reverse proxy:

```bash
sudo apt-get install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

## Passo 6: Configurar Firewall

```bash
# Instalar UFW (se não estiver instalado)
sudo apt-get install -y ufw

# Permitir SSH (IMPORTANTE: faça isso primeiro!)
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

## Passo 7: Configurar Domínio (Opcional)

Se você tem um domínio:

1. Configure o DNS no painel da Hostinger:
   - Tipo A: `@` → IP do servidor
   - Tipo A: `www` → IP do servidor

2. Aguarde a propagação DNS (pode levar até 24 horas)

## Passo 8: Instalar Certbot para SSL

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obter certificado SSL (substitua seu-dominio.com)
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

## Passo 9: Criar Diretório do Projeto

```bash
# Criar diretório
sudo mkdir -p /opt/prontuario-psi
sudo chown -R $USER:$USER /opt/prontuario-psi
cd /opt/prontuario-psi
```

## Passo 10: Configurar Nginx

Crie o arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/prontuario-psi
```

Cole o seguinte conteúdo (ajuste o domínio):

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # SSL (será configurado pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    # Frontend
    location / {
        root /opt/prontuario-psi/current/frontend;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

Ativar o site:

```bash
sudo ln -s /etc/nginx/sites-available/prontuario-psi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Passo 11: Configurar PM2 para Iniciar Automaticamente

```bash
# Salvar configuração atual do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup

# Siga as instruções exibidas (geralmente um comando sudo)
```

## Verificação

Teste se tudo está funcionando:

```bash
# Verificar Node.js
node --version

# Verificar PM2
pm2 --version

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx

# Verificar firewall
sudo ufw status

# Verificar portas abertas
sudo netstat -tulpn | grep -E ':(80|443|3001)'
```

## Próximos Passos

Após configurar o servidor:

1. Faça o [deploy manual](deploy.md) da aplicação
2. Configure o [GitHub Actions](github-secrets.md) para deploy automático
3. Teste a aplicação

## Troubleshooting

### Erro de conexão SSH
- Verifique as credenciais
- Verifique se a porta 22 está aberta
- Contate o suporte da Hostinger

### Node.js não instala
- Verifique se o repositório NodeSource foi adicionado corretamente
- Tente usar uma versão diferente: `setup_20.x` ou `setup_16.x`

### Nginx não inicia
- Verifique a configuração: `sudo nginx -t`
- Verifique os logs: `sudo tail -f /var/log/nginx/error.log`
- Verifique se a porta 80/443 está disponível

### Certbot falha
- Verifique se o DNS está configurado corretamente
- Verifique se a porta 80 está acessível externamente
- Aguarde a propagação DNS

