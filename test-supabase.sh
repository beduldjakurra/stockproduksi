#!/bin/bash

# =====================================
# SUPABASE INTEGRATION TEST SCRIPT
# =====================================

echo "🚀 Testing Supabase Integration untuk Project STO"
echo "==============================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ File .env.local tidak ditemukan!"
    echo "📋 Langkah setup:"
    echo "   1. Copy .env.local.template ke .env.local"
    echo "   2. Isi dengan Supabase credentials Anda"
    echo "   3. Run script ini lagi"
    exit 1
fi

echo "✅ File .env.local ditemukan"

# Check Supabase environment variables
echo "🔍 Checking environment variables..."

if grep -q "your-project-ref" .env.local; then
    echo "⚠️  NEXT_PUBLIC_SUPABASE_URL belum diisi!"
    echo "   Update dengan project URL dari Supabase dashboard"
    exit 1
fi

if grep -q "your-anon-key-here" .env.local; then
    echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi!"
    echo "   Update dengan anon key dari Supabase dashboard"
    exit 1
fi

echo "✅ Environment variables configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build check
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Check logs above"
    exit 1
fi

# Start development server
echo "🌟 Starting development server..."
echo "📱 Testing URLs:"
echo "   - Main App: http://localhost:3000"
echo "   - Supabase App: http://localhost:3000/supabase"
echo "   - PWA: http://localhost:3001 (if running pwa-server)"
echo ""
echo "🔐 Test authentication flow:"
echo "   1. Sign up dengan email baru"
echo "   2. Check Supabase Auth dashboard"
echo "   3. Test production data input"
echo "   4. Verify real-time sync"
echo ""

npm run dev