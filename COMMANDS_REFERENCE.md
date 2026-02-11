# 🏃 Bay Ready - Quick Start Scripts

## Commands Reference

Quick reference for common tasks:

---

## 📁 Setup & Installation

### First Time Setup

```bash
cd "Bay Ready/frontend"
npm install
```

Installs all dependencies (React, Vite, Tailwind, etc.)

### Reinstall Dependencies

```bash
rm -r node_modules package-lock.json
npm install
```

Fresh install if dependencies are corrupted.

---

## 💻 Development

### Start Development Server

```bash
cd "Bay Ready/frontend"
npm run dev
```

- Starts local server at `http://localhost:5173`
- Hot reload (changes refresh automatically)
- Best for development/testing

### Development Features

- ⚡ Lightning-fast hot module reload
- 🐛 Source maps for debugging
- 📱 View on mobile (shows IP address)
- 🔄 Auto-refresh on save

### Stop Development Server

```
Press Ctrl+C in terminal
```

---

## 🔨 Building for Production

### Create Production Build

```bash
cd "Bay Ready/frontend"
npm run build
```

- Creates `/dist` folder (optimized code)
- Minifies JavaScript & CSS
- Tree-shakes unused code
- Output size: ~300-350KB gzipped

### Preview Production Build Locally

```bash
npm run preview
```

- Starts server serving `/dist` folder
- Shows `http://localhost:4173`
- Tests real production performance
- Close with Ctrl+C

### Build + Preview (One Command)

```bash
npm run build && npm run preview
```

Build and immediately preview the result.

---

## 🌐 Deployment

### Deploy to Vercel

```bash
# 1. Ensure code is in GitHub
git add .
git commit -m "Ready to deploy"
git push

# 2. Go to vercel.com and connect repo
# No command needed - Vercel auto-builds!
```

### Deploy to Netlify

```bash
# 1. Push to GitHub (same as Vercel)
git add .
git commit -m "Ready to deploy"
git push

# 2. Go to netlify.com and connect repo
# Auto-builds and deploys on git push
```

---

## 📦 Dependency Management

### Check for Updates

```bash
npm outdated
```

Shows which packages have newer versions available.

### Update All Packages

```bash
npm update
```

Updates all packages to latest minor versions.

### Update Specific Package

```bash
npm install package-name@latest
```

Example: `npm install react@latest`

### Check Security Issues

```bash
npm audit
```

Checks for security vulnerabilities.

### Fix Security Issues

```bash
npm audit fix
```

Automatically fixes vulnerabilities.

---

## 🔍 Debugging

### View Console Output

```bash
# In development
npm run dev
# Then open DevTools: F12 → Console tab
```

### Check Build Errors

```bash
npm run build
# Errors display in terminal
```

### Analyze Build Size

```bash
npm run build
# Terminal shows bundle size breakdown
```

---

## 🧹 Cleanup

### Delete Build Folder

```bash
rm -r dist
```

Removes the `/dist` production build folder.

### Delete Node Modules

```bash
rm -r node_modules
```

Removes all installed dependencies (can reinstall with `npm install`).

### Clean Everything

```bash
rm -r dist node_modules package-lock.json
npm install
npm run build
```

Complete clean rebuild.

---

## 📊 Project Structure

```
Bay Ready/frontend/
├── src/
│   ├── App.jsx          # Main app
│   ├── AppContext.jsx   # Global state
│   ├── main.jsx         # Entry point
│   ├── pages/           # Page components
│   └── components/      # Reusable components
├── public/
│   ├── manifest.json    # PWA config
│   ├── sw.js            # Service worker
│   └── icons/           # App icons
├── index.html           # Main HTML file
├── vite.config.js       # Build config
├── package.json         # Dependencies
├── tailwind.config.js   # CSS framework
└── postcss.config.js    # CSS processing
```

---

## 📋 Common Workflows

### Workflow 1: Quick Test

```bash
cd "Bay Ready/frontend"
npm run dev
# Open http://localhost:5173 in browser
# Make changes, auto-refreshes
# Press Ctrl+C to stop
```

### Workflow 2: Build & Test Locally

```bash
cd "Bay Ready/frontend"
npm run build
npm run preview
# Open http://localhost:4173
# Test production version
# Press Ctrl+C to stop
```

### Workflow 3: Deploy

