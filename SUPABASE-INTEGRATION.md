# 🎯 Supabase Integration untuk Project STO

## ✅ Kompatibilitas Analysis

### **Project STO Structure:**
- **Framework**: Next.js 15 dengan TypeScript ✅
- **Database**: Saat ini SQLite → Migrate ke PostgreSQL ✅
- **Data Models**: Production tracking dengan 3 main tables ✅
- **Real-time**: Socket.IO → Upgrade ke Supabase Realtime ✅
- **Authentication**: Ready untuk NextAuth + Supabase ✅

### **Data yang akan di-migrate:**
1. **Stock Production Data** (stockAwal, produksi, surcip, sunter, kiic)
2. **Box Calculation Data** (actBox, actQty)
3. **Stock Strength Data** (anzenStock, fc2d, kekuatanStock)
4. **Real-time Sync** untuk multiple users

---

## 🚀 Setup Supabase Database

### **1. Database Schema untuk STO:**

```sql
-- Production Sessions Table
CREATE TABLE production_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id)
);

-- Production Data Table
CREATE TABLE production_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES production_sessions(id) ON DELETE CASCADE,
  kode_inject VARCHAR(50) NOT NULL,
  inject_index INTEGER NOT NULL,
  
  -- Stock Production Data
  stock_awal DECIMAL(10,2) DEFAULT 0,
  produksi DECIMAL(10,2) DEFAULT 0,
  surcip DECIMAL(10,2) DEFAULT 0,
  sunter DECIMAL(10,2) DEFAULT 0,
  kiic DECIMAL(10,2) DEFAULT 0,
  
  -- Box Calculation Data
  act_box TEXT, -- JSON array format: "10,20,30"
  stdrt_pack DECIMAL(10,2) DEFAULT 0,
  act_qty DECIMAL(10,2) DEFAULT 0,
  gap_value DECIMAL(10,2) DEFAULT 0,
  
  -- Stock Strength Data  
  stock_reguler DECIMAL(10,2) DEFAULT 0,
  anzen_stock DECIMAL(10,2) DEFAULT 0,
  fc2d DECIMAL(10,2) DEFAULT 0,
  kekuatan_stock DECIMAL(10,2) DEFAULT 0,
  kekuatan_anzen DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(session_id, inject_index)
);

-- User Settings Table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_night_mode BOOLEAN DEFAULT FALSE,
  current_view VARCHAR(20) DEFAULT 'main',
  last_session_id UUID REFERENCES production_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE production_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own sessions" ON production_sessions
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create own sessions" ON production_sessions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own sessions" ON production_sessions
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view production data" ON production_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM production_sessions 
      WHERE id = production_data.session_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage production data" ON production_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM production_sessions 
      WHERE id = production_data.session_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_production_data_session_id ON production_data(session_id);
CREATE INDEX idx_production_data_inject_index ON production_data(inject_index);
CREATE INDEX idx_production_sessions_created_by ON production_sessions(created_by);
CREATE INDEX idx_production_sessions_active ON production_sessions(is_active);
```

---

## 💾 Environment Variables untuk Supabase

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database URL untuk Prisma (Optional - bisa langsung pakai Supabase JS)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-deployed-url.vercel.app"
```

---

## 🔧 Integration Benefits

### **Real-time Features:**
- ✅ **Multi-user collaboration**: Multiple users dapat edit bersamaan
- ✅ **Live updates**: Perubahan data langsung sync ke semua user
- ✅ **Conflict resolution**: Built-in handling untuk concurrent edits

### **Performance:**
- ✅ **PostgreSQL**: Much faster than SQLite untuk production
- ✅ **Connection pooling**: Optimized untuk Vercel deployment
- ✅ **Edge functions**: Optional untuk complex calculations

### **Security:**
- ✅ **Row Level Security**: Data isolation per user/company
- ✅ **Built-in auth**: Email, OAuth, phone authentication
- ✅ **Audit trails**: Automatic tracking semua perubahan

### **Scalability:**
- ✅ **Free tier**: 500MB storage + 2GB bandwidth
- ✅ **Auto-scaling**: Handles traffic spikes
- ✅ **Backup & restore**: Automatic daily backups

---

## 📊 Migration Strategy

### **Phase 1: Database Setup** (5 menit)
1. Create Supabase account
2. Run SQL schema above
3. Configure RLS policies

### **Phase 2: Code Integration** (15 menit)
1. Install Supabase packages
2. Update Prisma schema
3. Create Supabase client utilities

### **Phase 3: Data Migration** (10 menit)
1. Export existing SQLite data
2. Import ke Supabase
3. Test all functionality

### **Phase 4: Real-time Features** (20 menit)
1. Replace Socket.IO dengan Supabase Realtime
2. Add multi-user collaboration
3. Implement conflict resolution

---

**Total Setup Time: ~50 menit untuk full migration** 🚀

**Apakah Anda ingin saya lanjutkan dengan setup Supabase integration?**