#!/bin/bash

# Fly.io deployment script
# This script helps deploy the HappyRobot Loads API to Fly.io

set -e

echo "🚀 Deploying HappyRobot Loads API to Fly.io..."

# Check if Fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    echo "   or visit: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if user is logged in
if ! fly auth whoami &> /dev/null; then
    echo "🔐 Please log in to Fly.io first:"
    echo "   fly auth login"
    exit 1
fi

echo "📦 Creating PostgreSQL database..."

# Create PostgreSQL database
fly postgres create --name happyrobot-db --region ord

echo "🔑 Setting up secrets..."

# Get database URL and set secrets
DB_URL=$(fly postgres connect -a happyrobot-db -c "SELECT current_database();" | grep -o 'postgresql://[^"]*')

if [ -z "$DB_URL" ]; then
    echo "❌ Failed to get database URL. Please set it manually:"
    echo "   fly secrets set DATABASE_URL='postgresql://...'"
    echo "   fly secrets set API_KEYS='prod-key-1,prod-key-2'"
else
    fly secrets set DATABASE_URL="$DB_URL" API_KEYS="prod-key-1,prod-key-2"
fi

echo "🚀 Deploying application..."

# Deploy the application
fly deploy

echo "📊 Running database migrations..."

# Run migrations
fly ssh console -c "prisma migrate deploy"

echo "🌱 Seeding database..."

# Seed the database
fly ssh console -c "npm run seed"

echo "✅ Deployment completed!"
echo ""
echo "Your API is now available at:"
fly info --json | jq -r '.Hostname' | sed 's/^/https:\/\//'
echo ""
echo "API endpoints:"
echo "  - Health: https://$(fly info --json | jq -r '.Hostname')/api/v1/healthz"
echo "  - Loads: https://$(fly info --json | jq -r '.Hostname')/api/v1/loads"
echo ""
echo "Test with:"
echo "  curl -H 'x-api-key: prod-key-1' https://$(fly info --json | jq -r '.Hostname')/api/v1/loads"
