// P2P functionality removed.
// This module is intentionally left as a no-op to disable the P2P panel and related behaviors.

(() => {
  // Remove existing P2P panel if it was previously injected
  const existing = document.getElementById('p2p-sync-panel');
  if (existing) {
    try { existing.remove(); } catch (_) {}
  }

  // Detach any leftover handlers if elements still exist in DOM
  const connectBtn = document.getElementById('p2p-connect');
  if (connectBtn) {
    try { connectBtn.onclick = null; } catch (_) {}
  }
  const hideBtn = document.getElementById('p2p-hide');
  if (hideBtn) {
    try { hideBtn.onclick = null; } catch (_) {}
  }
  const statusEl = document.getElementById('p2p-status');
  if (statusEl) {
    try { statusEl.remove(); } catch (_) {}
  }

  // No further actions.
})();