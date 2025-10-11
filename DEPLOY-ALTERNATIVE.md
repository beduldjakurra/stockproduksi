# 🚀 Deploy STO ke Vercel - Cara Mudah (Tanpa CLI)

## Metode 1: GitHub + Vercel Dashboard (5 menit)

### Step 1: Upload ke GitHub

1. **Buat Repository GitHub**:
   - Buka https://github.com
   - Klik "New Repository"
   - Nama: `fuji-seat-sto`
   - Set sebagai Public/Private
   - Jangan centang "Initialize with README"

2. **Upload Project**:
   ```bash
   # Di terminal STO folder
   git init
   git add .
   git commit -m "Initial commit - PT Fuji Seat Indonesia STO PWA"
   git branch -M main
   git remote add origin https://github.com/USERNAME/fuji-seat-sto.git
   git push -u origin main
   ```

### Step 2: Connect ke Vercel

1. **Login ke Vercel Dashboard**:
   - Buka https://vercel.com
   - Login dengan GitHub account

2. **Import Project**:
   - Klik "Add New..." → "Project"
   - Pilih repository "fuji-seat-sto"
   - Klik "Import"

3. **Configure Deployment**:
   - Project Name: `fuji-seat-sto`
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Deploy**:
   - Klik "Deploy"
   - Wait 2-3 menit ⏳
   - ✅ Done!

---

## Metode 2: ZIP Upload ke Netlify (Manual)

### Step 1: Prepare Build

```bash
npm run build
```

### Step 2: Upload ke Netlify

1. Buka https://netlify.com
2. Drag & drop folder project ke dashboard
3. Configure PWA settings
4. Deploy!

---

## Metode 3: Railway (Database Included)

1. Buka https://railway.app
2. "Deploy from GitHub"
3. Connect repository
4. Auto-deploy dengan database PostgreSQL gratis!

---

## 🎯 URL Hasil Deploy

Setelah deploy berhasil:

- **Vercel**: `https://fuji-seat-sto.vercel.app`
- **Netlify**: `https://amazing-name-123456.netlify.app`
- **Railway**: `https://fuji-seat-sto.up.railway.app`

## 🔧 Environment Variables

Tambahkan di dashboard hosting:

```env
DATABASE_URL=your_database_connection_string
NODE_ENV=production
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-deployed-url.com
NEXT_PUBLIC_PWA_ENABLED=true
```

---

**Pilih metode mana yang Anda inginkan?** 🚀