# Bay Ready Deployment Guide

## Overview

Bay Ready is a Progressive Web App (PWA) that can be:

1. Used directly in a browser
2. Installed as a native app on phones, tablets, and desktops
3. Used offline with cached data
4. Deployed to various hosting platforms

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- GitHub account (optional, for version control)
- Hosting account (Vercel, Netlify, or similar)

## Step 1: Build for Production

### In the Frontend Directory

```bash
# Navigate to frontend folder
cd "Bay Ready/frontend"

# Install dependencies (if not already done)
npm install

# Create production build
npm run build
```

This creates a `/dist` folder with optimized, minified code ready for deployment.

### What Gets Built

- `dist/index.html` - Main application file
- `dist/assets/` - JavaScript, CSS bundles (hashed filenames for caching)
- `dist/manifest.json` - PWA metadata (automatically copied)
- `dist/sw.js` - Service worker (automatically copied)
- Icon files (if in public folder)

### Build Output Size

Expected final size: **300-500 KB** (gzipped)

## Step 2: Choose Hosting Platform

### Recommended: Vercel (Easiest)

**Why Vercel:**

- Free tier available
- Automatic HTTPS (required for PWA)
- One-click deployment from GitHub
- Automatic builds on git push
- Global CDN for fast load times
- Serverless functions (if needed later)

**Setup:**

1. Push code to GitHub:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/bay-ready.git
   git push -u origin main
   ```

2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Select `/frontend` as the root directory
6. Click Deploy

**Vercel will automatically:**

- Build your project (`npm run build`)
- Deploy to their servers
- Set up HTTPS certificate
- Assign a free domain (e.g., `bay-ready.vercel.app`)
- Enable auto-deployment on git push

### Alternative: Netlify

**Setup:**

1. Commit to GitHub (same as Vercel)
2. Visit [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect GitHub repository
5. Set build command: `npm run build`
6. Set publish directory: `dist`
7. Deploy

### Alternative: AWS S3 + CloudFront

**Setup:**

1. Create S3 bucket for static files
2. Build locally: `npm run build`
3. Upload `/dist` contents to S3
4. Set up CloudFront CDN for HTTPS
5. Configure bucket for static website hosting

**More complex but very scalable for enterprise.**

### Alternative: Custom VPS/Server

**Setup:**

1. Build locally: `npm run build`
2. Upload `/dist` folder via FTP/SSH
3. Configure web server (Nginx/Apache) for:
   - Serving static files
   - Redirecting all requests to `index.html` (for React routing)
   - Setting proper cache headers
4. Install SSL certificate (Let's Encrypt - free)

**Example Nginx config:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/bay-ready/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|svg|woff2)$ {
        expires 1y;
        cache-control: public, immutable;
    }
}
```

## Step 3: Configure Custom Domain (Optional)

### For Vercel

1. Buy domain from GoDaddy, Namecheap, or similar
2. In Vercel project settings → Domains
3. Add your custom domain
4. Update DNS records (Vercel provides instructions)
5. Wait 5-30 minutes for DNS propagation

### For Netlify

1. Buy domain (or use external registrar)
2. In Netlify site settings → Domain settings
3. Add custom domain
4. Update DNS records if using external registrar

## Step 4: Test PWA Installation

### On Chrome/Edge Desktop

1. Open your deployed app
2. Look for **"Install app"** button in address bar
3. Click and follow prompts
4. App appears in Start menu / Applications

### On Android

1. Open app in Chrome/Edge
2. Tap menu → "Install app" (or "Add to Home Screen")
3. App installed like native app
4. No Google Play Store needed

### On iOS/iPad

1. Open app in Safari
2. Tap Share button → "Add to Home Screen"
3. App installed on home screen
4. Opens full-screen like native app

### Verify Offline Support

1. Open installed app
2. Go to DevTools → Application tab
3. Check Service Worker status: "activated and running"
4. Toggle "Offline" checkbox
5. App should still work with cached data

## Step 5: Monitor and Maintain

### Monitoring

- **Uptime**: Use UptimeRobot to monitor availability
- **Performance**: Use Lighthouse in DevTools to test
- **Analytics**: Option to add Google Analytics (only if needed)
- **Errors**: Browser console (users can report via email)

### Maintenance

After deployment, if you make changes:

1. **For Vercel/Netlify**: Just push to GitHub

   ```bash
   git add .
   git commit -m "Fix: description"
   git push
   ```

   Site auto-rebuilds and deploys within minutes

2. **For custom server**: Rebuild and upload
   ```bash
   npm run build
   # Upload /dist contents via FTP/SCP
   ```

