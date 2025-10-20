#!/bin/bash

# HappyRobot Loads API - Production Deployment Script
# This script handles migration resolution and deployment

echo "🚀 Starting HappyRobot Loads API deployment..."

# Step 1: Resolve any failed migrations
echo "📋 Checking for failed migrations..."
if npx prisma migrate status | grep -q "failed"; then
    echo "⚠️  Found failed migrations. Resolving..."
    npx prisma migrate resolve --applied 20251017212839_init
    echo "✅ Failed migration resolved"
else
    echo "✅ No failed migrations found"
fi

# Step 2: Deploy migrations
echo "📦 Deploying migrations..."
npx prisma migrate deploy
echo "✅ Migrations deployed successfully"

# Step 3: Start the application
echo "🎯 Starting application..."
node dist/index.js
