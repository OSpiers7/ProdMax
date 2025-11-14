# PostgreSQL Migration Steps

You've updated your Prisma schema to use PostgreSQL. Follow these steps to complete the migration.

---

## ✅ Step 1: Schema Updated

Your `backend/prisma/schema.prisma` has been updated:
- Changed `provider = "sqlite"` → `provider = "postgresql"`

---

## 🚀 Step 2: Regenerate Prisma Client

You need to regenerate the Prisma client for PostgreSQL:

### Option A: Local Development (if testing locally)
```bash
cd backend
npx prisma generate
```

### Option B: On Render (Recommended)
Add this to your Render build command:

1. Go to your Render backend service
2. Click **Settings** → **Build & Deploy**
3. Update **Build Command** to:
   ```
   npm install && npm run build && npx prisma generate
   ```
4. Save changes
5. Render will automatically redeploy

---

## 🗄️ Step 3: Push Schema to Database

Create the database tables in your PostgreSQL database:

### Option A: Via Render Shell (Recommended)
1. Go to your Render backend service
2. Click the **Shell** tab
3. Run:
   ```bash
   npx prisma db push
   ```
4. This will create all tables in your PostgreSQL database

### Option B: Via Build Command
Add to your Render build command:
```
npm install && npm run build && npx prisma generate && npx prisma db push
```

**Note:** `prisma db push` is good for prototyping. For production, consider using migrations:
```bash
npx prisma migrate dev --name init
```

---

## ✅ Step 4: Verify Database Tables

### Option A: Using Prisma Studio
```bash
cd backend
npx prisma studio
```
This opens a browser interface to view your database.

### Option B: Check Render Logs
1. Go to your backend service → **Logs** tab
2. Look for any database connection errors
3. If you see "Successfully connected to database", you're good!

### Option C: Test API Endpoint
1. Visit: `https://your-backend.onrender.com/api/health`
2. Should return: `{"status":"OK","timestamp":"..."}`
3. Try registering a user to test database writes

---

## 🔍 What Changed?

### SQLite → PostgreSQL Differences

**What's the same:**
- ✅ All your models and fields
- ✅ Relations and constraints
- ✅ Data types (String, Int, DateTime, Boolean)
- ✅ Indexes and unique constraints

**What's different:**
- ✅ Better performance and scalability
- ✅ More robust data types
- ✅ Better concurrent access
- ✅ Production-ready features

**No code changes needed:**
- Your backend code doesn't need any changes
- Prisma handles the database differences
- All your queries will work the same

---

## 🛠️ Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"
- **Fix:** Make sure `DATABASE_URL` is set in Render environment variables
- **Check:** Render service → Environment tab

### Error: "Can't reach database server"
- **Fix:** Verify you're using the **Internal Database URL** (not External)
- **Check:** Database connection string format

### Error: "Table already exists"
- **Fix:** This is normal if you've run `db push` before
- **Solution:** Use `prisma migrate reset` to start fresh (⚠️ deletes all data)

### Error: "P1001: Can't reach database server"
- **Fix:** 
  1. Check database is running in Render
  2. Verify Internal Database URL is correct
  3. Check Render status page for outages

---

## 📋 Quick Checklist

- [x] Updated Prisma schema to `postgresql`
- [ ] Regenerated Prisma client (`npx prisma generate`)
- [ ] Pushed schema to database (`npx prisma db push`)
- [ ] Verified tables created (Prisma Studio or logs)
- [ ] Tested API endpoints
- [ ] Verified database connection in logs

---

## 🎯 Next Steps

After completing the migration:

1. **Test your application:**
   - Register a new user
   - Create a calendar event
   - Test analytics

2. **Monitor logs:**
   - Check Render backend logs for any errors
   - Verify database queries are working

3. **Update frontend:**
   - Make sure `VITE_API_URL` points to your Render backend
   - Test the full application flow

---

## 💡 Pro Tips

1. **For Production:** Consider using Prisma Migrate instead of `db push`:
   ```bash
   npx prisma migrate dev --name init
   npx prisma migrate deploy  # For production
   ```

2. **Backup Strategy:** Render free tier includes 7-day backups, but export important data periodically

3. **Connection Pooling:** For high traffic, consider upgrading to a paid Render plan for connection pooling

4. **Local Development:** You can still use SQLite locally by having separate `.env` files:
   - `.env.local` (SQLite for local dev)
   - `.env.production` (PostgreSQL for production)

---

## ✅ You're Done!

Once you've:
1. ✅ Regenerated Prisma client
2. ✅ Pushed schema to database
3. ✅ Verified tables are created

Your backend should be fully connected to PostgreSQL and ready to use!

Need help with any step? Let me know!

