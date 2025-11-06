# Vercel Deployment Guide for ProdMax

This guide will walk you through deploying both the frontend and backend of ProdMax to Vercel.

## 📋 Overview

- **Frontend**: Deploy to Vercel (React/Vite app)
- **Backend**: Deploy to Vercel as a serverless function OR use alternative (Railway, Render, etc.)
- **Database**: You'll need to set up a production database (PostgreSQL recommended)

---

## 🎯 Part 1: Deploy Frontend to Vercel

### Step 1: Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"** and authorize Vercel

### Step 2: Import Your Repository

1. In Vercel dashboard, click **"Add New Project"**
2. Click **"Import Git Repository"**
3. Find and select `OSpiers7/ProdMax`
4. Click **"Import"**

### Step 3: Configure Frontend Project

In the project configuration:

1. **Project Name**: `prodmax-frontend` (or your choice)

2. **Root Directory**: 
   - Click **"Edit"** next to Root Directory
   - Set to: `frontend`
   - Click **"Continue"**

3. **Framework Preset**: 
   - Should auto-detect as **Vite**
   - If not, select **"Vite"**

4. **Build Settings**:
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

5. **Environment Variables**:
   Add these variables:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```
   (We'll update this after backend deployment)

6. Click **"Deploy"**

### Step 4: Wait for Deployment

- Vercel will build and deploy your frontend
- This takes 2-5 minutes
- You'll get a URL like: `https://prodmax-frontend.vercel.app`

---

## 🚀 Part 2: Deploy Backend to Vercel

### Option A: Deploy Backend as Serverless Functions (Vercel)

**Note**: Vercel serverless functions work well for APIs, but you'll need to set up a production database (PostgreSQL). SQLite won't work in serverless.

#### Step 1: Create Backend Project

1. In Vercel dashboard, click **"Add New Project"** again
2. Import the same repository: `OSpiers7/ProdMax`
3. **Project Name**: `prodmax-backend`

#### Step 2: Configure Backend Project

1. **Root Directory**: `backend`
2. **Framework Preset**: **Other** (or leave blank)
3. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty (not needed for API)
   - **Install Command**: `npm install`

4. **Environment Variables**:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   PORT=3001
   FRONTEND_URL=https://prodmax-frontend.vercel.app
   NODE_ENV=production
   ```

5. Click **"Deploy"**

#### Step 3: Set Up Production Database

For production, you'll need PostgreSQL. Options:

**Option 1: Vercel Postgres** (Recommended)
1. In Vercel dashboard, go to **Storage** tab
2. Click **"Create Database"**
3. Select **Postgres**
4. Choose region and name
5. Copy the connection string
6. Add it to your backend environment variables as `DATABASE_URL`

**Option 2: Supabase** (Free tier available)
1. Go to [supabase.com](https://supabase.com)
2. Create a free project
3. Get connection string from Settings → Database
4. Add to Vercel environment variables

**Option 3: Railway** (Easy setup)
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy connection string
4. Add to Vercel environment variables

#### Step 4: Update Prisma for Production

After setting up the database:

1. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Push the schema:
   ```bash
   cd backend
   npx prisma db push
   npx prisma generate
   ```

### Option B: Deploy Backend to Railway/Render (Easier for Full-Stack)

If you prefer a simpler deployment:

**Railway**:
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `ProdMax` repository
4. Set root directory to `backend`
5. Add environment variables
6. Railway auto-deploys on push

**Render**:
1. Go to [render.com](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Connect GitHub repo
4. Set root directory to `backend`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`

---

## 🔗 Part 3: Connect Frontend and Backend

### Step 1: Get Backend URL

After backend deployment, you'll get a URL like:
- `https://prodmax-backend.vercel.app` (if using Vercel)
- `https://prodmax-backend.railway.app` (if using Railway)
- `https://prodmax-backend.onrender.com` (if using Render)

### Step 2: Update Frontend Environment Variable

1. Go to Vercel dashboard → Your frontend project
2. Go to **Settings** → **Environment Variables**
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://your-backend-url/api
   ```
   (Don't forget `/api` at the end)

4. Click **"Redeploy"** to apply changes

### Step 3: Update Backend CORS

Make sure your backend allows requests from your frontend:

In `backend/src/index.ts`, verify:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://prodmax-frontend.vercel.app',
  credentials: true
}));
```

---

## ✅ Part 4: Final Steps

### Step 1: Test Your Deployment

1. Visit your frontend URL: `https://prodmax-frontend.vercel.app`
2. Try to register/login
3. Check if API calls work

### Step 2: Set Up Custom Domain (Optional)

1. In Vercel project settings → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### Step 3: Enable Auto-Deployments

Both projects should auto-deploy when you push to GitHub:
- Push to `main` branch → Automatic deployment
- Check deployment status in Vercel dashboard

---

## 🐛 Troubleshooting

### Frontend Issues

**Build fails:**
- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Verify `VITE_API_URL` is set correctly

**API calls fail:**
- Check `VITE_API_URL` environment variable
- Verify backend URL includes `/api`
- Check browser console for CORS errors

### Backend Issues

**Database connection fails:**
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- For Supabase, check connection pooling settings

**API routes return 404:**
- Verify `vercel.json` is configured correctly
- Check that routes are set up properly
- Verify serverless function structure

### Common Fixes

1. **Clear Vercel cache**: Settings → Clear Build Cache
2. **Redeploy**: Click "Redeploy" in Vercel dashboard
3. **Check logs**: View deployment logs for errors
4. **Test locally**: Ensure everything works locally first

---

## 📝 Environment Variables Checklist

### Frontend (Vercel)
- ✅ `VITE_API_URL` - Your backend API URL

### Backend (Vercel/Railway/Render)
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Secret key for JWT tokens
- ✅ `FRONTEND_URL` - Your frontend URL
- ✅ `PORT` - Port number (optional, auto-set)
- ✅ `NODE_ENV` - Set to `production`

---

## 🎉 Success!

Once deployed, you should have:
- ✅ Frontend: `https://prodmax-frontend.vercel.app`
- ✅ Backend: `https://prodmax-backend.vercel.app` (or your chosen platform)
- ✅ Database: PostgreSQL (production)
- ✅ Auto-deployments on git push

Your ProdMax app is now live! 🚀


