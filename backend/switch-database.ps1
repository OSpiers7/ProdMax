# Script to switch Prisma schema between SQLite (local) and PostgreSQL (production)
# Usage: .\switch-database.ps1 [local|production]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "production", "auto")]
    [string]$Mode = "auto"
)

$schemaPath = "prisma\schema.prisma"
$envPath = ".env"

# Function to read current DATABASE_URL from .env
function Get-DatabaseUrl {
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath
        $dbUrlLine = $envContent | Select-String "DATABASE_URL"
        if ($dbUrlLine) {
            $dbUrl = ($dbUrlLine -split "=")[1].Trim().Trim('"').Trim("'")
            return $dbUrl
        }
    }
    return $null
}

# Function to detect environment automatically
function Detect-Environment {
    $dbUrl = Get-DatabaseUrl
    
    if ($null -eq $dbUrl) {
        Write-Host "⚠️  Warning: DATABASE_URL not found in .env file" -ForegroundColor Yellow
        return "local" # Default to local
    }
    
    if ($dbUrl -like "file:*" -or $dbUrl -like "sqlite:*") {
        return "local"
    } elseif ($dbUrl -like "postgresql://*" -or $dbUrl -like "postgres://*") {
        return "production"
    } else {
        Write-Host "⚠️  Warning: Unknown DATABASE_URL format. Defaulting to local." -ForegroundColor Yellow
        return "local"
    }
}

# Function to switch schema provider
function Switch-SchemaProvider {
    param(
        [string]$Provider
    )
    
    if (-not (Test-Path $schemaPath)) {
        Write-Host "❌ Error: Schema file not found at $schemaPath" -ForegroundColor Red
        exit 1
    }
    
    $schemaContent = Get-Content $schemaPath -Raw
    
    # Check current provider
    if ($schemaContent -match 'provider\s*=\s*"(sqlite|postgresql)"') {
        $currentProvider = $matches[1]
        
        if ($currentProvider -eq $Provider) {
            Write-Host "✅ Schema is already set to $Provider" -ForegroundColor Green
            return $false
        }
        
        # Replace provider
        $newSchemaContent = $schemaContent -replace 'provider\s*=\s*"(sqlite|postgresql)"', "provider = `"$Provider`""
        
        Set-Content -Path $schemaPath -Value $newSchemaContent -NoNewline
        
        Write-Host "✅ Switched schema provider from $currentProvider to $Provider" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Error: Could not find provider in schema file" -ForegroundColor Red
        exit 1
    }
}

# Determine target environment
if ($Mode -eq "auto") {
    $targetEnv = Detect-Environment
    Write-Host "🔍 Auto-detected environment: $targetEnv" -ForegroundColor Cyan
} else {
    $targetEnv = $Mode
    Write-Host "🎯 Target environment: $targetEnv" -ForegroundColor Cyan
}

# Set provider based on environment
if ($targetEnv -eq "local") {
    $provider = "sqlite"
    Write-Host "📝 Switching to SQLite for local development..." -ForegroundColor Blue
} else {
    $provider = "postgresql"
    Write-Host "📝 Switching to PostgreSQL for production..." -ForegroundColor Blue
}

# Switch the schema
$changed = Switch-SchemaProvider -Provider $provider

if ($changed) {
    Write-Host "🔄 Regenerating Prisma Client..." -ForegroundColor Yellow
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma Client regenerated successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Error regenerating Prisma Client" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  No changes needed. Prisma Client is up to date." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✨ Done! Schema is configured for $targetEnv environment" -ForegroundColor Green
Write-Host ""

