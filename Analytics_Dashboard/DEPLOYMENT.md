# Analytics Dashboard Deployment Guide

Complete deployment instructions for the HappyRobot Analytics Dashboard on Render.

## Overview

This guide covers deploying both the Collector API (FastAPI) and Analytics Dashboard (React) to Render with a managed PostgreSQL database.

## Prerequisites

- Render account
- GitHub repository with the code
- Basic understanding of environment variables

## Step 1: Provision PostgreSQL Database

1. **Go to Render Dashboard**
   - Navigate to [render.com](https://render.com)
   - Click "New +" → "PostgreSQL"

2. **Configure Database**
   - **Name**: `happyrobot-analytics-db`
   - **Database**: `happyrobot_analytics`
   - **User**: `happyrobot_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free tier (or paid for production)

3. **Save Database URL**
   - Copy the `External Database URL`
   - Format: `postgresql://user:password@host:port/database`

## Step 2: Deploy Collector API

1. **Create Web Service**
   - Go to Dashboard → "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Settings**
   - **Name**: `happyrobot-collector-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `Analytics_Dashboard/collector-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**
   ```
   DATABASE_URL=<your-postgres-url>
   INGEST_API_KEY=ingest-key-abc123
   READ_API_KEY=read-key-xyz789
   CORS_ORIGINS=https://your-dashboard-url.onrender.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://happyrobot-collector-api.onrender.com`)

## Step 3: Seed Database

1. **Access Render Shell**
   - Go to your Collector API service
   - Click "Shell" tab

2. **Run Seed Script**
   ```bash
   cd Analytics_Dashboard/collector-api
   python scripts/seed_mock_data.py
   ```

3. **Verify Data**
   - Check the logs for success message
   - Should show: "Database seeded successfully! Total calls: 100"

## Step 4: Deploy Analytics Dashboard

1. **Create Static Site**
   - Go to Dashboard → "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Settings**
   - **Name**: `happyrobot-analytics-dashboard`
   - **Branch**: `main`
   - **Root Directory**: `Analytics_Dashboard/analytics-dashboard`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://happyrobot-collector-api.onrender.com/api/v1
   VITE_API_KEY=read-key-xyz789
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Note the site URL (e.g., `https://happyrobot-analytics-dashboard.onrender.com`)

## Step 5: Update CORS Settings

1. **Update Collector API**
   - Go to Collector API service
   - Navigate to "Environment" tab
   - Update `CORS_ORIGINS` to include your dashboard URL:
     ```
     CORS_ORIGINS=https://happyrobot-analytics-dashboard.onrender.com
     ```
   - Click "Save Changes"
   - Service will automatically redeploy

## Step 6: Test End-to-End

1. **Test API Health**
   ```bash
   curl https://happyrobot-collector-api.onrender.com/health
   ```

2. **Test API Endpoints**
   ```bash
   # Test overview metrics
   curl -H "Authorization: Bearer read-key-xyz789" \
     https://happyrobot-collector-api.onrender.com/api/v1/metrics/overview
   ```

3. **Test Dashboard**
   - Open your dashboard URL in browser
   - Verify both Performance and Intelligence pages load
   - Check that data is displayed correctly

## Step 7: Configure HappyRobot Webhook

1. **Get Webhook URL**
   - Your webhook endpoint: `https://happyrobot-collector-api.onrender.com/api/v1/events/call-completed`

2. **Configure HappyRobot Platform**
   - Add webhook URL to your HappyRobot configuration
   - Use `ingest-key-abc123` as the API key
   - Test with a sample call event

## Environment Variables Reference

### Collector API
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `INGEST_API_KEY` | API key for webhook ingestion | `ingest-key-abc123` |
| `READ_API_KEY` | API key for analytics endpoints | `read-key-xyz789` |
| `CORS_ORIGINS` | Allowed CORS origins | `https://dashboard.onrender.com` |

### Analytics Dashboard
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Collector API base URL | `https://api.onrender.com/api/v1` |
| `VITE_API_KEY` | API key for authentication | `read-key-xyz789` |

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Ensure database is running
   - Verify network connectivity

2. **CORS Errors**
   - Update `CORS_ORIGINS` with correct dashboard URL
   - Restart Collector API after changes

3. **API Key Authentication Failed**
   - Verify API keys match between services
   - Check Authorization header format

4. **Dashboard Not Loading Data**
   - Check browser console for errors
   - Verify `VITE_API_URL` is correct
   - Test API endpoints directly

### Logs and Monitoring

- **Collector API Logs**: Available in Render dashboard
- **Database Logs**: Check PostgreSQL service logs
- **Dashboard Logs**: Check browser developer console

## Security Considerations

1. **API Keys**: Use strong, unique keys in production
2. **CORS**: Restrict origins to known domains
3. **HTTPS**: All traffic is encrypted by default on Render
4. **Database**: Use connection pooling and proper indexing

## Scaling

### Production Considerations

1. **Database**: Upgrade to paid PostgreSQL plan
2. **API**: Use Render's auto-scaling features
3. **Monitoring**: Add application monitoring (DataDog, New Relic)
4. **Backup**: Set up automated database backups
5. **CDN**: Use CloudFlare or similar for static assets

## Support

For issues with this deployment:

1. Check Render service logs
2. Verify environment variables
3. Test API endpoints individually
4. Review this documentation

## URLs Summary

After deployment, you'll have:

- **Collector API**: `https://happyrobot-collector-api.onrender.com`
- **Analytics Dashboard**: `https://happyrobot-analytics-dashboard.onrender.com`
- **Database**: Managed PostgreSQL instance
- **Webhook Endpoint**: `https://happyrobot-collector-api.onrender.com/api/v1/events/call-completed`
