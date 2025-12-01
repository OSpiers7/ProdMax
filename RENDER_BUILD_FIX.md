# Render Build Fix - Prisma Client Generation

## 🐛 Root Cause

The error `"Object literal may only specify known properties, and recurrenceRule does not exist in type 'calendarEventWhereInput'"` occurs because:

1. **Prisma Client Not Regenerated**: When you added new fields to the Prisma schema (`recurrenceRule`, `recurrenceEndDate`, `parentEventId`, `isRecurringInstance`), Prisma Client needs to be regenerated to include these fields in its TypeScript types.

2. **Build Process Missing Steps**: Render's build process was only running `tsc` (TypeScript compilation), but it wasn't:
   - Switching the schema to PostgreSQL
   - Running `prisma generate` to regenerate the client
   - Running `prisma db push` to update the database schema

3. **Stale Prisma Client**: The compiled code was using an old version of Prisma Client that didn't know about the new fields, causing TypeScript errors.

## ✅ Solution Applied

### Updated Build Scripts

The `package.json` build script now includes all necessary steps:

```json
{
  "scripts": {
    "build": "npm run db:switch:production && prisma generate && tsc",
    "postinstall": "prisma generate"
  }
}
```

**What this does:**
1. `npm run db:switch:production` - Switches schema to PostgreSQL
2. `prisma generate` - Regenerates Prisma Client with new fields
3. `tsc` - Compiles TypeScript code

**Also added `postinstall`:**
- Runs `prisma generate` automatically after `npm install`
- Ensures Prisma Client is always up-to-date

## 🚀 Render Configuration

### Option 1: Use Updated Build Command (Recommended)

In your Render dashboard, set the **Build Command** to:

```bash
npm install && npm run build
```

This will:
1. Install dependencies
2. Run `postinstall` (generates Prisma Client)
3. Switch to PostgreSQL
4. Regenerate Prisma Client
5. Compile TypeScript

### Option 2: Manual Build Command

If you prefer explicit control:

```bash
npm install && npm run db:switch:production && npx prisma generate && npm run build
```

### Database Migration

After the build succeeds, you also need to push the schema to the database. You can do this:

**Option A: Via Render Shell**
1. Go to your Render service dashboard
2. Click the **Shell** tab
3. Run:
   ```bash
   npx prisma db push
   ```

**Option B: Add to Build Command**
Add to your build command:
```bash
npm install && npm run build && npx prisma db push
```

**Option C: Add to Start Command**
Add to your start command (runs after each deploy):
```bash
npx prisma db push && node dist/index.js
```

## 📋 Step-by-Step Fix

### 1. Update Render Build Command

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Settings** → **Build & Deploy**
4. Update **Build Command** to:
   ```bash
   npm install && npm run build
   ```
5. Save changes

### 2. Update Database Schema

**Via Render Shell:**
1. Go to your service → **Shell** tab
2. Run:
   ```bash
   npx prisma db push
   ```

**Or add to build command:**
```bash
npm install && npm run build && npx prisma db push
```

### 3. Redeploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Monitor the build logs
3. Verify no Prisma errors appear

## 🔍 Verification

After deployment, check:

1. **Build Logs**: Should show:
   ```
   ✅ Switched schema provider from sqlite to postgresql
   ✔ Generated Prisma Client
   ✔ Compiled TypeScript
   ```

2. **Runtime**: No errors about missing Prisma fields

3. **Database**: New fields exist in `calendar_events` table

## 🛠️ Troubleshooting

### Error: "Prisma schema validation"

**Cause**: Schema provider mismatch

**Fix**: Ensure `npm run db:switch:production` runs before `prisma generate`

### Error: "Database connection failed"

**Cause**: `DATABASE_URL` not set or incorrect

**Fix**: 
1. Check Render environment variables
2. Verify `DATABASE_URL` is set
3. Ensure it starts with `postgresql://`

### Error: "Table does not exist"

**Cause**: Schema not pushed to database

**Fix**: Run `npx prisma db push` via Render Shell

### Error: "Cannot find module '@prisma/client'"

**Cause**: Prisma Client not generated

**Fix**: Ensure `prisma generate` runs in build process

## 📝 Best Practices

1. **Always regenerate Prisma Client after schema changes**
   - Run `prisma generate` after any schema modification
   - Include in build process

2. **Test locally before deploying**
   ```bash
   npm run db:switch:production
   npm run build
   # Test that it compiles
   ```

3. **Keep schema in sync**
   - Always push schema changes to database
   - Use `prisma db push` for development
   - Use migrations for production (optional)

4. **Monitor build logs**
   - Check for Prisma generation errors
   - Verify schema provider is correct

## 🎯 Summary

**The Fix:**
- ✅ Updated build script to include Prisma generation
- ✅ Added `postinstall` hook for automatic generation
- ✅ Ensures schema switches to PostgreSQL before generation

**What You Need to Do:**
1. ✅ Update Render build command to `npm install && npm run build`
2. ✅ Run `npx prisma db push` via Render Shell (or add to build)
3. ✅ Redeploy and verify

---

**Status**: ✅ Fixed - Ready to deploy

