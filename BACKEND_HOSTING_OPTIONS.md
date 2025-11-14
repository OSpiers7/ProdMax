# Free Backend Hosting Options for ProdMax

This guide compares free alternatives to Railway for hosting your Express/Node.js backend.

---

## 🏆 Top Recommendations (Best Free Tiers)

### 1. **Render** ⭐ (Recommended)
**Best overall free option**

**Free Tier:**
- ✅ 750 hours/month (enough for 24/7 operation)
- ✅ 512MB RAM
- ✅ Free SSL certificates
- ✅ Automatic deployments from GitHub
- ✅ PostgreSQL database available (free tier)
- ✅ Sleeps after 15 minutes of inactivity (wakes on request)

**Pros:**
- Very easy setup
- Great documentation
- PostgreSQL database included
- No credit card required for free tier
- Good for production use

**Cons:**
- Cold starts after sleep (first request takes ~30 seconds)
- Limited to 1 free service per account

**Setup Steps:**
1. Sign up at [render.com](https://render.com) (GitHub login)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `prodmax-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)
6. Add PostgreSQL database: **"New +"** → **"PostgreSQL"**

**Cost:** Free (with limitations)

---

### 2. **Fly.io** ⭐ (Great for Performance)
**Best for no cold starts**

**Free Tier:**
- ✅ 3 shared-cpu VMs
- ✅ 256MB RAM per VM
- ✅ 3GB persistent volume storage
- ✅ 160GB outbound data transfer/month
- ✅ No cold starts (always running)
- ✅ Global edge network

**Pros:**
- No sleep/cold starts
- Fast deployments
- Great performance
- Good for production

**Cons:**
- Requires credit card (but won't charge on free tier)
- Slightly more complex setup
- Need to configure `fly.toml`

**Setup Steps:**
1. Install Fly CLI: `npm install -g flyctl`
2. Sign up: `flyctl auth signup`
3. In `backend/` directory, run: `flyctl launch`
4. Follow prompts (select region, app name)
5. Add secrets: `flyctl secrets set DATABASE_URL=... JWT_SECRET=...`
6. Deploy: `flyctl deploy`

**Cost:** Free (requires credit card, but won't charge)

---

### 3. **Cyclic** ⭐ (Simplest Setup)
**Best for quick deployment**

**Free Tier:**
- ✅ Unlimited deployments
- ✅ Always-on (no sleep)
- ✅ Free SSL
- ✅ Automatic deployments from GitHub
- ✅ Serverless functions

**Pros:**
- Extremely simple setup
- No cold starts
- Great for Express apps
- No credit card required

**Cons:**
- Less control over infrastructure
- Smaller community
- May need to adapt for Socket.io

**Setup Steps:**
1. Sign up at [cyclic.sh](https://cyclic.sh) (GitHub login)
2. Click **"Deploy Now"**
3. Connect GitHub repo
4. Select `backend` folder
5. Add environment variables
6. Deploy!

**Cost:** Free

---

### 4. **Vercel** (Serverless Functions)
**Best if you want everything on Vercel**

**Free Tier:**
- ✅ Unlimited serverless function invocations
- ✅ 100GB bandwidth/month
- ✅ Automatic deployments
- ✅ Edge network

**Pros:**
- Same platform as your frontend
- Great performance
- Easy to manage

**Cons:**
- Requires refactoring Express app to serverless functions
- Socket.io won't work (need alternative)
- More complex migration

**Setup Steps:**
1. In Vercel dashboard, add backend as separate project
2. Root directory: `backend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. **Note:** You'll need to adapt your Express routes to Vercel serverless functions

**Cost:** Free (with usage limits)

---

## 📊 Comparison Table

| Platform | Free Tier | Cold Starts | Database | Setup Difficulty | Best For |
|----------|-----------|-------------|----------|------------------|----------|
| **Render** | 750 hrs/mo | Yes (15min sleep) | ✅ PostgreSQL | ⭐ Easy | Production apps |
| **Fly.io** | 3 VMs | ❌ No | ❌ (external) | ⭐⭐ Medium | Performance |
| **Cyclic** | Unlimited | ❌ No | ❌ (external) | ⭐ Very Easy | Quick setup |
| **Vercel** | Serverless | Minimal | ❌ (external) | ⭐⭐⭐ Hard | All-in-one |

---

## 🎯 My Recommendation: **Render**

**Why Render?**
1. ✅ **Easiest migration** from Railway (similar setup)
2. ✅ **PostgreSQL included** (no separate database setup needed)
3. ✅ **750 hours/month** is enough for 24/7 operation
4. ✅ **No credit card required**
5. ✅ **Great documentation** and community support
6. ✅ **Production-ready** free tier

**Trade-off:** Cold starts after 15 minutes of inactivity (first request takes ~30 seconds to wake up)

---

## 🚀 Quick Migration Guide: Railway → Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render

### Step 2: Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Name: `prodmax-db`
3. Region: Choose closest to you
4. Plan: **Free**
5. Click **"Create Database"**
6. Copy the **Internal Database URL** (you'll use this)

### Step 3: Deploy Backend Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`OSpiers7/ProdMax`)
3. Configure:
   - **Name**: `prodmax-backend`
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm start`
4. Click **"Advanced"** → **"Add Environment Variable"**
   - Add all your environment variables:
     ```
     DATABASE_URL=<from PostgreSQL service>
     JWT_SECRET=<your-secret>
     FRONTEND_URL=https://your-frontend.vercel.app
     NODE_ENV=production
     PORT=10000
     ```
   - **Note:** Render uses port `10000` by default (or `PORT` env var)
5. Click **"Create Web Service"**

### Step 4: Run Database Migrations
1. Once service is deployed, go to **"Shell"** tab
2. Run:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. Or add to build command: `npm install && npm run build && npx prisma generate && npx prisma db push`

### Step 5: Update Frontend
1. In Vercel, update `VITE_API_URL`:
   ```
   VITE_API_URL=https://prodmax-backend.onrender.com/api
   ```
2. Redeploy frontend

### Step 6: Test
- Visit your Render service URL
- Test API: `https://prodmax-backend.onrender.com/api/health`
- Test from frontend

---

## 🔧 Alternative: Fly.io Setup (If You Want No Cold Starts)

If cold starts are a concern, here's a quick Fly.io setup:

### Step 1: Install Fly CLI
```bash
npm install -g flyctl
```

### Step 2: Login
```bash
flyctl auth signup
# or
flyctl auth login
```

### Step 3: Initialize Fly App
```bash
cd backend
flyctl launch
```

Follow prompts:
- App name: `prodmax-backend`
- Region: Choose closest
- PostgreSQL: Yes (or use external)
- Redis: No

### Step 4: Configure Environment Variables
```bash
flyctl secrets set DATABASE_URL="your-db-url"
flyctl secrets set JWT_SECRET="your-secret"
flyctl secrets set FRONTEND_URL="https://your-frontend.vercel.app"
flyctl secrets set NODE_ENV="production"
```

### Step 5: Deploy
```bash
flyctl deploy
```

### Step 6: Run Migrations
```bash
flyctl ssh console
npx prisma db push
```

---

## 💡 Pro Tips

1. **For Render:** Use the "Always On" paid plan ($7/mo) if you need no cold starts
2. **For Fly.io:** Monitor usage to stay within free tier limits
3. **Database:** Consider Supabase (free PostgreSQL) if your host doesn't include it
4. **Monitoring:** Use free tier of services like Better Uptime or UptimeRobot to ping your API and prevent sleep

---

## 📝 Next Steps

1. **Choose your platform** (I recommend Render)
2. **Set up database** (PostgreSQL)
3. **Deploy backend** following the migration guide
4. **Update frontend** `VITE_API_URL`
5. **Test everything**

Would you like me to help you migrate to a specific platform? I can create deployment configuration files for your chosen option.

