@echo off
echo.
echo ================================
echo    🚀 DEPLOYING STO TO VERCEL
echo ================================
echo.

echo 📋 Checking project structure...
if not exist "package.json" (
    echo ❌ package.json not found!
    pause
    exit /b 1
)

echo ✅ Project structure OK

echo.
echo 🔐 Login to Vercel (akan buka browser)...
vercel login

echo.
echo 🚀 Starting deployment...
echo.

vercel --prod

echo.
echo ================================
echo    ✅ DEPLOYMENT COMPLETE!
echo ================================
echo.
echo 📱 PWA akan tersedia di:
echo    - Main App: https://[your-domain].vercel.app
echo    - PWA Direct: https://[your-domain].vercel.app/index.html
echo.
echo 🔧 Next steps:
echo    1. Configure environment variables di Vercel dashboard
echo    2. Set up database (PlanetScale/Supabase gratis)
echo    3. Test PWA functionality
echo.
pause