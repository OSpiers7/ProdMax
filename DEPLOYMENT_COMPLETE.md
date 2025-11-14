# Completing ProdMax Deployment

You've deployed the frontend to Vercel and backend to Railway. Here are the remaining steps to complete the deployment:

## ✅ Step 1: Set Up Database

### Option A: Railway PostgreSQL (Recommended)
1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will create a PostgreSQL database
3. Copy the **Connection URL** (you'll need this for the backend)

### Option B: Supabase (Free tier available)
1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to **Settings** → **Database**
3. Copy the **Connection string** (URI format)

### Option C: Vercel Postgres
1. In Vercel dashboard → **Storage** tab
2. Click **"Create Database"** → **Postgres**
3. Copy the connection string

---

## ✅ Step 2: Configure Backend Environment Variables (Railway)

In your Railway backend project:

1. Go to your backend service → **Variables** tab
2. Add these environment variables:

```
DATABASE_URL=your_postgres_connection_string_here
JWT_SECRET=your_secure_random_string_here
FRONTEND_URL=https://your-frontend-app.vercel.app
PORT=3001
NODE_ENV=production
```

**Important:**
- Replace `your_postgres_connection_string_here` with the actual PostgreSQL connection URL from Step 1
- Generate a secure `JWT_SECRET` (use a random string generator or `openssl rand -base64 32`)
- Replace `your-frontend-app.vercel.app` with your actual Vercel frontend URL

---

## ✅ Step 3: Run Database Migrations

After setting the `DATABASE_URL`, Railway will automatically redeploy. However, you need to run Prisma migrations:

### Option A: Via Railway CLI
```bash
# Install Railway CLI if you haven't
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
cd backend
railway run npx prisma db push
railway run npx prisma generate
```

### Option B: Via Railway Dashboard
1. Go to your backend service in Railway
2. Click **"Deployments"** → **"New Deployment"**
3. Or add a build command that runs migrations:
   - In **Settings** → **Deploy**, add to build command:
   ```
   npm install && npx prisma generate && npx prisma db push && npm run build
   ```

### Option C: Manual Migration Script
Create a one-time migration by connecting to your database directly or using Railway's shell.

---

## ✅ Step 4: Update Frontend Environment Variables (Vercel)

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add/Update:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
   (Replace with your actual Railway backend URL)

3. **Important:** After adding/updating environment variables:
   - Go to **Deployments** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"** to apply the new environment variables

---

## ✅ Step 5: Update Backend CORS Settings

Verify your backend allows requests from your frontend:

1. In Railway backend → **Variables**
2. Ensure `FRONTEND_URL` is set to your Vercel frontend URL:
   ```
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```

The backend code already uses this in CORS configuration.

---

## ✅ Step 6: Test Your Deployment

1. **Test Frontend:**
   - Visit your Vercel URL: `https://your-app.vercel.app`
   - Try to register a new account
   - Try to login

2. **Test Backend:**
   - Check Railway logs for any errors
   - Test API endpoint: `https://your-backend.railway.app/api/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

3. **Test Full Flow:**
   - Register/Login from frontend
   - Create a calendar event
   - Check if it appears on the calendar
   - Test analytics page

---

## ✅ Step 7: Verify Database Connection

1. Check Railway backend logs for:
   - "Server running on port 3001"
   - No database connection errors

2. If you see database errors:
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible (not blocked by firewall)
   - Check if Prisma migrations ran successfully

---

## 🔧 Troubleshooting

### Frontend can't connect to backend
- ✅ Check `VITE_API_URL` in Vercel environment variables
- ✅ Verify backend URL is correct (should end with `/api`)
- ✅ Check browser console for CORS errors
- ✅ Verify `FRONTEND_URL` in Railway matches your Vercel URL

### Database connection errors
- ✅ Verify `DATABASE_URL` format (should start with `postgresql://`)
- ✅ Check if database is running in Railway
- ✅ Run `npx prisma db push` to create tables
- ✅ Check Railway logs for specific error messages

### Authentication not working
- ✅ Verify `JWT_SECRET` is set in Railway
- ✅ Check backend logs for JWT errors
- ✅ Ensure frontend is sending requests to correct backend URL

### Build errors
- ✅ Check Vercel build logs for TypeScript/compilation errors
- ✅ Verify all dependencies are in `package.json`
- ✅ Check Railway build logs for backend errors

---

## 📝 Quick Checklist

- [ ] Database created (PostgreSQL)
- [ ] Backend environment variables set in Railway:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL`
  - [ ] `NODE_ENV=production`
- [ ] Database migrations run (`prisma db push`)
- [ ] Frontend environment variable set in Vercel:
  - [ ] `VITE_API_URL`
- [ ] Frontend redeployed after env var changes
- [ ] Backend redeployed after env var changes
- [ ] Tested registration/login
- [ ] Tested calendar functionality
- [ ] Tested analytics page

---

## 🎉 You're Done!

Once all steps are complete, your ProdMax app should be fully functional in production!

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.railway.app/api`


