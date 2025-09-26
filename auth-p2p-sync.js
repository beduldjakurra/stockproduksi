// P2P SYNC PANEL dengan fallback transport (WebRTC -> WebSocket) dan fallback CDN
function createPanel() {
  const panel = document.createElement('div');
  panel.id = "p2p-sync-panel";
  panel.style = `
    position:fixed;top:20px;left:20px;z-index:99999;background:rgba(255,255,255,0.98);
    border-radius:10px;box-shadow:0 2px 12px rgba(60,60,90,0.12);padding:16px 18px;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    min-width:260px;max-width:92vw;border:1.5px solid #4895ef;transition:.2s;user-select:auto;
  `;

  panel.innerHTML = `
    <div style="font-weight:700;font-size:18px;color:#4361ee;margin-bottom:10px;">
      P2P Sync
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      <input id="p2p-room" placeholder="Kode Room" style="flex:1;padding:7px 10px;border:1px solid #b5b5b5;border-radius:6px;font-size:15px;">
      <select id="p2p-transport" title="Transport" style="padding:7px 10px;border:1px solid #b5b5b5;border-radius:6px;font-size:14px;">
        <option value="auto" selected>Auto</option>
        <option value="webrtc">WebRTC</option>
        <option value="websocket">WebSocket</option>
      </select>
    </div>
    <div style="display:flex;gap:8px;">
      <button id="p2p-connect" style="flex:1;padding:8px 0;background:#4895ef;color:white;border:none;border-radius:6px;font-weight:600;font-size:15px;">Connect</button>
      <button id="p2p-hide" style="padding:8px 10px;background:#eee;color:#333;border:1px solid #ccc;border-radius:6px;font-weight:600;font-size:15px;">×</button>
    </div>
    <div id="p2p-status" style="margin-top:8px;font-size:13px;min-height:24px;color:#333;"></div>
  `;
  document.body.appendChild(panel);
  panel.querySelector('#p2p-hide').onclick = () => { panel.style.display = 'none'; };
  return panel;
}

async function importWithFallback(urls) {
  const errors = [];
  for (const url of urls) {
    try {
      console.log(`Trying to import from: ${url}`);
      return await import(url);
    } catch (e) {
      console.warn(`Failed to import from ${url}:`, e);
      errors.push({ url, error: String(e) });
    }
  }
  const err = new Error('Semua sumber CDN gagal dimuat');
  err.details = errors;
  throw err;
}

async function importY() {
  return importWithFallback([
    'https://unpkg.com/yjs@13.6.9/dist/yjs.mjs',
    'https://cdn.jsdelivr.net/npm/yjs@13.6.9/dist/yjs.mjs',
    'https://esm.sh/yjs@13.6.9?bundle'
  ]);
}

async function importYWebRTC() {
  return importWithFallback([
    'https://unpkg.com/y-webrtc@10.6.6/dist/y-webrtc.mjs',
    'https://cdn.jsdelivr.net/npm/y-webrtc@10.6.6/dist/y-webrtc.mjs',
    'https://esm.sh/y-webrtc@10.6.6?bundle'
  ]);
}

async function importYWebSocket() {
  return importWithFallback([
    'https://esm.sh/y-websocket@1.5.0',
    'https://unpkg.com/y-websocket@1.5.0/dist/y-websocket.js?module',
    'https://cdn.jsdelivr.net/npm/y-websocket@1.5.0/dist/y-websocket.js'
  ]);
}

function setStatus(text) {
  const el = document.getElementById('p2p-status');
  if (el) el.textContent = text;
}

let current = {
  transport: 'auto',
  cleanup: null
};

async function startWithWebRTC(Y, room) {
  const { WebrtcProvider } = await importYWebRTC();
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
    console.log('WebRTC Status:', event.status);
    setStatus(`WebRTC: ${event.status}`);
  });

  provider.on('peers', ({ webrtcPeers }) => {
    const peerCount = webrtcPeers.size || webrtcPeers.length || 0;
    console.log('WebRTC Peers:', peerCount);
    setStatus(`WebRTC: connected (peers=${peerCount})`);
  });

  const ymap = ydoc.getMap('data');
  window.yjsSync = { ydoc, ymap, provider, transport: 'webrtc' };

  current.cleanup = () => {
    try { provider.destroy(); } catch {}
  };

  return { ydoc, provider, ymap };
}

