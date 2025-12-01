# Quick Fix for Render Build Errors

## 🐛 The Problem

Error: `"Object literal may only specify known properties, and recurrenceRule does not exist in type 'calendarEventWhereInput'"`

**Root Cause**: Prisma Client wasn't regenerated after adding new schema fields. The build process was missing the `prisma generate` step.

## ✅ The Solution

### Step 1: Update Render Build Command

In your Render dashboard:
1. Go to your backend service
2. **Settings** → **Build & Deploy**
3. Set **Build Command** to:
   ```bash
   npm install && npm run build
   ```

The updated `build` script now:
1. Switches schema to PostgreSQL
2. Generates Prisma Client with new fields
3. Compiles TypeScript

### Step 2: Update Database Schema

**Option A: Via Render Shell (Recommended)**
1. Go to your service → **Shell** tab
2. Run:
   ```bash
   npx prisma db push
   ```

**Option B: Add to Build Command**
```bash
npm install && npm run build && npx prisma db push
```

### Step 3: Redeploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Monitor build logs
3. Verify no errors

## 🎯 That's It!

The build will now:
- ✅ Switch to PostgreSQL
- ✅ Generate Prisma Client with new fields
- ✅ Compile TypeScript
- ✅ (Optional) Push schema to database

---

**For detailed explanation, see `RENDER_BUILD_FIX.md`**

