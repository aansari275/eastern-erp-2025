#!/bin/bash

# RugCraftPro Deployment Script
echo "🚀 Starting deployment process..."

# Build the application
echo "📦 Building application..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "✅ Deployment complete!"