async function startWithWebSocket(Y, room) {
  const { WebsocketProvider } = await importYWebSocket();
  const ydoc = new Y.Doc();

  // Demo server Yjs untuk pengujian. Untuk produksi, ganti dengan server Anda sendiri.
  const serverUrl = 'wss://demos.yjs.dev';
  const wsProvider = new WebsocketProvider(serverUrl, room, ydoc, { connect: true });

  wsProvider.on('status', (event) => {
    console.log('WebSocket Status:', event.status);
    setStatus(`WS: ${event.status}`);
  });

  wsProvider.on('connection-close', () => {
    console.log('WebSocket connection closed');
    setStatus('WS: disconnected');
  });

  wsProvider.on('connection-error', (error) => {
    console.error('WebSocket connection error:', error);
    setStatus('WS: connection error');
  });

  const ymap = ydoc.getMap('data');
  window.yjsSync = { ydoc, ymap, provider: wsProvider, transport: 'websocket' };

  current.cleanup = () => {
    try { wsProvider.destroy(); } catch {}
  };

  return { ydoc, provider: wsProvider, ymap };
}

async function startSync(room, transportMode = 'auto') {
  const statusEl = document.getElementById('p2p-status');
  try {
    setStatus('Menyiapkan modul...');
    const Y = await importY();

    // Bersihkan sesi sebelumnya
    if (typeof current.cleanup === 'function') {
      try { current.cleanup(); } catch {}
      current.cleanup = null;
    }

    if (transportMode === 'websocket') {
      setStatus('Menghubungkan via WebSocket...');
      await startWithWebSocket(Y, room);
      return;
    }

    if (transportMode === 'webrtc') {
      setStatus('Menghubungkan via WebRTC...');
      await startWithWebRTC(Y, room);
      return;
    }

    // Auto: coba WebRTC dulu; JIKA import/gagal awal, langsung fallback ke WS.
    setStatus('Menghubungkan via WebRTC (auto)...');
    let provider;
    try {
      ({ provider } = await startWithWebRTC(Y, room));
    } catch (webrtcErr) {
      console.warn('WebRTC path failed early, falling back to WebSocket:', webrtcErr);
      setStatus('WebRTC tidak tersedia (CDN/diblokir). Fallback ke WebSocket...');
      await startWithWebSocket(Y, room);
      return;
    }

    // Jika WebRTC berhasil import, tapi tidak menemukan peer, fallback setelah timeout
    let peersCount = 0;
    const peersHandler = ({ webrtcPeers }) => {
      peersCount = webrtcPeers.size || webrtcPeers.length || 0;
    };
    provider.on('peers', peersHandler);

    setTimeout(async () => {
      if (peersCount > 0) return; // sudah ada peer, tetap pakai WebRTC
      try {
        setStatus('WebRTC belum menemukan peer, fallback ke WebSocket...');
        if (typeof current.cleanup === 'function') {
          try { current.cleanup(); } catch {}
          current.cleanup = null;
        }
        const Y2 = await importY();
        await startWithWebSocket(Y2, room);
      } catch (fallbackErr) {
        console.error('Fallback WebSocket error:', fallbackErr);
        setStatus('Fallback WebSocket gagal. Coba jaringan lain atau whitelist server.');
      }
    }, 10000);

  } catch (err) {
    console.error('P2P Sync error:', err);
    if (statusEl) {
      const cdnErrors = Array.isArray(err?.details) ? err.details.map(d => `- ${d.url}: ${d.error}`).join('\n') : '';
      if (cdnErrors) {
        statusEl.innerHTML = `<strong>Gagal memuat library P2P dari semua CDN:</strong><br><small style="line-height: 1.3;">${cdnErrors.replace(/\n/g, '<br>')}</small><br>Coba jaringan lain atau minta whitelist.`;
      } else {
        statusEl.textContent = 'Gagal menginisialisasi P2P (CDN/Signaling mungkin diblokir). Coba jaringan lain atau minta whitelist.';
      }
    }
  }
}

// Buat panel segera
createPanel();

// Tombol connect
document.getElementById('p2p-connect').onclick = async () => {
  const kodeRoom = document.getElementById('p2p-room').value.trim();
  const transport = document.getElementById('p2p-transport').value;
  if (!kodeRoom) {
    setStatus('Masukkan kode room!');
    return;
  }
  await startSync(kodeRoom, transport);
};
