# Deployment Guide - Frontend to Netlify

This guide will help you deploy the frontend to Netlify while using the existing backend.

## Prerequisites

- GitHub account
- Netlify account (free tier works fine)
- Your code pushed to a GitHub repository

## Step 1: Push Your Code to GitHub

If you haven't already pushed your code:

```bash
# Check your remote
git remote -v

# If no remote exists, add one
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code
git push -u origin main
```

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify**
   - Visit https://app.netlify.com/
   - Sign in or create an account

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub account
   - Select your repository

3. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: Will be automatically detected from `.nvmrc` (22.17.0)

4. **Add Environment Variables**
   Click "Show advanced" → "New variable" and add these (get values from your backend .env file):
   
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   VITE_USE_MOCK_DATA=false
   VITE_AGENT_BASE_URL=https://your-agent-url.com
   ```
   
   Optional variables (if you have them configured):
   ```
   VITE_DEPLOYMENT_ID=your-deployment-id
   VITE_BUILDER_PLATFORM_LOGO=your-logo-url
   VITE_BUILDER_PLATFORM_NAME=your-platform-name
   VITE_BUILDER_PLATFORM_URL=your-platform-url
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your site will be live at a URL like: `https://random-name-123456.netlify.app`

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend directory
cd frontend

# Deploy
netlify deploy --prod
```

## Step 3: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS

## Step 4: Enable Continuous Deployment

Netlify automatically sets up continuous deployment:
- Every push to your `main` branch will trigger a new deployment
- Pull requests will get preview deployments

## Step 5: Verify Deployment

1. Visit your Netlify URL
2. Test the "Ask InsightClass" feature to ensure it connects to the backend
3. Upload a CSV file to test the full functionality

## Troubleshooting

### Build Fails

**Issue**: Build fails with "command not found: npm"
- **Solution**: Make sure `.nvmrc` file exists in the frontend directory

**Issue**: Build fails with dependency errors
- **Solution**: Clear cache in Netlify dashboard → "Site settings" → "Build & deploy" → "Clear cache and retry deploy"

### Backend Connection Issues

**Issue**: Frontend can't connect to backend
- **Solution**: Verify the `VITE_API_BASE_URL` environment variable is set correctly in Netlify
- **Solution**: Check if the backend at `https://edu-insight-pro-641633-backend.withmattr.app` is accessible

### Environment Variables Not Working

**Issue**: Environment variables not being picked up
- **Solution**: Make sure all environment variables start with `VITE_` prefix
- **Solution**: Redeploy after adding/changing environment variables

## Important Notes

1. **Never commit `.env` files** - They're now in `.gitignore`
2. **Backend is separate** - This deployment only covers the frontend
3. **Environment variables** - Always set them in Netlify dashboard, never commit them
4. **Build time** - First build might take 3-5 minutes, subsequent builds are faster

## Monitoring

- **Build logs**: Available in Netlify dashboard under "Deploys"
- **Analytics**: Enable in Netlify dashboard for traffic insights
- **Error tracking**: Consider integrating Sentry or similar tools

## Rollback

If something goes wrong:
1. Go to Netlify dashboard → "Deploys"
2. Find a previous successful deployment
3. Click "Publish deploy" to rollback

## Support

- Netlify Docs: https://docs.netlify.com/
- Netlify Community: https://answers.netlify.com/
