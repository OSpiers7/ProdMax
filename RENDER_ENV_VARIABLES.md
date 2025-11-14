# Render Environment Variables Setup Guide

This guide shows you exactly which environment variables you need and how to obtain them for your ProdMax backend on Render.

---

## 📋 Required Environment Variables

### 1. **DATABASE_URL** (Required)
**What it is:** PostgreSQL connection string for your database

**How to get it:**
1. In Render dashboard, go to your **PostgreSQL** database service
2. Click on the database name
3. Scroll to **"Connections"** section
4. Copy the **"Internal Database URL"** (use this for backend on Render)
   - Format: `postgresql://user:password@hostname:5432/dbname`
5. **Alternative:** If you're using an external database (Supabase, etc.), get the connection string from their dashboard

**Example:**
```
postgresql://prodmax_user:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com/prodmax_db_xxxx
```

**Where to add in Render:**
- Go to your Web Service → **Environment** tab
- Key: `DATABASE_URL`
- Value: Paste the connection string

---

### 2. **JWT_SECRET** (Required)
**What it is:** Secret key for signing JWT tokens (authentication)

**How to generate it:**
You need to create a secure random string. Here are several ways:

**Option A: Using Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option B: Using OpenSSL**
```bash
openssl rand -base64 64
```

**Option C: Online Generator**
- Go to [randomkeygen.com](https://randomkeygen.com/)
- Use a "CodeIgniter Encryption Keys" (256-bit)
- Copy the generated string

**Option D: PowerShell (Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0
```

**Important:**
- Keep this secret secure
- Use a different secret for production vs development
- Don't commit this to Git

**Where to add in Render:**
- Key: `JWT_SECRET`
- Value: Your generated secret string

---

### 3. **FRONTEND_URL** (Required)
**What it is:** Your Vercel frontend URL (for CORS and Socket.io)

**How to get it:**
1. Go to your Vercel dashboard
2. Click on your frontend project
3. Copy the **Production URL** (usually `https://your-app-name.vercel.app`)
4. **Don't include** `/api` or trailing slashes

**Example:**
```
https://prodmax-app.vercel.app
```

**Where to add in Render:**
- Key: `FRONTEND_URL`
- Value: Your Vercel frontend URL

---

### 4. **NODE_ENV** (Recommended)
**What it is:** Environment mode (development/production)

**Value:**
```
production
```

**Where to add in Render:**
- Key: `NODE_ENV`
- Value: `production`

---

### 5. **PORT** (Optional - Render sets this automatically)
**What it is:** Port number for the server

**Note:** Render automatically sets `PORT` to `10000` for web services. You don't need to set this manually, but if you want to be explicit:

**Value:**
```
10000
```

**Where to add in Render:**
- Key: `PORT`
- Value: `10000` (optional, Render sets this automatically)

---

### 6. **JWT_EXPIRES_IN** (Optional)
**What it is:** JWT token expiration time

**Default:** `7d` (7 days)

**Common values:**
- `7d` - 7 days (default)
- `30d` - 30 days
- `1h` - 1 hour
- `24h` - 24 hours

**Where to add in Render:**
- Key: `JWT_EXPIRES_IN`
- Value: `7d` (or your preferred duration)

---

## 🚀 Step-by-Step: Adding Environment Variables in Render

### Method 1: During Service Creation
1. When creating your Web Service, scroll to **"Environment Variables"** section
2. Click **"Add Environment Variable"** for each variable
3. Enter Key and Value
4. Click **"Create Web Service"**

### Method 2: After Service Creation
1. Go to your Web Service in Render dashboard
2. Click on **"Environment"** tab (left sidebar)
3. Click **"Add Environment Variable"**
4. Enter:
   - **Key:** (e.g., `DATABASE_URL`)
   - **Value:** (paste your value)
5. Click **"Save Changes"**
6. Render will automatically redeploy with new variables

---

## 📝 Complete Environment Variables Checklist

Copy this checklist and fill in your values:

```
✅ DATABASE_URL = [Get from Render PostgreSQL service]
✅ JWT_SECRET = [Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
✅ FRONTEND_URL = [Your Vercel frontend URL, e.g., https://prodmax-app.vercel.app]
✅ NODE_ENV = production
✅ PORT = 10000 (optional, Render sets automatically)
✅ JWT_EXPIRES_IN = 7d (optional, defaults to 7d)
```

---

## 🔍 Verifying Your Environment Variables

### Check 1: Render Dashboard
1. Go to your Web Service → **Environment** tab
2. Verify all variables are listed
3. Check that values are correct (you can't see the full value for security, but you can verify the key exists)

### Check 2: Service Logs
1. Go to your Web Service → **Logs** tab
2. Look for any errors related to missing environment variables
3. Common errors:
   - `DATABASE_URL is not defined` → Add DATABASE_URL
   - `JWT_SECRET is not defined` → Add JWT_SECRET
   - CORS errors → Check FRONTEND_URL

### Check 3: Test API Endpoint
1. Visit: `https://your-backend.onrender.com/api/health`
2. Should return: `{"status":"OK","timestamp":"..."}`
3. If you get errors, check logs for missing env vars

---

## 🛠️ Quick Reference: Generating JWT_SECRET

**Windows PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Mac/Linux Terminal:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Or using OpenSSL:**
```bash
openssl rand -base64 64
```

---

## ⚠️ Common Mistakes to Avoid

1. ❌ **Wrong DATABASE_URL format**
   - ✅ Use Internal Database URL from Render (if database is on Render)
   - ✅ Use External Database URL if using Supabase/other

2. ❌ **FRONTEND_URL includes `/api`**
   - ❌ Wrong: `https://app.vercel.app/api`
   - ✅ Correct: `https://app.vercel.app`

3. ❌ **JWT_SECRET is too short or predictable**
   - ✅ Use at least 32 characters
   - ✅ Use cryptographically random string

4. ❌ **Forgetting to redeploy after adding env vars**
   - Render auto-redeploys, but check the deployment status

5. ❌ **Using development values in production**
   - ✅ Use different JWT_SECRET for production
   - ✅ Use production database URL

---

## 📋 Example: Complete Environment Variables Setup

Here's what your Render Environment tab should look like:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | From Render PostgreSQL |
| `JWT_SECRET` | `a1b2c3d4...` (64 char hex) | Generated secret |
| `FRONTEND_URL` | `https://prodmax-app.vercel.app` | Your Vercel URL |
| `NODE_ENV` | `production` | Environment mode |
| `JWT_EXPIRES_IN` | `7d` | Token expiration (optional) |

---

## 🎯 Next Steps After Setting Environment Variables

1. ✅ Add all environment variables in Render
2. ✅ Wait for automatic redeployment
3. ✅ Check deployment logs for errors
4. ✅ Test health endpoint: `https://your-backend.onrender.com/api/health`
5. ✅ Run database migrations (if needed)
6. ✅ Update frontend `VITE_API_URL` to point to Render backend
7. ✅ Test full application flow

---

## 💡 Pro Tips

1. **Keep a backup** of your environment variables in a secure password manager
2. **Use different JWT_SECRET** for each environment (dev, staging, prod)
3. **Test locally first** with `.env` file before deploying
4. **Monitor Render logs** after deployment to catch any env var issues early

---

Need help? Check Render's documentation or test your API endpoint to verify everything is working!

