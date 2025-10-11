# 🚀 Vercel Deployment Guide - Project STO PWA

## Quick Deploy (5 menit)

### Prerequisites
- Git repository (GitHub/GitLab/Bitbucket)
- Vercel account (gratis)
- Node.js 18+ di local

---

## Step 1: Install Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

---

## Step 2: Prepare Environment Variables

Buat file `.env.local` untuk production:

```env
# Database (gunakan PlanetScale atau Supabase gratis)
DATABASE_URL="your_production_database_url"

# App Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# PWA Configuration
NEXT_PUBLIC_PWA_ENABLED="true"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="your_google_analytics_id"
```

---

## Step 3: Deploy Command

```bash
# One-command deployment
vercel --prod

# Follow the prompts:
# ? Set up and deploy "~/STO"? [Y/n] → Y
# ? Which scope do you want to deploy to? → Your account
# ? Link to existing project? [y/N] → N
# ? What's your project's name? → fuji-seat-sto
# ? In which directory is your code located? → ./
# ✅ Deployed to https://fuji-seat-sto.vercel.app
```

---

## Step 4: Configure Custom Domain (Optional)

```bash
# Add custom domain
vercel domains add sto.yourcompany.com

# Configure DNS
# Add CNAME record: sto.yourcompany.com → cname.vercel-dns.com
```

---

## Production URLs

- **Main App**: https://fuji-seat-sto.vercel.app
- **PWA Direct**: https://fuji-seat-sto.vercel.app/index.html  
- **Dashboard**: https://fuji-seat-sto.vercel.app (Next.js)

---

## Environment Setup

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add production variables

---

## Monitoring & Analytics

- **Vercel Analytics**: Automatic (free)
- **Performance**: Built-in monitoring
- **Logs**: Real-time in dashboard
- **Speed Insights**: Automatic optimization

---

**Total deployment time: ~5 minutes** 🚀