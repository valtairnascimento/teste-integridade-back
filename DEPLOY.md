# 🚀 Guia de Instalação e Deploy - Backend

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0 (local ou Atlas)
- **npm** ou **yarn**
- **Conta Mercado Pago** (para pagamentos)

---

## 🔧 Instalação Local

### 1. Clone o repositório
```bash
git clone https://github.com/valtairnascimento/teste-integridade-back.git
cd teste-integridade-back
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:

```env
# Servidor
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/teste-integridade
# Ou MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/teste-integridade

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-aqui-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-access-token-aqui
MERCADO_PAGO_WEBHOOK_SECRET=seu-webhook-secret-aqui
MERCADO_PAGO_PUBLIC_KEY=TEST-sua-public-key-aqui

# URLs de Callback (ajustar para produção)
URL_PAGAMENTO_SUCESSO=http://localhost:3001/pagamento/sucesso
URL_PAGAMENTO_FALHA=http://localhost:3001/pagamento/falha
URL_PAGAMENTO_PENDENTE=http://localhost:3001/pagamento/pendente

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Configurações de Créditos
PRECO_POR_CREDITO=1.00
QUANTIDADE_MINIMA_CREDITOS=10

# CORS
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Inicie o MongoDB (se local)
```bash
# MongoDB via Docker (recomendado)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ou inicie o MongoDB instalado localmente
mongod --dbpath /caminho/para/dados
```

### 5. (Opcional) Popular banco com dados de teste
```bash
npm run seed
```

### 6. Inicie o servidor em modo desenvolvimento
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

---

## 🧪 Testando a API

### Usando cURL

**Registrar Empresa:**
```bash
curl -X POST http://localhost:3000/api/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empresa@exemplo.com",
    "senha": "senha123",
    "nome": "Minha Empresa LTDA",
    "cnpj": "12345678000190"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empresa@exemplo.com",
    "senha": "senha123"
  }'
```

**Health Check:**
```bash
curl http://localhost:3000/health
```

### Usando Postman/Insomnia

Importe a coleção de requests disponível em `/docs/postman_collection.json` (criar este arquivo)

---

## 📦 Deploy em Produção

### Opção 1: Railway

1. Crie conta em [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Adicione um serviço MongoDB
4. Configure as variáveis de ambiente
5. Deploy automático!

**Variáveis obrigatórias:**
- `NODE_ENV=production`
- `MONGODB_URI` (fornecido pelo Railway)
- `JWT_SECRET`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET`
- `BASE_URL` (URL pública do Railway)
- `FRONTEND_URL`

### Opção 2: Heroku

```bash
# Instalar Heroku CLI
heroku login

# Criar app
heroku create teste-integridade-api

# Adicionar MongoDB
heroku addons:create mongolab:sandbox

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=sua-chave-aqui
heroku config:set MERCADO_PAGO_ACCESS_TOKEN=seu-token-aqui
# ... outras vars

# Deploy
git push heroku main
```

### Opção 3: VPS (DigitalOcean, AWS EC2, etc)

**1. Configurar servidor:**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Instalar PM2 (process manager)
sudo npm install -g pm2
```

**2. Clonar e configurar projeto:**
```bash
cd /var/www
sudo git clone https://github.com/valtairnascimento/teste-integridade-back.git
cd teste-integridade-back
sudo npm install --production
```

**3. Criar arquivo .env com configurações de produção**

**4. Iniciar com PM2:**
```bash
pm2 start src/server.js --name teste-integridade-api
pm2 save
pm2 startup
```

**5. Configurar Nginx como reverse proxy:**
```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**6. SSL com Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.seudominio.com
```

---

## 🔐 Configuração do Mercado Pago

### 1. Criar conta de desenvolvedor
- Acesse: https://www.mercadopago.com.br/developers
- Crie uma aplicação

### 2. Obter credenciais
- **Access Token**: Credenciais > Production/Test
- **Public Key**: Credenciais > Production/Test

### 3. Configurar Webhook
- Vá em: Sua aplicação > Webhooks
- URL do webhook: `https://seu-dominio.com/api/webhook/mercadopago`
- Eventos: `payment`
- Tópicos: `payment.updated`

### 4. Gerar Webhook Secret
```bash
# No terminal, gerar secret aleatório
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Testar Webhook localmente com ngrok
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 3000

# Usar URL do ngrok no Mercado Pago
# Exemplo: https://abc123.ngrok.io/api/webhook/mercadopago
```

---

## 📊 Monitoramento

### Logs com PM2
```bash
# Ver logs em tempo real
pm2 logs teste-integridade-api

# Ver apenas erros
pm2 logs teste-integridade-api --err

# Limpar logs
pm2 flush
```

### Monitoramento de Performance
```bash
# Dashboard PM2
pm2 monit

# Estatísticas
pm2 show teste-integridade-api
```

### Serviços Recomendados
- **Sentry** - Rastreamento de erros
- **Datadog** - Monitoramento de infraestrutura
- **LogRocket** - Session replay
- **New Relic** - APM (Application Performance Monitoring)

---

## 🧹 Manutenção

### Backup do MongoDB
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/teste-integridade" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/teste-integridade" /backup/20240115
```

### Atualização do Código
```bash
cd /var/www/teste-integridade-back
git pull origin main
npm install
pm2 restart teste-integridade-api
```

### Limpeza de Dados Antigos (cron job)
```bash
# Editar crontab
crontab -e

# Adicionar (limpar candidatos expirados diariamente às 2h)
0 2 * * * node /var/www/teste-integridade-back/src/scripts/cleanupExpiredCandidatos.js
```

---

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] Usar HTTPS (SSL/TLS)
- [ ] Variáveis de ambiente seguras (nunca commitar .env)
- [ ] JWT_SECRET forte (mínimo 32 caracteres aleatórios)
- [ ] Rate limiting ativado
- [ ] MongoDB com autenticação ativada
- [ ] CORS configurado corretamente
- [ ] Helmet.js ativo
- [ ] Validação de entrada em todas as rotas
- [ ] Logs de auditoria
- [ ] Backups automáticos
- [ ] Firewall configurado (apenas portas 80, 443, 22)
- [ ] Fail2ban para proteger SSH
- [ ] Atualizações automáticas de segurança

### Hardening MongoDB
```bash
# Editar /etc/mongod.conf
security:
  authorization: enabled

# Criar usuário admin
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "senha-forte-aqui",
  roles: ["root"]
})
```

---

## 🆘 Troubleshooting

### Erro: "MongoDB connection failed"
```bash
# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Ver logs do MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# Reiniciar MongoDB
sudo systemctl restart mongod
```

### Erro: "Port 3000 already in use"
```bash
# Ver processo na porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Erro: "JWT malformed"
- Verificar se token está no formato: `Bearer {token}`
- Verificar se JWT_SECRET é o mesmo em todos ambientes

### Webhook não está sendo chamado
- Verificar URL pública acessível
- Testar com: `curl -X POST https://seu-dominio.com/api/webhook/mercadopago`
- Ver logs do Mercado Pago no dashboard deles
- Validar assinatura corretamente

---

## 📚 Documentação Adicional

- [Documentação da API (Swagger)](http://localhost:3000/api-docs) - implementar
- [Mercado Pago Docs](https://www.mercadopago.com.br/developers/pt/docs)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📝 Licença

MIT License - veja LICENSE.md para detalhes