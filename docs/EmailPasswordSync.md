# Sinkronisasi Multi-Perangkat dengan Email/Password (Client-side)

Solusi ini memungkinkan data aplikasi konsisten di banyak perangkat:
- Pengguna masuk dengan email (boleh "palsu", mis. `nama@app.local`) dan password.
- Perangkat lain dengan kredensial yang sama akan memuat data yang sama.
- Semua berjalan di sisi-klien (client-only) dengan Firebase Auth + Firestore.
- Offline-ready: perubahan akan tersinkron saat online kembali.

## Model Data

Dokumen per pengguna:
```
/users/{uid}/state/app
```

Isi:
```json
{
  "data": { /* JSON state aplikasi */ },
  "lastUpdated": "<serverTimestamp>"
}
```

`lastUpdated` dipakai untuk mencegah loop write→read→write.

## Integrasi di UI

Tambahkan panel kecil di `index.html`:
- `#email-input`, `#password-input`, tombol `#email-login-btn`
- `#auth-status` untuk pesan status

Muat `auth-email-sync.js` sebelum `</body>`.

Aplikasi Anda perlu menyediakan hook:
- `window.collectFromUI()` (opsional): ambil state dari UI dan kembalikan object JSON.
- `window.applyToUI(obj)`: terapkan state JSON ke UI.

Contoh wiring cepat:
```html
<script>
  // Simpan otomatis saat input berubah
  document.querySelectorAll('input,textarea,select').forEach(el => {
    el.addEventListener('change', () => {
      const state = collectFromUI(); // implementasi Anda
      window.syncSave(state);
    });
  });

  // Terapkan data dari Firestore ke UI
  window.applyToUI = function (data) {
    // TODO: isi ulang form/tabel dari object data
  };
</script>
```

## Aturan Keamanan Firestore (disarankan)

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

Dengan aturan ini, tiap pengguna (UID) hanya dapat membaca/menulis datanya sendiri.

## Offline & Konflik

- Offline persistence diaktifkan (`synchronizeTabs: true`).
- Saat offline, `syncSave` mengantri perubahan; snapshot akan menyusul saat koneksi kembali.
- `lastUpdated` mencegah loop. Untuk merge kompleks, Anda bisa menambah versi per entitas.

## Uji Coba

1. Di Browser A: masuk dengan email/password, ubah data, panggil `window.syncSave(collectFromUI())` (atau otomatis via event `change`).
2. Di Browser B: masuk dengan kredensial yang sama; pastikan data muncul dan ikut realtime saat A berubah.
3. Coba juga setelah clear cache/Incognito untuk memastikan alur masuk ulang bekerja.

## Catatan

- Kredensial email/password dikelola oleh Firebase Auth (email verifikasi tidak wajib jika Anda tidak memerlukannya).
- Jangan menyimpan password di localStorage secara manual.
- Pertimbangkan password minimal 8+ karakter.