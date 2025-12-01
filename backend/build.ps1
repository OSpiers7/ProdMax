# Build script for Render deployment (PowerShell version)
# This script ensures Prisma Client is generated with the correct schema

$ErrorActionPreference = "Stop"

Write-Host "🔧 Starting build process..." -ForegroundColor Cyan

# Step 1: Switch to PostgreSQL
Write-Host "📝 Switching to PostgreSQL..." -ForegroundColor Yellow
node switch-database.js production

# Step 2: Generate Prisma Client
Write-Host "🔄 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# Step 3: Push schema to database (optional - can be done separately)
Write-Host "📊 Pushing schema to database..." -ForegroundColor Yellow
try {
    npx prisma db push
} catch {
    Write-Host "⚠️  Schema push failed or already up to date" -ForegroundColor Yellow
}

# Step 4: Compile TypeScript
Write-Host "🔨 Compiling TypeScript..." -ForegroundColor Yellow
npx tsc

Write-Host "✅ Build complete!" -ForegroundColor Green

