# 🎯 SUPABASE SETUP CHECKLIST - PT Fuji Seat Indonesia

## ✅ Phase 1: Create Supabase Project (5 menit)

### 1. Create Account
- [ ] Buka https://supabase.com
- [ ] Sign up dengan GitHub account  
- [ ] Verify email jika diminta

### 2. Create Project
- [ ] Klik "New Project"
- [ ] Organization: [Your GitHub username]
- [ ] Project name: `fuji-seat-sto`
- [ ] Database password: [Generate & SIMPAN password ini!]
- [ ] Region: `Southeast Asia (Singapore)`
- [ ] Klik "Create new project"
- [ ] Tunggu ~2 menit sampai setup selesai

---

## ✅ Phase 2: Setup Database (5 menit)

### 3. Get API Credentials
- [ ] Masuk ke **Settings > API**
- [ ] Copy **Project URL** 
- [ ] Copy **anon public** key
- [ ] Copy **service_role** key (keep secret!)

### 4. Create Database Schema  
- [ ] Masuk ke **SQL Editor**
- [ ] Create new query
- [ ] Copy paste isi file `supabase-schema.sql`
- [ ] Klik **"Run"** untuk execute
- [ ] Verify tables dibuat di **Table Editor**

---

## ✅ Phase 3: Configure Authentication (2 menit)

### 5. Enable Authentication
- [ ] Masuk ke **Authentication > Settings**
- [ ] Enable **Email** authentication ✅
- [ ] Site URL: `http://localhost:3000`
- [ ] Redirect URLs: `http://localhost:3000/auth/callback`

### 6. Optional: Enable Google OAuth
- [ ] Masuk ke **Authentication > Providers**
- [ ] Enable **Google** provider
- [ ] Add Google Client ID & Secret (optional)

---

## ✅ Phase 4: Local Integration (10 menit)

### 7. Setup Environment
- [ ] Copy `.env.local.template` ke `.env.local`
- [ ] Update `NEXT_PUBLIC_SUPABASE_URL` dengan Project URL
- [ ] Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan anon key  
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` dengan service role key
- [ ] Save file

### 8. Test Integration
- [ ] Run `npm install` (sudah dilakukan)
- [ ] Run `npm run build` untuk check errors
- [ ] Run `npm run dev` 
- [ ] Buka http://localhost:3000/supabase
- [ ] Test sign up dengan email
- [ ] Test login flow
- [ ] Test production data input

---

## ✅ Phase 5: Verification (5 menit)

### 9. Test Real-time Features
- [ ] Login dengan 1 user
- [ ] Input data di Stock Produksi
- [ ] Buka tab browser kedua (same URL)
- [ ] Login dengan user lain
- [ ] Verify data sync real-time

### 10. Check Database
- [ ] Masuk ke Supabase **Table Editor**
- [ ] Check `production_sessions` table ada data
- [ ] Check `production_data` table ada records
- [ ] Verify RLS policies working (user isolation)

---

## 🎉 Success Criteria

✅ **Authentication working**: Sign up/login successful
✅ **Database connected**: Data tersimpan di Supabase
✅ **Real-time sync**: Changes sync between users  
✅ **Tables created**: All production tables exist
✅ **RLS working**: User data isolation proper
✅ **PWA compatible**: App works as Progressive Web App

---

## 🔧 Troubleshooting

### Common Issues:
1. **"Invalid API key"** → Check .env.local credentials
2. **"Schema not found"** → Re-run supabase-schema.sql
3. **"RLS policy violation"** → Check user authentication
4. **"Build errors"** → Check TypeScript types

### Support:
- Supabase docs: https://supabase.com/docs
- STO project docs: README.md
- Discord support: Available 24/7

---

**Estimated Total Time: 25-30 minutes** ⏱️

**Ready untuk production setelah semua checklist ✅**