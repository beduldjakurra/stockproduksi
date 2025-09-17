#!/bin/bash

# PT Fuji Seat Indonesia - Laporan Produksi Deployment Script
# This script helps deploy the PWA to Firebase Hosting

echo "🚀 Starting deployment process for PT Fuji Seat Indonesia - Laporan Produksi"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the Next.js application
echo "🔨 Building the application..."
npm run build

# Export the application for static hosting
echo "📤 Exporting static files..."
npm run export

# Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment completed successfully!"
echo "📱 Your PWA is now live and ready to use!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up your Firebase project with the actual configuration"
echo "2. Update the Firebase configuration in src/lib/firebase-config.js"
echo "3. Enable Firestore Database in your Firebase console"
echo "4. Set up authentication if needed"
echo "5. Test the PWA functionality on different devices"
echo ""
echo "📋 Important Notes:"
echo "- The application works offline with IndexedDB"
echo "- Data syncs automatically when online"
echo "- Make sure to update the Firebase config with your actual project details"
echo "- Test the PWA installation on mobile devices"