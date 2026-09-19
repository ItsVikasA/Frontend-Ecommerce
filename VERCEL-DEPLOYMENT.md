# Vercel Deployment Guide

Your frontend is now on GitHub! Follow these steps to deploy on Vercel.

**Repository**: https://github.com/ItsVikasA/Frontend-Ecommerce.git

---

## Step 1: Go to Vercel

1. Open https://vercel.com
2. Click **"Sign Up"** (if you don't have an account)
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

---

## Step 2: Import Your Project

1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories
3. Find **"Frontend-Ecommerce"** repository
4. Click **"Import"** button next to it

---

## Step 3: Configure Project

Vercel will auto-detect Vite. Verify these settings:

### Framework Preset
- **Framework**: Vite (auto-detected)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `dist` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

### Environment Variables

Click **"Environment Variables"** section and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `http://localhost:8081` (temporary - update after backend deploy) |

**Note**: You'll update this with your actual backend URL after deploying the backend to Render.

---

## Step 4: Deploy

1. Review all settings
2. Click **"Deploy"** button
3. Wait 2-3 minutes for build to complete
4. Watch the build logs (optional)

---

## Step 5: Success!

After deployment completes:

1. You'll see **"Congratulations!"** message
2. Click **"Continue to Dashboard"**
3. Your app URL will be: `https://frontend-ecommerce-xxxx.vercel.app`
4. Click **"Visit"** to see your live app

---

## Step 6: Update Backend URL (After Backend Deployment)

Once you deploy your backend to Render:

1. Go to Vercel dashboard
2. Select your project **"Frontend-Ecommerce"**
3. Go to **"Settings"** tab
4. Click **"Environment Variables"** (left sidebar)
5. Find `VITE_API_URL`
6. Click **"Edit"**
7. Change value to: `https://your-backend-name.onrender.com`
8. Click **"Save"**
9. Go to **"Deployments"** tab
10. Click **"..."** menu on latest deployment
11. Click **"Redeploy"**
12. Click **"Redeploy"** button to confirm

---

## Testing Your Deployment

### Before Backend is Deployed
Your app will load, but API calls will fail with:
- "Network Error"
- "Failed to fetch"

This is normal! The backend isn't deployed yet.

### After Backend is Deployed
1. Visit your Vercel URL
2. Click "Sign up"
3. Create an account
4. Login
5. Everything should work perfectly!

---

## Custom Domain (Optional)

To use your own domain:

1. Vercel Dashboard → Your Project
2. Go to **"Settings"** tab
3. Click **"Domains"** (left sidebar)
4. Click **"Add"** button
5. Enter your domain (e.g., `myapp.com`)
6. Follow DNS configuration instructions
7. Wait for DNS propagation (5-60 minutes)

---

## Automatic Deployments

Every time you push to GitHub:
- Vercel automatically builds and deploys
- New commit = new deployment
- No manual work needed!

To push updates:
```powershell
cd "g:\New folder\frontend"
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically deploy in ~2 minutes!

---

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | `https://auth-backend.onrender.com` |

### Why VITE_API_URL?
- Used by `src/config/api.js`
- Points frontend to backend API
- Changes based on environment (dev/prod)

---

## Vercel Features You Get

- ✅ **HTTPS** - Automatic SSL certificate
- ✅ **CDN** - Global content delivery
- ✅ **Auto Deployments** - Push to GitHub = Auto deploy
- ✅ **Preview Deployments** - Every PR gets preview URL
- ✅ **Analytics** - Page views and performance metrics
- ✅ **100GB Bandwidth** - Free tier

---

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to **"Deployments"** tab
2. Click on failed deployment
3. Read error messages

**Common issues:**
- Missing dependencies → Add to `package.json`
- Node version mismatch → Set in project settings
- Environment variable missing → Add in settings

### App Loads But API Fails

**Symptoms:**
- White screen or errors
- "Network Error" in console

**Solutions:**
1. Check `VITE_API_URL` is set correctly
2. Verify backend is deployed and running
3. Check CORS settings on backend
4. Inspect browser console (F12) for errors

### CORS Errors

**Error in console:**
```
Access to fetch at 'https://backend.onrender.com' from origin 'https://frontend-ecommerce.vercel.app' has been blocked by CORS
```

**Solution:**
Update backend `CORS_ORIGINS` environment variable on Render to include:
```
https://frontend-ecommerce-xxxx.vercel.app
```

---

## Performance Tips

### Optimize Build
Already configured:
- Vite for fast builds
- Tree shaking enabled
- Code splitting automatic
- Assets minified

### Check Performance
1. Vercel Dashboard → Analytics
2. View page load times
3. Check Lighthouse score
4. Monitor bandwidth usage

---

## Branch Deployments

### Production Branch (main)
- Deploys to main domain
- Automatic on push

### Preview Branches
- Create new branch:
  ```powershell
  git checkout -b feature-name
  git push origin feature-name
  ```
- Gets unique preview URL
- Perfect for testing before merging

---

## Vercel CLI (Optional)

Install Vercel CLI for advanced features:

```powershell
npm install -g vercel

# Deploy from terminal
cd "g:\New folder\frontend"
vercel

# Deploy to production
vercel --prod
```

---

## Your Deployment Info

Fill this in after deployment:

**Vercel Project**: Frontend-Ecommerce  
**Production URL**: `https://__________________.vercel.app`  
**GitHub Repo**: https://github.com/ItsVikasA/Frontend-Ecommerce.git  
**Deployed on**: __________________  

---

## Next Steps

1. ✅ Code pushed to GitHub
2. ✅ Project imported to Vercel
3. ✅ Deployed successfully
4. ⏳ Deploy backend to Render (next step)
5. ⏳ Update `VITE_API_URL` environment variable
6. ⏳ Test full app with real API

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Your Frontend**: https://github.com/ItsVikasA/Frontend-Ecommerce.git

---

**Your frontend is live on GitHub!** 🎉

Now deploy it to Vercel following the steps above!
