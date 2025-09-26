// P2P SYNC PANEL (panel dibuat dulu), Yjs/y-webrtc di-load saat Connect (dynamic import)
function createPanel() {
  const panel = document.createElement('div');
  panel.id = "p2p-sync-panel";
  panel.style = `
    position:fixed;top:20px;left:20px;z-index:99999;background:rgba(255,255,255,0.98);
    border-radius:10px;box-shadow:0 2px 12px rgba(60,60,90,0.12);padding:16px 18px;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    min-width:230px;max-width:90vw;border:1.5px solid #4895ef;transition:.2s;user-select:auto;
  `;

  panel.innerHTML = `
    <div style="font-weight:700;font-size:18px;color:#4361ee;margin-bottom:10px;">
      P2P Sync
    </div>
    <input id="p2p-room" placeholder="Kode Room" style="width:100%;margin-bottom:8px;padding:7px 10px;border:1px solid #b5b5b5;border-radius:6px;font-size:15px;">
    <div style="display:flex;gap:8px;">
      <button id="p2p-connect" style="flex:1;padding:8px 0;background:#4895ef;color:white;border:none;border-radius:6px;font-weight:600;font-size:15px;">Connect</button>
      <button id="p2p-hide" style="padding:8px 10px;background:#eee;color:#333;border:1px solid #ccc;border-radius:6px;font-weight:600;font-size:15px;">×</button>
    </div>
    <div id="p2p-status" style="margin-top:8px;font-size:13px;min-height:24px;color:#333;"></div>
  `;
  document.body.appendChild(panel);

  // Tombol hide
  panel.querySelector('#p2p-hide').onclick = () => {
    panel.style.display = 'none';
  };

  return panel;
}

async function startSync(room) {
  const statusEl = document.getElementById('p2p-status');
  try {
    if (statusEl) statusEl.textContent = 'Menghubungkan... (memuat modul)';

    // Dynamic import agar panel tetap muncul walau CDN gagal
    const [Y, ywebrtc] = await Promise.all([
      import('https://unpkg.com/yjs@13.6.9/dist/yjs.mjs'),
      import('https://unpkg.com/y-webrtc@10.6.6/dist/y-webrtc.mjs')
    ]);

    const { WebrtcProvider } = ywebrtc;
    const ydoc = new Y.Doc();

    const provider = new WebrtcProvider(room, ydoc, {
      signaling: [
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com'
      ],
      peerOpts: {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
            // TURN optional:
            // { urls: 'turn:your.turn.server:3478', username: 'user', credential: 'pass' }
          ]
        }
      }
    });

    provider.on('status', (event) => {
      if (statusEl) statusEl.textContent = `Status: ${event.status}`;
    });

    // Shared state sederhana
    const ymap = ydoc.getMap('data');
    ymap.observe(() => {
      // console.log('Data berubah:', ymap.toJSON());
    });

    // Ekspos untuk debugging
    window.yjsSync = { ydoc, ymap, provider };

    if (statusEl) statusEl.textContent = `Terhubung ke room: ${room}`;
  } catch (err) {
    console.error('P2P Sync error:', err);
    if (statusEl) {
      statusEl.textContent = 'Gagal memuat modul P2P (CORS/CDN/diblokir). Coba lagi atau gunakan jaringan lain.';
    }
  }
}

// Buat panel segera saat file ini dimuat
createPanel();

// Tombol connect
document.getElementById('p2p-connect').onclick = async () => {
  const kodeRoom = document.getElementById('p2p-room').value.trim();
  const statusEl = document.getElementById('p2p-status');
  if (!kodeRoom) {
    if (statusEl) statusEl.textContent = 'Masukkan kode room!';
    return;
  }
  await startSync(kodeRoom);
};
