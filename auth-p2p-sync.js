// Optimized P2P SYNC PANEL with improved error handling and detailed logging

function createPanel() {
  const panel = document.createElement('div');
  panel.id = "p2p-sync-panel";
  panel.style = `
    position: fixed; top: 20px; left: 20px; z-index: 99999; background: rgba(255,255,255,0.98);
    border-radius: 10px; box-shadow: 0 2px 12px rgba(60,60,90,0.12); padding: 16px 18px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    min-width: 260px; max-width: 92vw; border: 1.5px solid #4895ef; transition: .3s ease;
    animation: fadeIn 0.3s ease-in-out;
  `;

  panel.innerHTML = `
    <div style="font-weight: 700; font-size: 18px; color: #4361ee; margin-bottom: 10px;">
      P2P Sync
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
      <input id="p2p-room" placeholder="Kode Room" style="flex: 1; padding: 7px 10px; border: 1px solid #b5b5b5; border-radius: 6px; font-size: 15px;">
      <select id="p2p-transport" title="Transport" style="padding: 7px 10px; border: 1px solid #b5b5b5; border-radius: 6px; font-size: 14px;">
        <option value="auto" selected>Auto</option>
        <option value="webrtc">WebRTC</option>
        <option value="websocket">WebSocket</option>
      </select>
    </div>
    <div style="display: flex; gap: 8px;">
      <button id="p2p-connect" style="flex: 1; padding: 8px 0; background: #4895ef; color: white; border: none; border-radius: 6px; font-weight: 600; font-size: 15px;">Connect</button>
      <button id="p2p-hide" style="padding: 8px 10px; background: #eee; color: #333; border: 1px solid #ccc; border-radius: 6px; font-weight: 600; font-size: 15px;">×</button>
    </div>
    <div id="p2p-status" style="margin-top: 8px; font-size: 13px; min-height: 24px; color: #333;"></div>
  `;

  document.body.appendChild(panel);
  panel.querySelector('#p2p-hide').onclick = () => panel.style.display = 'none';
  return panel;
}

// Enhanced import with fallback and logging
async function importWithFallback(urls) {
  const errors = [];
  for (const url of urls) {
    try {
      console.log(`[Import Attempt] Trying: ${url}`);
      return await import(url);
    } catch (e) {
      console.warn(`[Import Failed] ${url}:`, e);
      errors.push({ url, error: e.message });
    }
  }
  throw new Error(`[Import Failed] All sources failed: ${errors.map(err => `${err.url} (${err.error})`).join(', ')}]`);
}

// Modularized sync initiation
async function startSync(room, transport = 'auto') {
  const statusEl = document.getElementById('p2p-status');
  try {
    setStatus('Initializing...');
    const Y = await importWithFallback([
      'https://unpkg.com/yjs@13.6.9/dist/yjs.mjs',
      'https://cdn.jsdelivr.net/npm/yjs@13.6.9/dist/yjs.mjs'
    ]);

    if (current.cleanup) current.cleanup();

    if (transport === 'webrtc') {
      await startWithWebRTC(Y, room);
      return;
    }

    if (transport === 'websocket') {
      await startWithWebSocket(Y, room);
      return;
    }

    // Auto mode
    try {
      await startWithWebRTC(Y, room);
    } catch (webrtcError) {
      console.error('WebRTC failed:', webrtcError);
      setStatus('WebRTC failed, falling back to WebSocket...');
      await startWithWebSocket(Y, room);
    }
  } catch (err) {
    console.error('Sync Initialization Failed:', err);
    setStatus(`Failed to initialize sync. Error: ${err.message}`);
  }
}

// Utility functions
function setStatus(message) {
  const el = document.getElementById('p2p-status');
  if (el) el.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
}

// Initialize panel and set up button click
createPanel();

document.getElementById('p2p-connect').onclick = async () => {
  const room = document.getElementById('p2p-room').value.trim();
  const transport = document.getElementById('p2p-transport').value;
  if (!room) {
    setStatus('Please enter a valid room code!');
    return;
  }
  await startSync(room, transport);
};