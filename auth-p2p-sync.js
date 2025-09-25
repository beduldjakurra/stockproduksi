// P2P SYNC PANEL UNTUK Yjs + y-webrtc
import * as Y from "https://cdn.jsdelivr.net/npm/yjs@13.6.9/dist/yjs.mjs";
import { WebrtcProvider } from "https://cdn.jsdelivr.net/npm/y-webrtc@10.6.6/dist/y-webrtc.mjs";

// Membuat panel UI pairing
function createPanel() {
  const panel = document.createElement('div');
  panel.id = "p2p-sync-panel";
  panel.style = `
    position:fixed;top:20px;left:20px;z-index:9999;background:rgba(255,255,255,0.98);
    border-radius:10px;box-shadow:0 2px 12px rgba(60,60,90,0.12);padding:16px 18px;
    font-family:sans-serif;min-width:230px;max-width:90vw;
    border:1.5px solid #4895ef;transition:.2s;user-select:auto;
  `;

  panel.innerHTML = `
    <div style="font-weight:700;font-size:18px;color:#4361ee;margin-bottom:10px;">
      P2P Sync
    </div>
    <input id="p2p-room" placeholder="Kode Room" style="width:100%;margin-bottom:8px;padding:7px 10px;border:1px solid #b5b5b5;border-radius:6px;font-size:15px;">
    <button id="p2p-connect" style="width:100%;padding:8px 0;background:#4895ef;color:white;border:none;border-radius:6px;font-weight:600;font-size:15px;">Connect</button>
    <div id="p2p-status" style="margin-top:8px;font-size:13px;min-height:24px;color:#333;"></div>
  `;
  document.body.appendChild(panel);
  return panel;
}

// Inisialisasi Yjs & pairing
function startSync(room) {
  const ydoc = new Y.Doc();
  const provider = new WebrtcProvider(room, ydoc);

  provider.on('status', event => {
    document.getElementById('p2p-status').textContent = `Status: ${event.status}`;
  });

  // Contoh: Sinkronisasi key-value sederhana (bisa diubah sesuai kebutuhan)
  let ymap = ydoc.getMap("data");

  // Listen perubahan data
  ymap.observe(event => {
    // Kode untuk update aplikasi dari data sync
    // console.log("Data berubah", ymap.toJSON());
  });

  // Simpan objek yjs di window agar bisa diakses aplikasi utama
  window.yjsSync = { ydoc, ymap, provider };
}

// Panel pairing
const panel = createPanel();
document.getElementById('p2p-connect').onclick = () => {
  const kodeRoom = document.getElementById('p2p-room').value.trim();
  if (!kodeRoom) {
    document.getElementById('p2p-status').textContent = 'Masukkan kode room!';
    return;
  }
  startSync(kodeRoom);
  document.getElementById('p2p-status').textContent = `Terhubung ke room: ${kodeRoom}`;
};
