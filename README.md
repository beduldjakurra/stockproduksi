# PT Fuji Seat Indonesia - Laporan Produksi PWA

Aplikasi Progressive Web App (PWA) untuk Laporan Data Stock Akhir Proses Div.INJECTION PT Fuji Seat Indonesia. Aplikasi ini dirancang untuk bekerja offline dan menyinkronkan data secara otomatis saat koneksi internet tersedia.

## 🌟 Fitur Utama

### 📱 PWA (Progressive Web App)
- **Installable**: Dapat diinstall seperti aplikasi native di perangkat mobile
- **Offline Support**: Bekerja tanpa koneksi internet
- **Responsive Design**: Tampilan optimal di semua ukuran layar
- **Fast Loading**: Cepat dan responsif

### 📊 Fitur Laporan
- **Stock Produksi**: Pantau stock awal, produksi, dan distribusi
- **Perhitungan Box**: Hitung ACT QTY berdasarkan STDRT PACK dan ACT/BOX
- **Kekuatan Stock**: Analisis kekuatan stock harian
- **Mode Day/Night**: Switch antara shift day dan night
- **Auto-sync**: Data tersimpan otomatis dan disinkronkan

### 🔄 Sinkronisasi Data
- **Real-time Sync**: Data disinkronkan secara real-time antar perangkat
- **Offline Queue**: Data tersimpan lokal saat offline, sync saat online
- **Firebase Backend**: Menggunakan Firebase Firestore untuk penyimpanan data
- **IndexedDB**: Database lokal untuk performa offline

### 📁 Manajemen File
- **Export Excel**: Export data ke format Excel dengan styling profesional
- **Import Excel**: Import data dari file Excel
- **Export JPG**: Konversi tabel ke gambar JPG untuk sharing
- **Auto-save**: Penyimpanan otomatis setiap 30 detik

## 🚀 Instalasi & Deployment

### Prasyarat
- Node.js (v14 atau lebih tinggi)
- npm atau yarn
- Akun Firebase
- Firebase CLI

### Langkah-langkah Deployment

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd fuji-seat-laporan
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Firebase Project**
   - Buat project baru di [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Authentication (jika diperlukan)
   - Copy konfigurasi Firebase ke `src/lib/firebase-config.js`

4. **Build Aplikasi**
   ```bash
   npm run build
   npm run export
   ```

5. **Deploy ke Firebase Hosting**
   ```bash
   # Login ke Firebase
   firebase login
   
   # Deploy
   firebase deploy --only hosting
   ```

### Deployment Otomatis
Gunakan script deployment untuk proses yang lebih mudah:
```bash
./deploy.sh
```

## 🔧 Konfigurasi

### Firebase Configuration
Update file `src/lib/firebase-config.js` dengan konfigurasi Firebase project Anda:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Environment Variables
Buat file `.env.local` untuk environment variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
```

## 📱 Penggunaan

### Installasi PWA
1. Buka aplikasi di browser Chrome/Safari
2. Klik icon "Install" di address bar
3. Konfirmasi instalasi
4. Aplikasi akan muncul di homescreen

### Navigasi Aplikasi
- **Cover Screen**: Halaman pembuka dengan branding perusahaan
- **Main App**: Halaman utama dengan semua fitur
- **Tab Navigation**: Switch antara 3 tabel utama
- **Mode Toggle**: Switch antara mode Day dan Night
- **Action Buttons**: Save, Import, Export, Reset

### Input Data
1. Pilih mode (Day/Night)
2. Isi data di tabel Stock Produksi
3. Isi ACT/BOX di tabel Perhitungan Box
4. Lihat hasil perhitungan di tabel Kekuatan Stock
5. Data tersimpan otomatis

### Import/Export
- **Import Excel**: Klik tombol Import dan pilih file Excel
- **Export Excel**: Klik tombol Save to Excel
- **Export JPG**: Klik tombol Convert to JPG

## 🏗️ Struktur Proyek

```
fuji-seat-laporan/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── icons/                 # PWA icons
│   └── screenshots/           # App screenshots
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main application page
│   │   ├── layout.tsx         # App layout
│   │   └── globals.css        # Global styles
│   ├── lib/
│   │   ├── firebase-config.js # Firebase configuration
│   │   ├── db.ts              # Database utilities
│   │   └── utils.ts           # Utility functions
│   └── components/
│       └── ui/                # UI components
├── firebase.json              # Firebase hosting config
├── firestore.rules            # Firestore security rules
├── .firebaserc               # Firebase project config
├── deploy.sh                 # Deployment script
└── package.json              # Project dependencies
```

## 🔒 Keamanan

### Data Protection
- **Authentication**: Opsional, dapat dienable jika diperlukan
- **Firestore Rules**: Hanya authenticated users yang dapat akses data
- **Local Storage**: Data tersimpan encrypted di device
- **HTTPS**: Wajib untuk production

### Offline Security
- **Service Worker**: Cache resources untuk offline access
- **IndexedDB**: Database lokal dengan encryption
- **Sync Queue**: Data offline aman sampai sync

## 🧪 Testing

### Local Testing
```bash
# Development mode
npm run dev

# Build testing
npm run build
npm run start
```

### PWA Testing
1. **Install Test**: Test installasi PWA di berbagai device
2. **Offline Test**: Test fungsi offline dengan matikan internet
3. **Sync Test**: Test sinkronisasi data antar device
4. **Responsive Test**: Test di berbagai ukuran layar

### Browser Compatibility
- ✅ Chrome (Android/Desktop)
- ✅ Safari (iOS/Mac)
- ✅ Firefox
- ✅ Edge

## 🐛 Troubleshooting

### Common Issues

#### Service Worker Tidak Terdaftar
```javascript
// Clear browser cache dan refresh
// Check console untuk error messages
```

#### Firebase Connection Error
```javascript
// Verify Firebase configuration
// Check network connection
// Enable Firestore di Firebase console
```

#### Data Tidak Tersinkron
```javascript
// Check authentication status
// Verify Firestore rules
// Check network connectivity
```

### Debug Tools
- **Chrome DevTools**: Service worker, IndexedDB, Network
- **Firebase Console**: Monitoring dan analytics
- **Browser Console**: Error messages dan debug info

## 📈 Performance

### Optimization
- **Lazy Loading**: Load resources on demand
- **Caching**: Service worker cache untuk offline
- **Compression**: Gzip compression untuk assets
- **Images**: Optimized images dengan WebP format

### Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🔮 Future Enhancements

### Planned Features
- [ ] Push Notifications untuk update data
- [ ] Multi-user collaboration
- [ ] Advanced analytics dashboard
- [ ] Barcode/QR code scanning
- [ ] Real-time chat support
- [ ] Advanced reporting features

### Technical Improvements
- [ ] WebAssembly untuk performa
- [ ] GraphQL untuk API
- [ ] Microservices architecture
- [ ] Advanced offline capabilities
- [ ] Machine learning untuk predictions

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Kontribusi

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

Untuk support atau pertanyaan:
- Email: support@fuji-seat.co.id
- Documentation: [Wiki](https://github.com/your-repo/wiki)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**PT Fuji Seat Indonesia** © 2025 - Laporan Produksi PWA