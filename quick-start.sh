#!/bin/bash

# Quick restart script for Eastern ERP
echo "🔄 Quick restart Eastern ERP..."

# Kill any existing processes
pkill -f "tsx server/index.ts" 2>/dev/null
pkill -f "nodemon" 2>/dev/null

# Clear ports
lsof -ti:3000,5000,5001 | xargs kill -9 2>/dev/null

# Wait a moment
sleep 2

# Start fresh
echo "🚀 Starting server..."
npm run dev