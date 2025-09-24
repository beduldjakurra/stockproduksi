/* Local-only fake login + per-user state stored in LocalStorage.
   Exposes a Firebase-compatible surface: syncStatus, syncOnUpdate, syncSave, and dispatches "sync:update" events.
   UI: floating panel with Email/Password login, Export/Import JSON, Clear Data. */
(function () {
  const STATUS = {
    initialized: false,
    auth: "signed-out", // "signed-out" | "authenticating" | "signed-in"
    user: null,          // { email }
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastSavedAt: null,
    lastError: null,
    message: ""
  };

  const listeners = new Set();
  const STORAGE_USERS = "localAuth.users";
  const STORAGE_PREFIX = "localAuth.state:";

  // Public API (kompatibel)
  window.syncStatus = STATUS;
  window.syncOnUpdate = function (cb) {
    if (typeof cb === "function") listeners.add(cb);
    return () => listeners.delete(cb);
  };
  window.syncSave = function (payloadObject) {
    if (STATUS.auth !== "signed-in" || !STATUS.user) {
      STATUS.lastError = "Belum login (lokal).";
      renderPanel();
      return Promise.reject(new Error(STATUS.lastError));
    }
    try {
      const key = keyFor(STATUS.user.email);
      localStorage.setItem(key, JSON.stringify(payloadObject || {}));
      STATUS.lastSavedAt = new Date();
      STATUS.message = "Data tersimpan lokal.";
      renderPanel();
      notifyUpdate(payloadObject || {});
      return Promise.resolve();
    } catch (e) {
      STATUS.lastError = e && e.message ? e.message : String(e);
      renderPanel();
      return Promise.reject(e);
    }
  };

  function notifyUpdate(data) {
    listeners.forEach((cb) => { try { cb(data); } catch {} });
    try { window.dispatchEvent(new CustomEvent("sync:update", { detail: data || null })); } catch {}
  }

  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_USERS) || "{}"); } catch { return {}; }
  }
  function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users || {}));
  }
  function keyFor(email) { return STORAGE_PREFIX + encodeURIComponent(String(email || "").toLowerCase()); }

  async function sha256(text) {
    try {
      const enc = new TextEncoder().encode(text);
      const buf = await (crypto && crypto.subtle ? crypto.subtle.digest("SHA-256", enc) : Promise.reject());
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      // Fallback (lemah) jika SubtleCrypto tidak tersedia
      let h = 0; for (let i = 0; i < text.length; i++) { h = (h<<5) - h + text.charCodeAt(i); h |= 0; }
      return String(h);
    }
  }

  async function signIn(email, password) {
    email = String(email || "").trim().toLowerCase();
    password = String(password || "");
    if (!email || !password) throw new Error("Email dan password wajib diisi.");

    // Cek ketersediaan LocalStorage
    try { const t = "__ls_test__"; localStorage.setItem(t, "1"); localStorage.removeItem(t); }
    catch { throw new Error("LocalStorage tidak tersedia (mungkin mode private atau diblokir). "); }

    const users = loadUsers();
    const passHash = await sha256(password);

    if (!users[email]) {
      users[email] = { passHash };
      saveUsers(users);
    } else if (users[email].passHash !== passHash) {
      throw new Error("Password salah untuk email tersebut (lokal).");
    }

    STATUS.auth = "signed-in";
    STATUS.user = { email };
    STATUS.message = "Login lokal berhasil.";
    STATUS.lastError = null;
    renderPanel();

    // Muat state lokal yang sudah ada dan beri tahu aplikasi
    try {
      const raw = localStorage.getItem(keyFor(email));
      const data = raw ? JSON.parse(raw) : {};
      notifyUpdate(data || {});
    } catch {}

    return STATUS.user;
  }

  function signOut() {
    STATUS.auth = "signed-out";
    STATUS.user = null;
    STATUS.message = "Keluar (lokal).";
    renderPanel();
  }

  function exportCurrent() {
    if (!STATUS.user) { STATUS.lastError = "Belum login."; renderPanel(); return; }
    try {
      const data = localStorage.getItem(keyFor(STATUS.user.email)) || "{}";
      const blob = new Blob([data], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `data-${STATUS.user.email.replace(/[^a-z0-9_.-]+/gi, "_")}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      STATUS.message = "Data diekspor."; renderPanel();
    } catch (e) { STATUS.lastError = e.message || String(e); renderPanel(); }
  }

  function importCurrent(file) {
    if (!STATUS.user) { STATUS.lastError = "Belum login."; renderPanel(); return; }
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "{}");
        const obj = JSON.parse(text);
        localStorage.setItem(keyFor(STATUS.user.email), JSON.stringify(obj || {}));
        STATUS.message = "Data diimpor."; STATUS.lastSavedAt = new Date(); renderPanel();
        notifyUpdate(obj || {});
      } catch (e) { STATUS.lastError = e.message || String(e); renderPanel(); }
    };
    reader.readAsText(file);
  }

  function clearCurrent() {
    if (!STATUS.user) { STATUS.lastError = "Belum login."; renderPanel(); return; }
    try { localStorage.removeItem(keyFor(STATUS.user.email)); STATUS.message = "Data dibersihkan."; renderPanel(); notifyUpdate({}); } catch {}
  }

  // Floating panel
  let $panel, $email, $password, $btn, $status, $logout, $export, $import, $importInput, $clear;
  function createPanel() {
    if (document.getElementById("local-auth-panel")) return;
    $panel = document.createElement("div");
    $panel.id = "local-auth-panel";
    Object.assign($panel.style, {
      position: "fixed", bottom: "16px", right: "16px", zIndex: 2147483647,
      background: "white", color: "#2b2d42", border: "1px solid #dee2e6",
      borderRadius: "10px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "12px", width: "300px",
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif'
    });

    const title = document.createElement("div");
    title.textContent = "Sync (Lokal) — Tanpa Cloud";
    Object.assign(title.style, { fontWeight: "700", marginBottom: "8px", color: "#4361ee" });

    const hint = document.createElement("div");
    hint.textContent = "Data disimpan di perangkat ini saja. Gunakan Export/Import untuk pindah perangkat.";
    Object.assign(hint.style, { fontSize: "11px", color: "#8d99ae", marginBottom: "8px" });

    $email = document.createElement("input"); $email.type = "email"; $email.placeholder = "Email";
    Object.assign($email.style, { width: "100%", padding: "8px", margin: "6px 0", border: "1px solid #dee2e6", borderRadius: "8px" });
    $email.autocomplete = "username";

    $password = document.createElement("input"); $password.type = "password"; $password.placeholder = "Password";
    Object.assign($password.style, { width: "100%", padding: "8px", margin: "6px 0 8px", border: "1px solid #dee2e6", borderRadius: "8px" });
    $password.autocomplete = "current-password";

    $btn = document.createElement("button"); $btn.textContent = "Masuk / Daftar";
    Object.assign($btn.style, { width: "100%", padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer",
      background: "linear-gradient(135deg, #4361ee, #3a56d4)", color: "white", fontWeight: "700" });
    $btn.addEventListener("click", async () => {
      STATUS.auth = "authenticating"; STATUS.message = "Memproses..."; STATUS.lastError = null; renderPanel();
      try { await signIn(($email.value||"\"").trim(), ($password.value||"\"").trim()); }
      catch (e) { STATUS.auth = "signed-out"; STATUS.lastError = e.message || String(e); }
      finally { if (STATUS.auth !== "signed-out") STATUS.auth = "signed-in"; renderPanel(); }
    });

    $logout = document.createElement("button"); $logout.textContent = "Keluar";
    Object.assign($logout.style, { width: "100%", marginTop: "6px", padding: "8px", border: "1px solid #dee2e6", borderRadius: "8px", cursor: "pointer", background: "white", color: "#2b2d42", fontWeight: "600" });
    $logout.addEventListener("click", () => signOut());

    $export = document.createElement("button"); $export.textContent = "Export JSON";
    Object.assign($export.style, { width: "100%", marginTop: "6px", padding: "8px", border: "1px solid #dee2e6", borderRadius: "8px", cursor: "pointer", background: "white", color: "#2b2e42", fontWeight: "600" });
    $export.addEventListener("click", () => exportCurrent());

    $import = document.createElement("button"); $import.textContent = "Import JSON";
    Object.assign($import.style, { width: "100%", marginTop: "6px", padding: "8px", border: "1px solid #dee2e6", borderRadius: "8px", cursor: "pointer", background: "white", color: "#2b2d42", fontWeight: "600" });
    $import.addEventListener("click", () => $importInput && $importInput.click());

    $importInput = document.createElement("input"); $importInput.type = "file"; $importInput.accept = "application/json"; $importInput.style.display = "none";
    $importInput.addEventListener("change", () => { const f = $importInput.files && $importInput.files[0]; if (f) importCurrent(f); $importInput.value = ""; });

    $clear = document.createElement("button"); $clear.textContent = "Clear Data";
    Object.assign($clear.style, { width: "100%", marginTop: "6px", padding: "8px", border: "1px solid #dee2e6", borderRadius: "8px", cursor: "pointer", background: "white", color: "#ef476f", fontWeight: "700" });
    $clear.addEventListener("click", () => clearCurrent());

    $status = document.createElement("div"); Object.assign($status.style, { marginTop: "8px", fontSize: "12px", color: "#8d99ae" });

    $panel.append(title, hint, $email, $password, $btn, $logout, $export, $import, $importInput, $clear, $status);
    document.body.appendChild($panel);
  }

  function renderPanel() {
    if (!$panel) return;
    const onlineTxt = STATUS.online ? "Online" : "Offline";
    let line1 = `Status: ${STATUS.auth} • ${onlineTxt}`;
    if (STATUS.user && STATUS.user.email) line1 += ` • ${STATUS.user.email}`;
    const line2 = STATUS.message || "";
    const line3 = STATUS.lastError ? `Error: ${STATUS.lastError}` : "";
    const line4 = STATUS.lastSavedAt ? `Last save: ${new Date(STATUS.lastSavedAt).toLocaleString()}` : "";
    $status.innerHTML = [line1, line2, line3, line4].filter(Boolean).join("<br/>");

    const signedIn = STATUS.auth === "signed-in";
    $email.disabled = signedIn;
    $password.disabled = signedIn;
    $btn.disabled = signedIn || STATUS.auth === "authenticating";
    $logout.disabled = !signedIn;
    $export.disabled = !signedIn;
    $import.disabled = !signedIn;
    $clear.disabled = !signedIn;
  }

  function setupOnlineOffline() {
    try {
      window.addEventListener("online", () => { STATUS.online = true; STATUS.message = "Koneksi kembali online."; renderPanel(); });
      window.addEventListener("offline", () => { STATUS.online = false; STATUS.message = "Sedang offline (lokal)."; renderPanel(); });
    } catch {}
  }

  function init() {
    createPanel();
    setupOnlineOffline();
    STATUS.initialized = true;
    STATUS.message = "Mode lokal-only aktif. Silakan login untuk memuat/menyimpan data di perangkat ini.";
    renderPanel();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();