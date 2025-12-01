# Database Switching Guide - SQLite ↔ PostgreSQL

This guide explains how to use the database switching scripts to seamlessly work with SQLite locally and PostgreSQL in production.

## 📋 Overview

ProdMax uses:
- **SQLite** for local development (faster, no setup required)
- **PostgreSQL** for production on Render (scalable, production-ready)

The switching scripts automatically update your Prisma schema based on your environment.

---

## 🚀 Quick Start

### For Local Development (SQLite)

```powershell
# PowerShell (Windows)
cd backend
.\switch-database.ps1 local

# Or auto-detect (recommended)
.\switch-database.ps1 auto
```

```bash
# Node.js (cross-platform)
cd backend
node switch-database.js local

# Or auto-detect (recommended)
node switch-database.js auto
```

### For Production Deployment (PostgreSQL)

```powershell
# PowerShell
cd backend
.\switch-database.ps1 production
```

```bash
# Node.js
cd backend
node switch-database.js production
```

---

## 🔧 How It Works

### Auto-Detection Mode (Recommended)

The scripts can automatically detect which database to use based on your `.env` file:

- **SQLite**: If `DATABASE_URL` starts with `file:` or `sqlite:`
- **PostgreSQL**: If `DATABASE_URL` starts with `postgresql://` or `postgres://`

```powershell
# Auto-detect and switch
.\switch-database.ps1 auto
```

### Manual Mode

You can also explicitly specify the environment:

```powershell
# Force SQLite
.\switch-database.ps1 local

# Force PostgreSQL
.\switch-database.ps1 production
```

---

## 📝 Workflow Examples

### Scenario 1: Starting Local Development

```powershell
# 1. Navigate to backend
cd backend

# 2. Ensure .env has SQLite URL
# DATABASE_URL="file:./dev.db"

# 3. Switch to SQLite (auto-detects from .env)
.\switch-database.ps1 auto

# 4. Push schema changes
npx prisma db push

# 5. Start dev server
npm run dev
```

### Scenario 2: Deploying to Production

```powershell
# 1. Navigate to backend
cd backend

# 2. Update .env with PostgreSQL URL (or set in Render dashboard)
# DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# 3. Switch to PostgreSQL
.\switch-database.ps1 production

# 4. Commit and push changes
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for production"
git push

# 5. Render will automatically deploy with PostgreSQL
```

### Scenario 3: Testing Production Locally

```powershell
# 1. Temporarily update .env with PostgreSQL connection string
# DATABASE_URL="postgresql://user:pass@localhost:5432/prodmax"

# 2. Switch to PostgreSQL
.\switch-database.ps1 production

# 3. Run migrations
npx prisma db push

# 4. Test your app
npm run dev

# 5. Switch back to SQLite when done
.\switch-database.ps1 local
```

---

## 🎯 Best Practices

### 1. **Use Auto-Detection for Daily Work**

```powershell
# Add to your workflow - it reads from .env automatically
.\switch-database.ps1 auto
```

### 2. **Keep Separate .env Files**

Create different `.env` files for different environments:

- `.env.local` - SQLite for local development
- `.env.production` - PostgreSQL for production (or set in Render)

### 3. **Switch Before Committing**

When preparing for production deployment:

```powershell
# 1. Switch to PostgreSQL
.\switch-database.ps1 production

# 2. Verify schema is correct
npx prisma validate

# 3. Commit
git add prisma/schema.prisma
git commit -m "Configure for PostgreSQL production"

# 4. Push
git push
```

### 4. **Switch Back After Deployment**

After deploying, switch back to SQLite for local development:

```powershell
.\switch-database.ps1 local
```

---

## 🔍 What the Script Does

1. **Reads your `.env` file** to detect current `DATABASE_URL`
2. **Updates `prisma/schema.prisma`** to set the correct provider
3. **Regenerates Prisma Client** to match the new provider
4. **Provides clear feedback** about what changed

---

## ⚠️ Important Notes

### Schema Changes

When you switch providers, the schema file changes:

```prisma
// SQLite (local)
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// PostgreSQL (production)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Database Migrations

- **SQLite**: Use `npx prisma db push` (no migrations needed)
- **PostgreSQL**: Use `npx prisma db push` or `npx prisma migrate deploy` (for production)

### Git Workflow

**Option 1: Keep SQLite in Git (Recommended)**
- Keep `provider = "sqlite"` in your main branch
- Switch to PostgreSQL only when deploying
- Render can run the switch script as part of build

**Option 2: Separate Branches**
- `main` branch: PostgreSQL (for production)
- `dev` branch: SQLite (for local development)

---

## 🛠️ Troubleshooting

### Error: "DATABASE_URL not found"

**Solution**: Ensure your `.env` file exists and contains `DATABASE_URL`

```env
DATABASE_URL="file:./dev.db"
```

### Error: "Schema file not found"

**Solution**: Run the script from the `backend` directory:

```powershell
cd backend
.\switch-database.ps1 auto
```

### Error: "Prisma Client generation failed"

**Solution**: Ensure Prisma is installed:

```powershell
npm install
npx prisma generate
```

### Schema Provider Mismatch

If you see errors about provider mismatch:

```powershell
# Force switch to correct provider
.\switch-database.ps1 local   # or production
npx prisma generate
```

---

## 📦 Integration with Render

### Option 1: Pre-Build Script

Add to your `package.json`:

```json
{
  "scripts": {
    "prebuild": "node switch-database.js production",
    "build": "prisma generate && tsc"
  }
}
```

### Option 2: Build Command in Render

Set your Render build command to:

```bash
npm install && node switch-database.js production && npm run build
```

### Option 3: Environment Variable

Render automatically uses PostgreSQL, so you can:

1. Set `DATABASE_URL` in Render dashboard
2. Run switch script in build command
3. Deploy

---

## 🎓 Example Workflow

### Daily Development

```powershell
# Morning: Start development
cd backend
.\switch-database.ps1 auto      # Auto-detects SQLite from .env
npx prisma db push              # Apply any schema changes
npm run dev                     # Start server

# ... work on features ...

# Evening: Prepare for deployment
.\switch-database.ps1 production
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL"
git push
```

### Production Deployment

```powershell
# On Render, build command runs:
node switch-database.js production
npx prisma generate
npx prisma db push
npm run build
```

---

## ✅ Checklist

Before deploying to production:

- [ ] Update `.env` or Render environment variables with PostgreSQL URL
- [ ] Run `.\switch-database.ps1 production`
- [ ] Verify `npx prisma validate` passes
- [ ] Test locally with PostgreSQL (optional)
- [ ] Commit schema changes
- [ ] Push to repository
- [ ] Verify Render deployment succeeds

---

## 🚨 Common Mistakes

1. **Forgetting to switch before deployment** → Schema mismatch error
2. **Committing wrong provider** → Production uses SQLite
3. **Not regenerating Prisma Client** → Type errors
4. **Using wrong DATABASE_URL format** → Connection errors

---

## 💡 Pro Tips

1. **Add to your startup script**: Include `switch-database.ps1 auto` in your dev startup
2. **Use npm scripts**: Add `"db:switch": "node switch-database.js auto"` to package.json
3. **CI/CD Integration**: Run switch script in your deployment pipeline
4. **Documentation**: Keep this guide updated as your workflow evolves

---

**Need help?** Check the script output - it provides clear feedback about what it's doing!

