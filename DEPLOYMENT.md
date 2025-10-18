# Deployment Guide

This guide covers deploying the HappyRobot Loads API to various cloud platforms with managed PostgreSQL databases.

## Prerequisites

- Docker installed locally
- Cloud platform account (Render, Fly.io, Railway, etc.)
- Git repository with the code

## Local Docker Compose Testing

Test the complete setup locally with PostgreSQL:

### 1. Start Services

```bash
docker compose up -d
```

### 2. Run Database Migrations

```bash
docker compose exec api npx prisma migrate deploy
```

### 3. Seed Database

```bash
docker compose exec api npx prisma db seed
```

### 4. Test API

**Health Check:**

```bash
curl http://localhost:3000/api/v1/healthz
```

**API Test:**

```bash
curl -H "x-api-key: local-dev-key-123" "http://localhost:3000/api/v1/loads?page=1&page_size=10"
```

### 5. Stop Services

```bash
docker compose down
```

## Render Deployment

### 1. Create Render Account

- Sign up at [render.com](https://render.com)
- Connect your GitHub repository

### 2. Provision PostgreSQL Database

1. Go to Dashboard → New → PostgreSQL
2. Choose a name (e.g., `happyrobot-db`)
3. Select region closest to your users
4. Choose plan (Free tier available)
5. Click "Create Database"
6. Copy the **External Database URL** (starts with `postgresql://`)

### 3. Deploy Web Service

1. Go to Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure settings:
   - **Name**: `happyrobot-loads-api`
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npx prisma migrate deploy && node --loader tsx src/index.ts`

### 4. Set Environment Variables

In the Render dashboard, go to your service → Environment:

```
DATABASE_URL=postgresql://username:password@hostname:port/database?schema=public
API_KEYS=prod-key-1,prod-key-2,prod-key-3
NODE_ENV=production
PORT=3000
RATE_LIMIT_PER_MIN=60
RATE_LIMIT_BURST=10
```

### 5. Deploy and Seed

1. Click "Deploy" and wait for deployment to complete
2. Once deployed, seed the database:
   ```bash
   # In Render dashboard, go to Shell tab and run:
   npx prisma db seed
   ```

### 6. Test Deployment

```bash
# Replace with your Render URL
curl https://your-app-name.onrender.com/api/v1/healthz
curl -H "x-api-key: prod-key-1" "https://your-app-name.onrender.com/api/v1/loads?page=1&page_size=5"
```

## Fly.io Deployment

### 1. Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux/Windows
curl -L https://fly.io/install.sh | sh
```

### 2. Login to Fly

```bash
fly auth login
```

### 3. Provision PostgreSQL Database

```bash
fly postgres create --name happyrobot-db --region ord
# Choose a region close to your users
# Note the connection details
```

### 4. Create App

```bash
fly launch
# Follow prompts:
# - App name: happyrobot-loads-api
# - Region: Same as database
# - Don't deploy yet
```

### 5. Update fly.toml

Ensure your `fly.toml` has:

```toml
app = "happyrobot-loads-api"
primary_region = "ord"

[build]

[env]
  NODE_ENV = "production"
  PORT = "3000"
  HOST = "0.0.0.0"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[http_service.checks]]
  interval = "10s"
  timeout = "2s"
  grace_period = "5s"
  method = "GET"
  path = "/api/v1/healthz"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

### 6. Set Secrets

```bash
# Get database URL from postgres create output
fly secrets set DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"
fly secrets set API_KEYS="prod-key-1,prod-key-2,prod-key-3"
fly secrets set RATE_LIMIT_PER_MIN="60"
fly secrets set RATE_LIMIT_BURST="10"
```

### 7. Deploy

```bash
fly deploy
```

### 8. Seed Database

```bash
fly ssh console -C "npx prisma db seed"
```

### 9. Test Deployment

```bash
# Get your app URL
fly info

# Test endpoints
curl https://your-app-name.fly.dev/api/v1/healthz
curl -H "x-api-key: prod-key-1" "https://your-app-name.fly.dev/api/v1/loads?page=1&page_size=5"
```

## Railway Deployment

### 1. Create Railway Account

- Sign up at [railway.app](https://railway.app)
- Connect your GitHub repository

### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

### 3. Add PostgreSQL Database

1. In your project dashboard, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provision the database
4. Copy the `DATABASE_URL` from the database service

### 4. Configure Web Service

1. Click on your web service
2. Go to "Variables" tab
3. Add environment variables:
   ```
   DATABASE_URL=<from-postgres-service>
   API_KEYS=prod-key-1,prod-key-2,prod-key-3
   NODE_ENV=production
   PORT=3000
   RATE_LIMIT_PER_MIN=60
   RATE_LIMIT_BURST=10
   ```

### 5. Deploy

Railway will automatically deploy when you push to your main branch.

### 6. Seed Database

1. Go to your web service
2. Click "Deploy Logs" → "Shell"
3. Run: `npx prisma db seed`

### 7. Test Deployment

```bash
# Get your app URL from Railway dashboard
curl https://your-app-name.railway.app/api/v1/healthz
curl -H "x-api-key: prod-key-1" "https://your-app-name.railway.app/api/v1/loads?page=1&page_size=5"
```

## Environment Variables Reference

| Variable             | Description                  | Default      | Required |
| -------------------- | ---------------------------- | ------------ | -------- |
| `DATABASE_URL`       | PostgreSQL connection string | -            | Yes      |
| `API_KEYS`           | Comma-separated API keys     | -            | Yes      |
| `NODE_ENV`           | Environment mode             | `production` | No       |
| `PORT`               | Server port                  | `3000`       | No       |
| `HOST`               | Server host                  | `0.0.0.0`    | No       |
| `RATE_LIMIT_PER_MIN` | Rate limit per minute        | `60`         | No       |
| `RATE_LIMIT_BURST`   | Rate limit burst             | `10`         | No       |

## Health Checks

All platforms should use:

- **Path**: `/api/v1/healthz`
- **Method**: `GET`
- **Expected Response**: `200 OK` with JSON status

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Verify `DATABASE_URL` is correct
   - Check if database is accessible from your region
   - Ensure database is fully provisioned

2. **Migration Failed**

   - Run `npx prisma migrate deploy` manually
   - Check database permissions

3. **API Key Authentication Failed**

   - Verify `API_KEYS` environment variable is set
   - Check API key format (comma-separated, no spaces)

4. **Health Check Failed**
   - Check if app is running on correct port
   - Verify health check path is `/api/v1/healthz`
   - Check application logs for errors

### Logs

- **Render**: Dashboard → Service → Logs
- **Fly.io**: `fly logs`
- **Railway**: Dashboard → Service → Deploy Logs

## Security Considerations

1. **API Keys**: Use strong, unique API keys in production
2. **Database**: Use managed PostgreSQL with SSL
3. **HTTPS**: All platforms provide HTTPS by default
4. **Rate Limiting**: Configure appropriate limits for your use case
5. **Environment Variables**: Never commit secrets to version control

## Monitoring

Consider setting up monitoring for:

- Application health
- Database performance
- API response times
- Error rates
- Rate limit violations

## Scaling

- **Render**: Upgrade to paid plans for better performance
- **Fly.io**: Scale machines with `fly scale count 2`
- **Railway**: Automatic scaling based on usage
