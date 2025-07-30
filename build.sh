#!/bin/bash

# Install dependencies with devDependencies
npm install --production=false

# Run vite build
./node_modules/.bin/vite build

# Run esbuild
./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist