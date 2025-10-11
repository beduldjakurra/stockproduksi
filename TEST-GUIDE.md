## 🔥 STEP-BY-STEP TEST SUPABASE INTEGRATION

### 📋 **Current Status:**
✅ Environment template created (.env.local)
✅ Database schema ready (supabase-schema.sql)
✅ Supabase packages installed
✅ Authentication system configured

---

### 🚀 **LANGKAH 1: Setup Supabase Project**

#### **A. Create Supabase Account & Project:**
1. **Buka**: https://supabase.com/dashboard
2. **Sign up** dengan GitHub account
3. **Create New Project:**
   ```
   Organization: [Your GitHub username]
   Project name: fuji-seat-sto
   Database password: [Generate & SAVE ini!]
   Region: Southeast Asia (Singapore)
   ```
4. **Wait** ~2 menit untuk project setup

#### **B. Get API Credentials:**
1. Masuk ke **Settings > API**
2. Copy informasi ini:
   ```
   Project URL: https://[project-ref].supabase.co
   anon public: eyJ... (long key)
   service_role: eyJ... (long key - keep secret!)
   ```

---

### 🗄️ **LANGKAH 2: Setup Database Schema**

#### **C. Run Database Schema:**
1. Masuk ke **SQL Editor** di Supabase Dashboard
2. Create **New Query**
3. Copy paste **SELURUH ISI** file `supabase-schema.sql`
4. Click **"Run"** untuk execute
5. **Verify**: Masuk ke **Table Editor**, pastikan ada 3 tables:
   - `production_sessions`
   - `production_data` 
   - `user_settings`

---

### 🔐 **LANGKAH 3: Configure Authentication**

#### **D. Enable Auth Settings:**
1. Masuk ke **Authentication > Settings**
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**: `http://localhost:3000/auth/callback`
4. **Email Auth**: ✅ Enabled
5. **Save Configuration**

---

### 💻 **LANGKAH 4: Update Environment Variables**

#### **E. Edit .env.local (sudah dibuka di Notepad):**
Replace values berikut dengan credentials dari Supabase:

```env
# REPLACE THESE VALUES:
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# KEEP THESE AS IS:
NODE_ENV="development"
NEXTAUTH_SECRET="fuji-seat-development-secret-2025"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_PWA_ENABLED="true"
NEXT_PUBLIC_PWA_NAME="PT Fuji Seat Indonesia - STO"
NEXT_PUBLIC_PWA_SHORT_NAME="Fuji STO"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="file:./db/custom.db"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

**Save file** setelah update!

---

### 🧪 **LANGKAH 5: Test Integration**

#### **F. Run Test Commands:**
```powershell
# 1. Build check
npm run build

# 2. Start development server
npm run dev
```

#### **G. Test URLs:**
- **Main App**: http://localhost:3000
- **Supabase App**: http://localhost:3000/supabase
- **Health Check**: http://localhost:3000/api/health

#### **H. Test Authentication Flow:**
1. **Navigate** ke http://localhost:3000/supabase
2. **Sign Up** dengan email baru:
   ```
   Email: test@fujiseat.com
   Password: FujiSeat2025!
   Name: Test User
   ```
3. **Check inbox** untuk confirmation email
4. **Login** after confirmation
5. **Test data input** pada semua 3 tabs

---

### 🔍 **LANGKAH 6: Verify Integration**

#### **I. Check Database:**
1. **Supabase Dashboard** > **Table Editor**
2. **Check tables** ada data:
   - `production_sessions`: Harus ada 1 session
   - `production_data`: Harus ada 48 records (16 KODE_INJECT x 3 tabs)
   - `user_settings`: Harus ada 1 user setting

#### **J. Test Real-time Sync:**
1. **Open 2 browser tabs** ke http://localhost:3000/supabase
2. **Login sama user** di kedua tabs
3. **Input data** di tab pertama (Stock Produksi)
4. **Verify sync** di tab kedua (should update real-time)

---

## 🎯 **SUCCESS CRITERIA:**

✅ **Build successful** tanpa errors
✅ **Authentication working** (sign up/login)
✅ **Database connected** (data masuk ke Supabase)
✅ **Real-time sync** (changes sync between tabs)
✅ **All 3 tabs working** (Stock, Box, Kekuatan)
✅ **PWA features** tetap berfungsi

---

## 🚨 **Troubleshooting:**

### **Common Issues:**
- **"Invalid API key"** → Check .env.local credentials
- **"RLS policy violation"** → Re-run supabase-schema.sql
- **"Build failed"** → Check TypeScript imports
- **"Schema not found"** → Verify database setup

### **Quick Fixes:**
```powershell
# Reset everything
rm .env.local
copy .env.local.template .env.local
# Re-edit .env.local dengan correct credentials

# Force rebuild
rm -rf .next
npm run build
npm run dev
```

---

**🎉 Ready untuk test? Lanjutkan dengan setup Supabase project dan update .env.local!**