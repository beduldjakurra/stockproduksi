# Email/Password Sync (Firebase Auth + Firestore)

Fitur ini menambahkan sinkronisasi data lintas perangkat menggunakan Firebase Authentication (Email/Password) dan Firestore, tanpa backend tambahan. Aplikasi tetap offline-first: perubahan tetap tersimpan saat offline dan otomatis tersinkron ketika koneksi kembali.

## Ikhtisar
- Arsitektur client-only (semua logic di browser).
- Auth: Email/Password via Firebase Auth.
- Sync: Firestore `onSnapshot` untuk update realtime.
- Offline: IndexedDB persistence (`synchronizeTabs: true`), antre tulis saat offline.
- Anti-echo: Field `lastUpdated` (serverTimestamp) + penanda `lastLocalWriteAt`.

## Struktur Data
Dokumen per pengguna:
```
/users/{uid}/state/app
```
Skema:
```json
{
  "data": { /* state aplikasi */ },
  "lastUpdated": "<serverTimestamp>"
}
```

## Aturan Keamanan (contoh)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/state/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Instalasi & Konfigurasi
1. Buat project di [Firebase Console](https://console.firebase.google.com/) dan aktifkan:
   - Authentication (Email/Password).
   - Firestore (mode produksi atau uji).
2. Dapatkan konfigurasi Web SDK (Project Settings -> Your apps).
3. Salin `firebase-config.sample.js` menjadi `firebase-config.js`, lalu isi kredensial Anda:
   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "…",
     authDomain: "…",
     projectId: "…",
     storageBucket: "…",
     messagingSenderId: "…",
     appId: "…"
   };
   ```
4. Pastikan `firebase-config.js` di-ignore (ditambahkan di `.gitignore`).
5. Pastikan halaman memuat SDK berikut dan skrip sinkronisasi:
   ```html
   <script src="./firebase-config.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>
   <script src="./auth-email-sync.js"></script>
   ```

## API yang Tersedia
- `window.syncSave(payloadObject)`: Menyimpan `{ data: payload, lastUpdated: serverTimestamp() }` ke `/users/{uid}/state/app`. Debounced 350ms.
- `window.syncOnUpdate(callback)`: Callback dipanggil ketika data remote berubah. Juga memicu `window` event `sync:update`.
- `window.syncStatus`: Status terkini (online/offline, auth, user, dll).

## Perilaku Offline
- Firestore antre operasi tulis saat offline dan menyinkronkannya saat kembali online.
- IndexedDB persistence diaktifkan (`synchronizeTabs: true`) bila memungkinkan.

## Pengujian
1. Jalankan aplikasi di Browser A, login dengan email/password.
2. Panggil `window.syncSave({ contoh: 1 })` di konsol DevTools; data tersimpan.
3. Buka aplikasi di Browser B, login dengan akun yang sama; perhatikan data muncul otomatis.
4. Ubah data di A/B; keduanya sinkron realtime.
5. Matikan koneksi salah satu browser; lakukan `window.syncSave({ offlineTest: Date.now() })`; nyalakan koneksi kembali dan periksa sinkronisasi.

## Catatan
- UI panel login disuntik secara dinamis sebagai elemen mengambang yang ringkas, agar tidak mengganggu layout PWA yang sudah ada.
- Jika `firebase-config.js` tidak ada atau belum diisi, panel akan menampilkan instruksi untuk konfigurasi.
