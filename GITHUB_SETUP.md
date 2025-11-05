# GitHub Repository Setup Guide

Follow these steps to create a GitHub repository and push your ProdMax project.

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `ProdMax` (or your preferred name)
   - **Description**: "Productivity scheduling app based on the 90-minute rule"
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize with README" (we already have one)
   - **DO NOT** add .gitignore or license (we already have them)
5. Click **"Create repository"**

## Step 2: Initialize Git (if not already done)

Open PowerShell or your terminal in the `ProdMax` directory and run:

```powershell
# Check if git is already initialized
git status

# If you get an error, initialize git
git init
```

## Step 3: Add All Files to Git

```powershell
# Add all files to staging
git add .

# Check what will be committed (optional)
git status
```

## Step 4: Create Your First Commit

```powershell
git commit -m "Initial commit: ProdMax productivity scheduling app"
```

## Step 5: Connect to GitHub Repository

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/ProdMax.git

# Verify the remote was added
git remote -v
```

## Step 6: Push to GitHub

```powershell
# Push to main branch (or master if that's your default)
git branch -M main
git push -u origin main
```

If you get an authentication error, you may need to:
- Use a Personal Access Token instead of your password
- Or use SSH: `git remote set-url origin git@github.com:YOUR_USERNAME/ProdMax.git`

## Step 7: Verify Upload

1. Go to your GitHub repository page
2. You should see all your files uploaded
3. Check that sensitive files (`.env`, `node_modules`, etc.) are NOT visible

## Troubleshooting

### Authentication Issues
If you get authentication errors, create a Personal Access Token:
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use the token as your password when pushing

### Files Not Showing
Make sure you've committed and pushed:
```powershell
git status
git add .
git commit -m "Your commit message"
git push
```

### Large Files Warning
If you see warnings about large files, make sure `node_modules/` is in `.gitignore`

## Next Steps: Vercel Deployment

After pushing to GitHub, you can deploy to Vercel:

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `ProdMax` repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.vercel.app/api`)
6. Deploy!

For the backend, you'll need to deploy it separately (Vercel, Railway, Render, etc.) and update the frontend's `VITE_API_URL` environment variable.

