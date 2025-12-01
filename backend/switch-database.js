#!/usr/bin/env node

/**
 * Script to switch Prisma schema between SQLite (local) and PostgreSQL (production)
 * Usage: node switch-database.js [local|production|auto]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const envPath = path.join(__dirname, '.env');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Function to read current DATABASE_URL from .env
function getDatabaseUrl() {
  if (!fs.existsSync(envPath)) {
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const dbUrlMatch = envContent.match(/DATABASE_URL\s*=\s*(.+)/);
  
  if (dbUrlMatch) {
    return dbUrlMatch[1].trim().replace(/^["']|["']$/g, '');
  }
  
  return null;
}

// Function to detect environment automatically
function detectEnvironment() {
  const dbUrl = getDatabaseUrl();
  
  if (!dbUrl) {
    log('⚠️  Warning: DATABASE_URL not found in .env file', 'yellow');
    return 'local'; // Default to local
  }
  
  if (dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:')) {
    return 'local';
  } else if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    return 'production';
  } else {
    log('⚠️  Warning: Unknown DATABASE_URL format. Defaulting to local.', 'yellow');
    return 'local';
  }
}

// Function to switch schema provider
function switchSchemaProvider(provider) {
  if (!fs.existsSync(schemaPath)) {
    log(`❌ Error: Schema file not found at ${schemaPath}`, 'red');
    process.exit(1);
  }
  
  let schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  // Check current provider
  const providerMatch = schemaContent.match(/provider\s*=\s*"(sqlite|postgresql)"/);
  
  if (!providerMatch) {
    log('❌ Error: Could not find provider in schema file', 'red');
    process.exit(1);
  }
  
  const currentProvider = providerMatch[1];
  
  if (currentProvider === provider) {
    log(`✅ Schema is already set to ${provider}`, 'green');
    return false;
  }
  
  // Replace provider
  schemaContent = schemaContent.replace(
    /provider\s*=\s*"(sqlite|postgresql)"/,
    `provider = "${provider}"`
  );
  
  fs.writeFileSync(schemaPath, schemaContent, 'utf-8');
  
  log(`✅ Switched schema provider from ${currentProvider} to ${provider}`, 'green');
  return true;
}

// Main execution
const mode = process.argv[2] || 'auto';

let targetEnv;
if (mode === 'auto') {
  targetEnv = detectEnvironment();
  log(`🔍 Auto-detected environment: ${targetEnv}`, 'cyan');
} else if (mode === 'local' || mode === 'production') {
  targetEnv = mode;
  log(`🎯 Target environment: ${targetEnv}`, 'cyan');
} else {
  log('❌ Error: Invalid mode. Use "local", "production", or "auto"', 'red');
  process.exit(1);
}

// Set provider based on environment
const provider = targetEnv === 'local' ? 'sqlite' : 'postgresql';

if (targetEnv === 'local') {
  log('📝 Switching to SQLite for local development...', 'blue');
} else {
  log('📝 Switching to PostgreSQL for production...', 'blue');
}

// Switch the schema
const changed = switchSchemaProvider(provider);

if (changed) {
  log('🔄 Regenerating Prisma Client...', 'yellow');
  try {
    execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
    log('✅ Prisma Client regenerated successfully', 'green');
  } catch (error) {
    log('❌ Error regenerating Prisma Client', 'red');
    process.exit(1);
  }
} else {
  log('ℹ️  No changes needed. Prisma Client is up to date.', 'cyan');
}

log('', 'reset');
log(`✨ Done! Schema is configured for ${targetEnv} environment`, 'green');
log('', 'reset');

