@echo off
echo.
echo ===========================================
echo 🚀 SUPABASE INTEGRATION TEST - PROJECT STO
echo ===========================================
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ File .env.local tidak ditemukan!
    echo.
    echo 📋 Langkah setup:
    echo    1. Copy .env.local.template ke .env.local
    echo    2. Isi dengan Supabase credentials Anda
    echo    3. Run script ini lagi
    echo.
    pause
    exit /b 1
)

echo ✅ File .env.local ditemukan

REM Check environment variables
echo 🔍 Checking environment variables...
findstr "your-project-ref" .env.local >nul
if %errorlevel% equ 0 (
    echo ⚠️  NEXT_PUBLIC_SUPABASE_URL belum diisi!
    echo    Update dengan project URL dari Supabase dashboard
    pause
    exit /b 1
)

findstr "your-anon-key-here" .env.local >nul
if %errorlevel% equ 0 (
    echo ⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi!
    echo    Update dengan anon key dari Supabase dashboard
    pause
    exit /b 1
)

echo ✅ Environment variables configured

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build check
echo 🔨 Building project...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Check logs above
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.

REM Start development server
echo 🌟 Starting development server...
echo.
echo 📱 Testing URLs:
echo    - Main App: http://localhost:3000
echo    - Supabase App: http://localhost:3000/supabase
echo    - PWA: http://localhost:3001 (if running pwa-server)
echo.
echo 🔐 Test authentication flow:
echo    1. Sign up dengan email baru
echo    2. Check Supabase Auth dashboard
echo    3. Test production data input
echo    4. Verify real-time sync
echo.
echo Press Ctrl+C to stop server
echo.

npm run dev