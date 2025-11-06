# Fix: Repository Not Found Error

## Solution Steps

### Step 1: Verify Repository Exists on GitHub

1. Go to: https://github.com/OSpiers7/ProdMax
2. If you see a 404 error, the repository doesn't exist yet

### Step 2: Create the Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `ProdMax` (exact match, case-sensitive)
3. Description: "Productivity scheduling app"
4. Choose Public or Private
5. **DO NOT** check "Initialize with README"
6. **DO NOT** add .gitignore or license
7. Click **"Create repository"**

### Step 3: Verify Remote URL is Correct

After creating the repo, verify your remote URL matches exactly:

```powershell
# Check current remote
git remote -v

# Should show:
# origin  https://github.com/OSpiers7/ProdMax.git (fetch)
# origin  https://github.com/OSpiers7/ProdMax.git (push)
```

If it's wrong, fix it:
```powershell
# Remove incorrect remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/OSpiers7/ProdMax.git
```

### Step 4: Try Pushing Again

```powershell
git push -u origin main
```

### Step 5: If Still Getting Errors - Authentication Issues

If you see authentication errors:

**Option A: Use Personal Access Token**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Copy the token
4. When pushing, use the token as your password

**Option B: Use SSH Instead**
```powershell
# Change remote to SSH
git remote set-url origin git@github.com:OSpiers7/ProdMax.git

# Then push
git push -u origin main
```

### Step 6: Alternative - Push to a Different Branch

Sometimes the default branch might be `master` instead of `main`:

```powershell
# Check what branch you're on
git branch

# If on master, push to master
git push -u origin master

# Or rename your branch to main
git branch -M main
git push -u origin main
```

### Common Issues:

1. **Repository name mismatch**: Must be exactly `ProdMax` (case-sensitive)
2. **Repository doesn't exist**: Create it on GitHub first
3. **Wrong permissions**: Make sure you're logged into the correct GitHub account
4. **Authentication expired**: Generate a new Personal Access Token