## Step 6: Create Terms & Privacy Pages (Optional)

Create visible pages for legal compliance:

### `/src/pages/PrivacyPolicy.jsx`

```jsx
export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      {/* Content from PRIVACY_POLICY.md */}
    </div>
  );
}
```

### Add to App.jsx routing

```jsx
import PrivacyPolicy from './pages/PrivacyPolicy';

// In your router
<Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsOfService />} />
```

Add footer links in App.jsx:

```jsx
<footer className="text-center text-sm text-gray-500 mt-8">
  <a href="/privacy" className="hover:underline mr-4">
    Privacy
  </a>
  <a href="/terms" className="hover:underline">
    Terms
  </a>
</footer>
```

## Step 7: App Store Distribution (Optional)

### Google Play Store

1. Create Google Play Developer account ($25 one-time fee)
2. Prepare assets: Screenshots, descriptions, 512x512 icon
3. Generate APK/AAB from your PWA using:
   - [PWABuilder](https://www.pwabuilder.com/) (easiest)
   - Capacitor (more advanced)
4. Upload to Google Play Console
5. Wait for approval (usually 1-2 hours)

### Apple App Store

1. Enroll in Apple Developer Program ($99/year)
2. Mac with Xcode required
3. Convert PWA to native app using:
   - [PWABuilder](https://www.pwabuilder.com/)
   - Capacitor
4. Submit via App Store Connect
5. Wait for Apple review (1-3 days)

### Alternative: Stay Web-Only

PWA on home screen is just as convenient as app store for most users:

- ✅ Installs like native app
- ✅ Works offline
- ✅ Opens full-screen
- ✅ No app store fees or review process
- ❌ Slightly different from "official" app store

## Troubleshooting

### App Won't Install

**Problem**: "Install app" button not appearing

- **Check**: Site must be HTTPS (Vercel/Netlify handle this)
- **Check**: `manifest.json` is served correctly
- **Fix**: Hard refresh browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)

### Service Worker Not Updating

**Problem**: Old cached version still showing

- **Check**: Browser DevTools → Application → Service Workers
- **Fix**: Uninstall app, clear cache, reinstall
- **Or**: Users manually: DevTools → Clear site data

### Voice Recognition Not Working

**Problem**: Microphone button does nothing

- **Check**: Browser microphone permissions
- **Fix**: Reset permissions in browser settings
- **Note**: Works offline (uses device speech recognition)

### Data Not Syncing

**Problem**: Changes don't save on one device

- **Expected**: App saves to local device only (no cloud sync)
- **Solution**: Design adds cloud sync features if needed

## Performance Optimization

### Lighthouse Scores (Goal: 90+)

Current optimizations:

- Minified bundles via Vite
- Code splitting for routes
- Service worker caching strategy
- SVG icons (smallest size)
- Lazy loading for images

**Run Lighthouse test:**

```
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click "Analyze page load"
4. Check all scores
```

### Caching Strategy (Service Worker)

- **HTML**: Network first (fresh content)
- **Assets (.js, .css)**: Cache first (fast load)
- **Icons**: Cache first (static content)

Updates deploy via version bumps in manifest.

## Security Checklist

- ✅ HTTPS enforced
- ✅ No external API calls with sensitive data
- ✅ localStorage used for data (local only)
- ✅ No tracking/analytics by default
- ✅ CORS headers configured
- ✅ CSP (Content Security Policy) ready

## Deployment Checklist

Before going live:

- [ ] Built production version (`npm run build`)
- [ ] All routes working (test in `/dist`)
- [ ] Offline mode tested
- [ ] Mobile responsive verified
- [ ] PWA installs correctly
- [ ] Manifest.json loads
- [ ] Service worker active
- [ ] No console errors
- [ ] All features work (voice, data save, etc.)
- [ ] Terms & Privacy pages created
- [ ] Domain configured (if custom)
- [ ] Monitoring set up
- [ ] Backup/disaster recovery plan

## Quick Start Deployment (Vercel - 5 Minutes)

```bash
# 1. Build
npm run build

# 2. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 3. Visit vercel.com, connect GitHub repo
# 4. Done! App is live with automatic updates
```

## Support & Maintenance

- Monitor uptime: UptimeRobot
- Check logs: Vercel/Netlify dashboard
- Update dependencies: `npm update` (monthly)
- Fix issues: Deploy new version via git push
- User support: Email or GitHub issues

---

**Estimated Time to Deploy: 30-60 minutes** (first time)
**Future Deployments: 5 minutes** (just push to GitHub)

For questions or issues, check browser console (F12 → Console tab) for error messages.
