# 🚀 Deployment Guide - Project STO PWA

## ✅ QUICK DEPLOY - VERCEL (Recommended)

### Step 1: Persiapan
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Update environment variables
cp .env.example .env.local
# Edit .env.local dengan production values

# 3. Build test
npm run build
```

### Step 2: Deploy
```bash
# Login ke Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: fuji-seat-sto
# - Directory: ./
# - Framework: Next.js
```

### Step 3: Environment Setup
1. Go to Vercel Dashboard
2. Add Environment Variables:
   ```
   DATABASE_URL=your_database_url
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

---

## 🌐 STATIC PWA DEPLOY - NETLIFY

### Step 1: Build Static Version
```bash
# Create static build
npm run build
npm run export

# Or create custom build for PWA
mkdir dist
cp -r public/* dist/
```

### Step 2: Deploy to Netlify
1. Go to https://app.netlify.com
2. Drag & drop `dist` folder
3. Or connect GitHub:
   - New site from Git
   - Choose repository
   - Build command: `npm run build && npm run export`
   - Publish directory: `dist`

### Step 3: PWA Configuration
Add `_headers` file in `dist/`:
```
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/manifest.json
  Content-Type: application/manifest+json

/sw.js
  Cache-Control: no-cache
```

---

## 📱 GITHUB PAGES DEPLOY

### Step 1: Repository Setup
```bash
# Push code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: GitHub Pages Setup
1. Go to repository Settings
2. Pages section
3. Source: Deploy from branch
4. Branch: main
5. Folder: / (root) or /docs

### Step 3: Build Action (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy PWA
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm install
    - run: npm run build
    - run: npm run export
    - uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

---

## 🔥 FIREBASE HOSTING DEPLOY

### Step 1: Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting
```

### Step 2: Configuration
`firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

### Step 3: Deploy
```bash
# Build
npm run build
npm run export

# Deploy
firebase deploy
```

---

## ⚡ PRODUCTION CHECKLIST

### Before Deploy:
- [ ] Update environment variables
- [ ] Test build locally: `npm run build`
- [ ] Check PWA manifest.json
- [ ] Verify service worker registration
- [ ] Test offline functionality
- [ ] Optimize images and assets
- [ ] Update meta tags and SEO

### After Deploy:
- [ ] Test PWA installation
- [ ] Check lighthouse scores
- [ ] Verify HTTPS certificate
- [ ] Test on mobile devices
- [ ] Monitor performance
- [ ] Setup analytics (optional)

---

## 🔧 ENVIRONMENT VARIABLES

### Production Environment (.env.production)
```env
# Database
DATABASE_URL="your_production_database_url"

# Auth (if using)
NEXTAUTH_SECRET="your_production_secret"
NEXTAUTH_URL="https://your-domain.com"

# App Config
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# PWA Config
NEXT_PUBLIC_PWA_ENABLED="true"
```

---

## 📊 MONITORING & ANALYTICS

### Free Analytics Options:
1. **Google Analytics 4**: Free, comprehensive
2. **Vercel Analytics**: Built-in for Vercel
3. **Netlify Analytics**: Basic metrics
4. **Plausible**: Privacy-focused (paid)

### Performance Monitoring:
1. **Lighthouse CI**: Automated testing
2. **Web Vitals**: Core web vitals tracking
3. **Sentry**: Error monitoring (free tier)

---

## 🚨 TROUBLESHOOTING

### Common Issues:

**PWA Not Installing:**
- Check manifest.json validity
- Ensure HTTPS in production
- Verify service worker registration

**Assets Not Loading:**
- Check public folder structure
- Verify CORS headers
- Check CDN links

**Build Failures:**
- Check TypeScript errors
- Verify all dependencies
- Check environment variables

**Database Connection:**
- Update DATABASE_URL
- Check network accessibility
- Verify credentials

---

## 🎯 RECOMMENDED SETUP

**For PT Fuji Seat Indonesia:**

1. **Primary**: Vercel (Main app)
2. **Backup**: Netlify (Static PWA)
3. **Database**: PlanetScale (Free MySQL)
4. **Analytics**: Google Analytics 4
5. **Monitoring**: Sentry (Free tier)
6. **Domain**: Custom domain (.id or .com)

**Total Cost: $0/month** (within free limits)

---

**Project STO PWA siap deploy ke production! 🚀**