# 🔐 Sistema de Autenticação Seguro - Backend

API REST robusta para autenticação de usuários com Node.js, Express, TypeScript, Prisma ORM e PostgreSQL.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Executando o Projeto](#-executando-o-projeto)
- [API Endpoints](#-api-endpoints)
- [Segurança](#-segurança)
- [Testes](#-testes)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## ✨ Características

### Segurança
- ✅ **Hash de senha** com Bcrypt (12 rounds)
- ✅ **JWT** com tokens de curta duração (15 minutos)
- ✅ **Refresh tokens** armazenados no banco de dados
- ✅ **HttpOnly Cookies** para refresh tokens
- ✅ **Rate Limiting** para prevenir brute force
- ✅ **Bloqueio de conta** após tentativas falhas
- ✅ **Helmet** para headers de segurança HTTP
- ✅ **Validação robusta** de inputs

### Funcionalidades
- 🔑 Registro de usuários
- 🔓 Login com email e senha
- 🔄 Refresh token automático
- 👤 Obter dados do usuário autenticado
- 🚪 Logout seguro
- 🔒 Proteção contra ataques comuns (CSRF, XSS, SQL Injection)

## 🛠 Tecnologias

- **Node.js** (v18+)
- **TypeScript** (v5+)
- **Express** - Framework web
- **Prisma ORM** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - JSON Web Tokens
- **Bcrypt** - Hash de senhas
- **Express Rate Limit** - Rate limiting
- **Helmet** - Segurança de headers HTTP
- **Express Validator** - Validação de dados

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **PostgreSQL** >= 14.0 ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn**
- **Git**

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/HenriqueSagawa/auth-system-nodejs.git
cd backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o PostgreSQL

Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE auth_db;
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/auth_db"

# JWT Secrets (use strings aleatórias e seguras)
JWT_ACCESS_SECRET="seu_secret_super_secreto_aqui_minimo_32_caracteres_12345678"
JWT_REFRESH_SECRET="outro_secret_diferente_tambem_minimo_32_caracteres_87654321"

# JWT Expiration
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Server
NODE_ENV="development"
PORT=3000

# Security
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=900000
```

### 2. Gerar secrets seguros

Use o Node.js para gerar secrets aleatórios:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configurar Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# (Opcional) Abrir Prisma Studio para visualizar o banco
npx prisma studio
```

## 📁 Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Histórico de migrations
├── src/
│   ├── config/
│   │   └── database.ts        # Configuração do Prisma Client
│   ├── middlewares/
│   │   ├── auth.ts            # Middleware de autenticação
│   │   ├── rateLimiter.ts     # Rate limiting
│   │   └── validator.ts       # Validações de input
│   ├── routes/
│   │   └── authRoutes.ts      # Rotas de autenticação
│   ├── services/
│   │   └── authService.ts     # Lógica de negócio
│   └── server.ts              # Ponto de entrada
├── .env                       # Variáveis de ambiente
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🏃 Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Modo Produção

```bash
# Compilar TypeScript
npm run build

# Executar versão compilada
npm start
```

### Scripts Disponíveis

```bash
npm run dev              # Inicia servidor em modo desenvolvimento
npm run build            # Compila TypeScript para JavaScript
npm start                # Executa versão compilada
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:migrate   # Executa migrations do banco
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api/auth
```

### 1. Registro de Usuário

**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "Senha@Forte123",
  "name": "João Silva"
}
```

**Validações:**
- Email deve ser válido
- Senha mínimo 8 caracteres
- Senha deve conter: maiúsculas, minúsculas, números e caracteres especiais
- Nome mínimo 2 caracteres

**Resposta (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid-v4",
    "email": "usuario@example.com",
    "name": "João Silva",
    "createdAt": "2024-02-16T10:30:00.000Z"
  }
}
```

**Erros:**
- `400` - Dados inválidos ou email já cadastrado
- `429` - Muitas requisições (rate limit)

---

### 2. Login

**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "Senha@Forte123"
}
```

**Resposta (200):**
```json
{
  "user": {
    "id": "uuid-v4",
    "email": "usuario@example.com",
    "name": "João Silva"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Headers de Resposta:**
```
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
```

**Erros:**
- `401` - Credenciais inválidas
- `401` - Conta bloqueada (após 5 tentativas falhas)
- `429` - Rate limit (máximo 5 tentativas a cada 15 minutos)

---

### 3. Obter Dados do Usuário

**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Resposta (200):**
```json
{
  "user": {
    "userId": "uuid-v4",
    "email": "usuario@example.com"
  }
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado

---

### 4. Refresh Token

**POST** `/api/auth/refresh`

**Cookies:**
```
refreshToken={token}
```

**Resposta (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:**
- `401` - Refresh token não fornecido
- `403` - Refresh token inválido ou expirado

---

### 5. Logout

**POST** `/api/auth/logout`

**Cookies:**
```
refreshToken={token}
```

**Resposta (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

## 🔒 Segurança

### Proteções Implementadas

#### 1. Hash de Senhas
```typescript
// Bcrypt com 12 rounds (aproximadamente 250ms por hash)
const hashedPassword = await bcrypt.hash(password, 12);
```

#### 2. JWT com Curta Duração
- **Access Token**: 15 minutos
- **Refresh Token**: 7 dias
- Algoritmo: HS256

#### 3. Rate Limiting
```typescript
// Login: máximo 5 tentativas a cada 15 minutos
// Geral: máximo 100 requisições a cada 15 minutos
```

#### 4. Bloqueio de Conta
- Após 5 tentativas falhas de login
- Bloqueio por 15 minutos
- Contador reseta após login bem-sucedido

#### 5. Validação de Senha Forte
Requisitos obrigatórios:
- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 letra maiúscula
- ✅ Pelo menos 1 letra minúscula
- ✅ Pelo menos 1 número
- ✅ Pelo menos 1 caractere especial (@$!%*?&)

#### 6. Headers de Segurança (Helmet)
```typescript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=15552000
```

#### 7. HttpOnly Cookies
- Refresh token armazenado em cookie HttpOnly
- Proteção contra XSS
- SameSite=Strict para proteção CSRF

### Boas Práticas

1. **Nunca commite** arquivos `.env`
2. **Rotacione secrets** periodicamente
3. **Use HTTPS** em produção
4. **Configure CORS** adequadamente
5. **Monitore logs** de segurança
6. **Mantenha dependências** atualizadas

## 🧪 Testes

### Teste Manual com cURL

#### Registrar usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Senha@123",
    "name": "Teste User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Senha@123"
  }' \
  -c cookies.txt
```

#### Obter dados do usuário
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer {seu-token-aqui}"
```

#### Refresh token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt
```

#### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Teste com Postman

Importe a collection disponível em `/docs/postman_collection.json`

## 🚀 Deployment

### Preparação para Produção

1. **Configure variáveis de ambiente de produção**

```env
NODE_ENV="production"
DATABASE_URL="sua-url-de-producao"
JWT_ACCESS_SECRET="secret-super-seguro-de-producao"
JWT_REFRESH_SECRET="outro-secret-diferente-de-producao"
```

2. **Compile o TypeScript**

```bash
npm run build
```

3. **Execute migrations no banco de produção**

```bash
npx prisma migrate deploy
```

### Deploy em Plataformas

#### Heroku

```bash
# Login no Heroku
heroku login

# Criar aplicação
heroku create backend

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variáveis de ambiente
heroku config:set JWT_ACCESS_SECRET="seu-secret"
heroku config:set JWT_REFRESH_SECRET="seu-secret"

# Deploy
git push heroku main

# Executar migrations
heroku run npx prisma migrate deploy
```

#### Railway

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Railway detecta automaticamente Node.js
4. Deploy automático

#### DigitalOcean App Platform

1. Conecte seu repositório
2. Configure build command: `npm run build`
3. Configure run command: `npm start`
4. Adicione PostgreSQL database
5. Configure variáveis de ambiente

### Checklist de Produção

- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS habilitado
- [ ] CORS configurado corretamente
- [ ] Rate limiting ajustado
- [ ] Logs configurados
- [ ] Backup do banco de dados
- [ ] Monitoramento ativo
- [ ] Domínio configurado

## 🔧 Troubleshooting

### Problema: Erro ao conectar com PostgreSQL

**Sintoma:**
```
Error: P1001: Can't reach database server
```

**Solução:**
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no `.env`
3. Teste a conexão:
```bash
psql -U usuario -d auth_db
```

---

### Problema: JWT secret não configurado

**Sintoma:**
```
Error: secretOrPrivateKey must have a value
```

**Solução:**
1. Verifique o arquivo `.env`
2. Certifique-se que `dotenv.config()` está no topo do `server.ts`
3. Reinicie o servidor

---

### Problema: Prisma Client não gerado

**Sintoma:**
```
Error: Cannot find module '@prisma/client'
```

**Solução:**
```bash
npx prisma generate
```

---

### Problema: Migrations não aplicadas

**Sintoma:**
```
Error: Table "User" does not exist
```

**Solução:**
```bash
npx prisma migrate dev
```

---

### Problema: Porta já em uso

**Sintoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

## 📚 Recursos Adicionais

- [Documentação do Express](https://expressjs.com/)
- [Documentação do Prisma](https://www.prisma.io/docs)
- [Documentação do JWT](https://jwt.io/)
- [OWASP Security Practices](https://owasp.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript
- Siga as convenções do ESLint
- Escreva testes para novas features
- Documente mudanças no README

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Henrique Tutomu Sagawa - [LinkedIn](https://www.linkedin.com/in/henriquesagawa/)

Email: henriquetutomusagawa@gmail.com


## 🙏 Agradecimentos

- [Express.js Team](https://expressjs.com/)
- [Prisma Team](https://www.prisma.io/)
- [Node.js Community](https://nodejs.org/)
- Todos os contribuidores

---

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!