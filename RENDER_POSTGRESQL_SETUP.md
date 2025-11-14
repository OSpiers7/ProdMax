# Render PostgreSQL Database Setup Guide

Step-by-step instructions for creating a PostgreSQL database on Render for your ProdMax backend.

---

## 🎯 Overview

You'll create a PostgreSQL database service on Render, which will provide you with:
- A fully managed PostgreSQL database
- Free tier (750 hours/month)
- Automatic backups
- Connection URL for your backend

---

## 📋 Step-by-Step Instructions

### Step 1: Sign In to Render

1. Go to [render.com](https://render.com)
2. Click **"Sign In"** (or **"Get Started"** if you don't have an account)
3. Sign in with your GitHub account (recommended)
4. Authorize Render to access your GitHub account

---

### Step 2: Navigate to Dashboard

1. After signing in, you'll be on the Render dashboard
2. You should see an empty dashboard or existing services
3. Look for the **"New +"** button (usually in the top right or center)

---

### Step 3: Create PostgreSQL Database

1. Click the **"New +"** button
2. A dropdown menu will appear
3. Select **"PostgreSQL"** from the list
   - It should be under the "Databases" section
   - Icon typically shows a database symbol

---

### Step 4: Configure Database Settings

You'll see a form with the following fields:

#### **Name** (Required)
- **What to enter:** `prodmax-db` (or any name you prefer)
- **Notes:** 
  - Use lowercase letters, numbers, and hyphens
  - No spaces or special characters
  - This is just for identification in your dashboard

#### **Database** (Required)
- **What to enter:** `prodmax` (or leave default)
- **Notes:**
  - This is the actual database name inside PostgreSQL
  - Can be different from the service name
  - Default is usually fine

#### **User** (Required)
- **What to enter:** `prodmax_user` (or leave default)
- **Notes:**
  - Database user that will own the database
  - Default is usually fine

#### **Region** (Required)
- **What to select:** Choose the region closest to you or your users
- **Options typically include:**
  - `Oregon (US West)`
  - `Ohio (US East)`
  - `Frankfurt (EU)`
  - `Singapore (Asia)`
- **Recommendation:** Choose the same region as your backend service (if you've created it)

#### **PostgreSQL Version** (Optional)
- **What to select:** Latest stable version (default is fine)
- **Options:** Usually `15`, `14`, or `13`
- **Recommendation:** Use the default (latest stable)

#### **Plan** (Required)
- **What to select:** **Free** (for development/testing)
- **Options:**
  - **Free:** 750 hours/month, 1GB storage, 256MB RAM
  - **Starter ($7/mo):** Always on, 10GB storage, 512MB RAM
  - **Standard ($20/mo):** More resources
- **For now:** Select **Free**

---

### Step 5: Review and Create

1. Review all your settings:
   - ✅ Name: `prodmax-db`
   - ✅ Database: `prodmax` (or default)
   - ✅ User: `prodmax_user` (or default)
   - ✅ Region: Your chosen region
   - ✅ Plan: **Free**

2. Click the **"Create Database"** button (usually at the bottom of the form)

---

### Step 6: Wait for Provisioning

1. Render will start provisioning your database
2. You'll see a status indicator showing "Creating..." or "Provisioning..."
3. **This typically takes 1-3 minutes**
4. You can watch the progress in real-time

**What's happening:**
- Render is creating a PostgreSQL instance
- Setting up the database and user
- Configuring networking and security
- Generating connection credentials

---

### Step 7: Database is Ready

1. Once provisioning is complete, the status will change to **"Available"** or show a green checkmark
2. You'll be taken to the database service page
3. You should see:
   - Database name
   - Status: "Available"
   - Connection information
   - Various tabs (Info, Logs, Settings, etc.)

---

### Step 8: Get Your Connection URL

Now you need to copy the database connection URL for your backend:

1. On the database service page, scroll down to find the **"Connections"** section
2. You'll see several connection options:
   - **Internal Database URL** ← **Use this one!**
   - External Database URL
   - Connection Pooling URL

3. **Click on "Internal Database URL"** to reveal the full connection string
   - It will look like: `postgresql://user:password@hostname:5432/dbname`
   - Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

4. **Click the copy icon** (📋) next to the Internal Database URL
   - This copies the full connection string to your clipboard

5. **Save this URL securely** - you'll need it for your backend environment variables

**Example format:**
```
postgresql://prodmax_user:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com/prodmax_xxxx
```

---

### Step 9: Verify Database Connection (Optional)

You can test the connection using a database client:

**Option A: Using psql (Command Line)**
```bash
# Install PostgreSQL client tools first
psql "your-internal-database-url-here"
```

**Option B: Using pgAdmin or DBeaver**
- Create a new connection
- Use the connection string details
- Test connection

**Option C: Using Prisma Studio (After Setup)**
```bash
cd backend
npx prisma studio
```

---

## 📝 Important Notes

### Internal vs External Database URL

- **Internal Database URL:** 
  - ✅ Use this for backend services **on Render**
  - ✅ Faster connection (same network)
  - ✅ More secure (not exposed to internet)

- **External Database URL:**
  - Use for connecting from outside Render (local development, other services)
  - Requires IP allowlisting (if enabled)

**For your setup:** Use **Internal Database URL** since your backend is also on Render.

---

### Security Best Practices

1. ✅ **Never commit** your database URL to Git
2. ✅ **Use environment variables** to store the connection string
3. ✅ **Rotate passwords** periodically (Render allows this in Settings)
4. ✅ **Use Internal URL** when possible (more secure)

---

### Free Tier Limitations

**Free tier includes:**
- ✅ 750 hours/month (enough for 24/7 operation)
- ✅ 1GB storage
- ✅ 256MB RAM
- ✅ Automatic backups (7-day retention)

**Limitations:**
- ⚠️ Database sleeps after 90 days of inactivity (wakes on first connection)
- ⚠️ Limited to 1 free database per account
- ⚠️ No connection pooling on free tier

---

## 🔧 Next Steps After Database Creation

### 1. Update Prisma Schema

You need to change your Prisma schema from SQLite to PostgreSQL:

1. Open `backend/prisma/schema.prisma`
2. Change the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

### 2. Set Environment Variable in Backend

1. Go to your Render backend Web Service
2. Navigate to **Environment** tab
3. Add environment variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the Internal Database URL you copied
4. Save changes

### 3. Run Database Migrations

After setting `DATABASE_URL`, you need to create your database tables:

**Option A: Via Render Shell**
1. Go to your backend service → **Shell** tab
2. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

**Option B: Via Build Command**
Add to your build command in Render:
```
npm install && npm run build && npx prisma generate && npx prisma db push
```

### 4. Verify Tables Created

1. Use Prisma Studio:
   ```bash
   npx prisma studio
   ```
2. Or check Render database logs for any errors

---

## 🎯 Quick Checklist

- [ ] Signed in to Render
- [ ] Clicked "New +" → "PostgreSQL"
- [ ] Set name: `prodmax-db`
- [ ] Selected region (closest to you)
- [ ] Selected **Free** plan
- [ ] Clicked "Create Database"
- [ ] Waited for provisioning (1-3 minutes)
- [ ] Copied **Internal Database URL**
- [ ] Saved URL securely
- [ ] Updated Prisma schema to `postgresql`
- [ ] Added `DATABASE_URL` to backend environment variables
- [ ] Ran database migrations (`prisma db push`)

---

## 🛠️ Troubleshooting

### Database Status Shows "Creating" for Too Long
- **Wait:** Can take up to 5 minutes
- **Check:** Render status page for any outages
- **Try:** Refresh the page

### Can't Find Connection URL
- **Look for:** "Connections" section on database service page
- **Alternative:** Go to **Settings** tab → **Database** section
- **Note:** URL might be hidden - click to reveal

### Connection Errors After Setup
- **Verify:** You're using Internal Database URL (not External)
- **Check:** Backend environment variable is set correctly
- **Ensure:** Prisma schema uses `provider = "postgresql"`
- **Test:** Run `npx prisma db push` to verify connection

### Database Sleeps (Free Tier)
- **Cause:** 90 days of inactivity
- **Solution:** First connection will wake it up (takes ~30 seconds)
- **Prevent:** Use a monitoring service to ping your database weekly

---

## 💡 Pro Tips

1. **Name Convention:** Use descriptive names like `prodmax-db-prod` and `prodmax-db-dev` if you have multiple environments

2. **Region Selection:** Choose the same region as your backend service for lowest latency

3. **Backup Strategy:** Free tier includes 7-day backups, but consider exporting important data periodically

4. **Monitoring:** Set up alerts in Render to notify you of database issues

5. **Connection Pooling:** For production, consider upgrading to a paid plan for connection pooling

---

## 📚 Additional Resources

- [Render PostgreSQL Documentation](https://render.com/docs/databases)
- [Prisma PostgreSQL Setup](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Render Support](https://render.com/docs/support)

---

## ✅ You're Done!

Once your database is created and you've copied the connection URL, you're ready to:
1. Add it to your backend environment variables
2. Update your Prisma schema
3. Run migrations
4. Start using your production database!

Need help with the next steps? Check the main deployment guide or ask for assistance!

