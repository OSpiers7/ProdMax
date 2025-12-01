#!/bin/bash
# Build script for Render deployment
# This script ensures Prisma Client is generated with the correct schema

set -e  # Exit on error

echo "🔧 Starting build process..."

# Step 1: Switch to PostgreSQL
echo "📝 Switching to PostgreSQL..."
node switch-database.js production

# Step 2: Generate Prisma Client
echo "🔄 Generating Prisma Client..."
npx prisma generate

# Step 3: Push schema to database (optional - can be done separately)
echo "📊 Pushing schema to database..."
npx prisma db push || echo "⚠️  Schema push failed or already up to date"

# Step 4: Compile TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc

echo "✅ Build complete!"

