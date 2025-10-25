#!/bin/bash

# Railway deployment script
# This script helps deploy the HappyRobot Loads API to Railway

set -e

echo "🚀 Deploying HappyRobot Loads API to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    echo "   or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway first:"
    echo "   railway login"
    exit 1
fi

echo "📦 Building and deploying..."

# Deploy to Railway
railway up

echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Add PostgreSQL database in Railway dashboard"
echo "2. Set environment variables:"
echo "   - DATABASE_URL (from PostgreSQL service)"
echo "   - API_KEYS (comma-separated keys)"
echo "   - NODE_ENV=production"
echo "3. Run database migrations:"
echo "   railway run prisma migrate deploy"
echo "4. Seed the database:"
echo "   railway run npm run seed"
echo ""
echo "Your API will be available at the Railway URL shown above."
