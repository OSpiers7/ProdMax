# Final Deployment Steps - ProdMax

Your backend build succeeded on Render! Here's what's left to complete your deployment.

---

## ✅ Step 1: Verify Backend is Running

1. **Check Render Service Status:**
   - Go to your Render backend service dashboard
   - Verify status shows **"Live"** (green)
   - Check the **Logs** tab for any runtime errors

2. **Test Backend Health Endpoint:**
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should return: `{"status":"OK","timestamp":"..."}`
   - If you get an error, check Render logs

3. **Note Your Backend URL:**
   - Copy your backend URL (e.g., `https://prodmax-backend.onrender.com`)
   - You'll need this for the frontend configuration

---

## ✅ Step 2: Run Database Migrations

Your database tables need to be created in PostgreSQL:

### Option A: Via Render Shell (Recommended)
1. Go to your Render backend service
2. Click the **Shell** tab
3. Run:
   ```bash
   npx prisma db push
   ```
4. Wait for success message: "Your database is now in sync with your Prisma schema"

### Option B: Add to Build Command
If migrations fail, add to your Render build command:
```
npm install && npm run build && npx prisma generate && npx prisma db push
```

### Verify Tables Created:
```bash
npx prisma studio
```
Or check Render database logs for any errors.

---

## ✅ Step 3: Update Frontend Environment Variables (Vercel)

Your frontend needs to know where your backend is:

1. **Go to Vercel Dashboard:**
   - Navigate to your frontend project
   - Click **Settings** → **Environment Variables**

2. **Add/Update Environment Variable:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend.onrender.com/api`
     - Replace `your-backend` with your actual Render backend URL
     - **Important:** Include `/api` at the end
   - **Environment:** Production (and Preview if you want)

3. **Redeploy Frontend:**
   - Go to **Deployments** tab
   - Click **"..."** menu on latest deployment
   - Click **"Redeploy"**
   - This applies the new environment variable

---

## ✅ Step 4: Verify Backend Environment Variables (Render)

Double-check all backend environment variables are set:

1. **Go to Render Backend Service:**
   - Click **Environment** tab
   - Verify these are set:
     - ✅ `DATABASE_URL` - PostgreSQL connection string
     - ✅ `JWT_SECRET` - Your generated secret
     - ✅ `FRONTEND_URL` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
     - ✅ `NODE_ENV` - Set to `production`
     - ✅ `PORT` - Optional (Render sets automatically)

2. **If any are missing, add them and redeploy**

---

## ✅ Step 5: Test Your Application

### Test 1: Frontend Loads
- Visit your Vercel frontend URL
- Should see the ProdMax login/register page
- No console errors in browser DevTools

### Test 2: Registration
- Click "Register" or "Sign Up"
- Create a new account
- Should redirect to dashboard after successful registration

### Test 3: Login
- Log in with your credentials
- Should successfully authenticate and show dashboard

### Test 4: Calendar Functionality
- Create a calendar event
- Should appear on the calendar
- Verify event persists after page refresh

### Test 5: Analytics
- Navigate to Analytics page
- Should load without errors
- Charts should display (may be empty if no data yet)

---

## ✅ Step 6: Verify CORS Configuration

If you get CORS errors:

1. **Check Backend CORS Settings:**
   - In Render, verify `FRONTEND_URL` matches your Vercel URL exactly
   - No trailing slashes
   - Should be: `https://your-app.vercel.app` (not `https://your-app.vercel.app/`)

2. **Check Backend Logs:**
   - Look for CORS-related errors
   - Verify requests are coming from the correct origin

---

## ✅ Step 7: Monitor and Debug

### Check Render Logs:
- Go to backend service → **Logs** tab
- Look for:
  - ✅ "Server running on port XXXX"
  - ✅ Database connection success
  - ❌ Any error messages

### Check Vercel Logs:
- Go to frontend project → **Deployments** → Click on deployment → **Functions** tab
- Look for build/runtime errors

### Check Browser Console:
- Open DevTools (F12)
- Check **Console** tab for errors
- Check **Network** tab for failed API requests

---

## 🎯 Quick Checklist

- [ ] Backend build succeeded on Render ✅ (You're here!)
- [ ] Backend service is "Live" on Render
- [ ] Health endpoint works: `https://your-backend.onrender.com/api/health`
- [ ] Database migrations run (`npx prisma db push`)
- [ ] Frontend `VITE_API_URL` set in Vercel
- [ ] Frontend redeployed with new env var
- [ ] Backend `FRONTEND_URL` set in Render
- [ ] Tested registration
- [ ] Tested login
- [ ] Tested calendar event creation
- [ ] Tested analytics page
- [ ] No CORS errors
- [ ] No console errors

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- ✅ Verify `VITE_API_URL` is correct (includes `/api`)
- ✅ Check backend is "Live" on Render
- ✅ Test backend health endpoint directly
- ✅ Check browser console for specific error

### Database errors
- ✅ Verify `DATABASE_URL` is correct in Render
- ✅ Run `npx prisma db push` via Render Shell
- ✅ Check database is running (not sleeping)

### Authentication not working
- ✅ Verify `JWT_SECRET` is set in Render
- ✅ Check backend logs for JWT errors
- ✅ Verify frontend is sending requests to correct backend URL

### CORS errors
- ✅ Verify `FRONTEND_URL` in Render matches Vercel URL exactly
- ✅ No trailing slashes
- ✅ Check browser console for specific CORS error message

---

## 🎉 You're Done!

Once all steps are complete:
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ Backend: `https://your-backend.onrender.com/api`
- ✅ Database: PostgreSQL on Render

Your ProdMax app should be fully functional in production!

---

## 📝 Next Steps (Optional)

1. **Set up custom domains** (if desired)
2. **Configure monitoring** (UptimeRobot, etc.)
3. **Set up error tracking** (Sentry, etc.)
4. **Enable database backups** (Render free tier includes 7-day backups)
5. **Set up CI/CD** (automatic deployments on git push)

---

Need help with any step? Check the logs and error messages for specific guidance!