```bash
cd "Bay Ready/frontend"
npm run build
# Test with npm run preview

# Then in main Bay Ready folder:
git add .
git commit -m "Production build ready"
git push

# Go to vercel.com and deploy
```

### Workflow 4: Update & Redeploy

```bash
# Make code changes
# Test: npm run dev

# Then deploy:
git add .
git commit -m "Update: description"
git push

# Vercel auto-rebuilds and deploys!
```

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Error: Port 5173 already in use
npm run dev -- --port 3000
# Runs on port 3000 instead
```

### Dependencies Not Found

```bash
npm install
# Reinstall all dependencies
```

### Build Fails

```bash
# Check for errors:
npm run build

# Delete and rebuild:
rm -r node_modules dist
npm install
npm run build
```

### Module Not Found

```bash
# Clear cache and rebuild:
npm cache clean --force
npm install
npm run build
```

### Cannot Find Module 'react'

```bash
# Reinstall:
npm install
# Then: npm run dev
```

---

## 🚀 Deployment Commands (Complete Workflow)

### Full Deployment Workflow

```bash
# 1. Navigate to frontend
cd "Bay Ready/frontend"

# 2. Install dependencies (if first time)
npm install

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
# Test it, then Ctrl+C

# 5. Commit and push
git add .
git commit -m "Production ready v1.0"
git push

# 6. Deploy via Vercel (go to vercel.com)
# OR deploy via Netlify (go to netlify.com)
```

---

## 📈 Performance Commands

### Check Bundle Size

```bash
npm run build
# Shows bundle size in terminal
```

### Test Performance

```bash
npm run build
npm run preview
# Open DevTools → Lighthouse → Analyze
```

### View Production Bundle

```bash
npm run preview
# Open http://localhost:4173
# Open DevTools → Network tab
# Shows all loaded assets and sizes
```

---

## 🔐 Security Commands

### Check Vulnerabilities

```bash
npm audit
# Lists security issues
```

### Auto-Fix Vulnerabilities

```bash
npm audit fix
# Automatically fixes issues
```

### Check Outdated Packages

```bash
npm outdated
# Shows packages that need updates
```

---

## 📚 Getting Help

### View Available Scripts

```bash
npm run
```

Lists all available npm scripts in package.json.

### View Vite Help

```bash
npx vite --help
```

Shows Vite CLI options.

### Check Node Version

```bash
node --version
npm --version
```

Verify you have Node.js 18+ installed.

---

## 🎯 Quick Command Reference

| Goal                    | Command           | Time    |
| ----------------------- | ----------------- | ------- |
| Start development       | `npm run dev`     | 10s     |
| Build for production    | `npm run build`   | 30s     |
| Test production build   | `npm run preview` | 10s     |
| Install dependencies    | `npm install`     | 1-2 min |
| Check for issues        | `npm audit`       | 5s      |
| Update packages         | `npm update`      | 1 min   |
| View available commands | `npm run`         | instant |

---

## 💡 Pro Tips

### Quick Build & Test

```bash
npm run build && npm run preview
```

Builds and immediately tests production.

### Auto-Fix Common Issues

```bash
npm audit fix && npm install
```

Fixes vulnerabilities and installs.

### Watch Mode for Development

```bash
npm run dev
```

Automatically reloads on file changes.

### Development on Different Port

```bash
npm run dev -- --port 5000
```

Useful if 5173 is already taken.

---

## 🚀 Deployment Shortcut

**Fastest deployment path:**

```bash
# 1. Build
npm run build

# 2. Test
npm run preview

# 3. Deploy (push to GitHub)
git add .
git commit -m "Production ready"
git push

# 4. Vercel auto-deploys! No command needed.
```

---

## 📞 Support

- **Development issues?** → Check terminal output for errors
- **Build fails?** → Run `npm audit fix && npm install`
- **Port in use?** → Use `npm run dev -- --port 3000`
- **Module errors?** → Run `npm install`
- **Deployment?** → Follow DEPLOYMENT_GUIDE.md

---

## ✨ Summary

**Key Commands:**

```bash
npm install       # Install dependencies
npm run dev       # Start development
npm run build     # Build for production
npm run preview   # Test production build
npm audit fix     # Fix security issues
```

**Deployment:**

```bash
npm run build     # Build
git push          # Push to GitHub
# Vercel auto-deploys!
```

---

**Bay Ready - Ready to Deploy** 🚀

_Last Updated: February 5, 2026_
