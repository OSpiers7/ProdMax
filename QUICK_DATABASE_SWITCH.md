# Quick Database Switch Reference

## 🚀 Quick Commands

### PowerShell (Windows)
```powershell
cd backend
.\switch-database.ps1 auto          # Auto-detect from .env
.\switch-database.ps1 local          # Force SQLite
.\switch-database.ps1 production     # Force PostgreSQL
```

### Node.js (Cross-platform)
```bash
cd backend
npm run db:switch                    # Auto-detect (recommended)
npm run db:switch:local              # Force SQLite
npm run db:switch:production         # Force PostgreSQL
```

Or directly:
```bash
node switch-database.js auto
node switch-database.js local
node switch-database.js production
```

---

## 📋 Typical Workflows

### Starting Local Development
```bash
cd backend
npm run db:switch          # Auto-detects SQLite from .env
npx prisma db push         # Apply schema changes
npm run dev                # Start server
```

### Deploying to Production
```bash
cd backend
npm run db:switch:production    # Switch to PostgreSQL
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for production"
git push
```

### After Deployment
```bash
cd backend
npm run db:switch:local     # Switch back to SQLite
```

---

## 🔍 How Auto-Detection Works

The script reads your `.env` file:

- **SQLite**: `DATABASE_URL="file:./dev.db"` → Switches to SQLite
- **PostgreSQL**: `DATABASE_URL="postgresql://..."` → Switches to PostgreSQL

---

## ⚠️ Important

**Before deploying to Render:**
1. ✅ Run `npm run db:switch:production`
2. ✅ Commit the schema change
3. ✅ Push to repository

**After deployment:**
1. ✅ Run `npm run db:switch:local` to switch back

---

For detailed documentation, see `DATABASE_SWITCHING_GUIDE.md`

