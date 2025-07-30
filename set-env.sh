#!/bin/bash

# Set Firebase service account in Vercel
echo "Setting Firebase service account environment variable..."

# Read the service account file and set it as env var
npx vercel env add FIREBASE_SERVICE_ACCOUNT_JSON production < server/serviceAccountKey.json

echo "✅ Environment variable set successfully!"