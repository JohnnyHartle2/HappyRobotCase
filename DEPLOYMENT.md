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
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `bash scripts/deploy.sh`

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
