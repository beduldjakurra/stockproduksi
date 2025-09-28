/* eslint-disable no-undef */
(function () {
  const STATUS = {
    initialized: false,
    auth: "signed-out", // "signed-out" | "authenticating" | "signed-in"
    user: null,
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastSyncedAt: null,
    lastError: null,
    message: ""
  };

  const subscribers = new Set();
  let firestore = null;
  let auth = null;
  let app = null;
  let docRef = null;
  let unsubscribeSnapshot = null;
  let lastLocalWriteAt = 0;
  let debouncedWrite = null;

  // Public API
  window.syncStatus = STATUS;
  window.syncOnUpdate = function (cb) {
    if (typeof cb === "function") subscribers.add(cb);
    return () => subscribers.delete(cb);
  };
  window.syncSave = function (payloadObject) {
    if (STATUS.auth !== "signed-in" || !docRef) {
      STATUS.lastError = "Belum login. Silakan login terlebih dahulu.";
      renderPanel();
      return Promise.reject(new Error(STATUS.lastError));
    }
    const writeFn = () => {
      try {
        lastLocalWriteAt = Date.now();
        return docRef.set(
          {
            data: payloadObject || {},
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );
      } catch (e) {
        STATUS.lastError = e.message || String(e);
        renderPanel();
        return Promise.reject(e);
      }
    };
    return debouncedWrite(writeFn);
  };

  function debounce(fn, wait) {
    let t = null;
    return (...args) =>
      new Promise((resolve, reject) => {
        if (t) clearTimeout(t);
        t = setTimeout(async () => {
          try {
            const res = await fn(...args);
            resolve(res);
          } catch (err) {
            reject(err);
          }
        }, wait);
      });
  }

  function notifyUpdate(data) {
    subscribers.forEach((cb) => {
      try {
        cb(data);
      } catch {}
    });
    try {
      window.dispatchEvent(
        new CustomEvent("sync:update", { detail: data || null })
      );
    } catch {}
  }

  function ensureFirebase() {
    if (!window.FIREBASE_CONFIG) {
      STATUS.message =
        "Firebase belum dikonfigurasi. Buat firebase-config.js dari firebase-config.sample.js dan isi kredensial Anda.";
      STATUS.lastError = null;
      return false;
    }
    try {
      if (firebase.apps && firebase.apps.length) {
        app = firebase.apps[0];
      } else {
        app = firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      auth = firebase.auth();
      firestore = firebase.firestore();
      return true;
    } catch (e) {
      STATUS.lastError = e.message || String(e);
      return false;
    }
  }

  async function enablePersistence() {
    if (!firestore) return;
    try {
      await firestore.enablePersistence({ synchronizeTabs: true });
    } catch (e) {
      // continue without persistence if not available
    }
  }

  function startAuthListener() {
    if (!auth) return;
    auth.onAuthStateChanged((user) => {
      if (user) {
        STATUS.auth = "signed-in";
        STATUS.user = { uid: user.uid, email: user.email || "" };
        STATUS.message = "Login berhasil.";
        renderPanel();
        startSync(user.uid);
      } else {
        STATUS.auth = "signed-out";
        STATUS.user = null;
        teardownSync();
        renderPanel();
      }
    });
  }

  function teardownSync() {
    if (unsubscribeSnapshot) {
      try { unsubscribeSnapshot(); } catch {}
    }
    unsubscribeSnapshot = null;
    docRef = null;
  }

  function startSync(uid) {
    if (!firestore) return;
    teardownSync();
    docRef = firestore.collection("users").doc(uid).collection("state").doc("app");

    unsubscribeSnapshot = docRef.onSnapshot(
      (snap) => {
        if (!snap.exists) return;
        const data = snap.data() || {};
        const serverTs =
          data.lastUpdated && typeof data.lastUpdated.toMillis === "function"
            ? data.lastUpdated.toMillis()
            : 0;
        // avoid echo if the update is our own immediate write
        if (lastLocalWriteAt && serverTs && serverTs <= lastLocalWriteAt + 50) {
          return;
        }
        STATUS.lastSyncedAt = new Date();
        STATUS.message = "Sinkronisasi berhasil.";
        renderPanel();
        notifyUpdate(data.data || {});
      },
      (err) => {
        STATUS.lastError = err && err.message ? err.message : String(err);
        renderPanel();
      }
    );
  }

  // Floating login panel injected dynamically
  let $panel, $email, $password, $btn, $status, $logout;
  function createPanel() {
    if (document.getElementById("email-auth-panel")) return;

    $panel = document.createElement("div");
    $panel.id = "email-auth-panel";
    $panel.style.position = "fixed";
    $panel.style.bottom = "16px";
    $panel.style.right = "16px";
    $panel.style.zIndex = "2147483647";
    $panel.style.background = "white";
    $panel.style.color = "#2b2d42";
    $panel.style.border = "1px solid #dee2e6";
    $panel.style.borderRadius = "10px";
    $panel.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
    $panel.style.padding = "12px";
    $panel.style.width = "280px";
    $panel.style.fontFamily =
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';

    const title = document.createElement("div");
    title.textContent = "Sync (Email/Password)";
    title.style.fontWeight = "700";
    title.style.marginBottom = "8px";
    title.style.color = "#4361ee";

    $email = document.createElement("input");
    $email.type = "email";
    $email.placeholder = "Email";
    $email.style.width = "100%";
    $email.style.padding = "8px";
    $email.style.margin = "6px 0";
    $email.style.border = "1px solid #dee2e6";
    $email.style.borderRadius = "8px";
    $email.autocomplete = "username";

    $password = document.createElement("input");
    $password.type = "password";
    $password.placeholder = "Password";
    $password.style.width = "100%";
    $password.style.padding = "8px";
    $password.style.margin = "6px 0 8px";
    $password.style.border = "1px solid #dee2e6";
    $password.style.borderRadius = "8px";
    $password.autocomplete = "current-password";

    $btn = document.createElement("button");
    $btn.textContent = "Masuk / Daftar";
    $btn.style.width = "100%";
    $btn.style.padding = "10px";
    $btn.style.border = "none";
    $btn.style.borderRadius = "8px";
    $btn.style.cursor = "pointer";
    $btn.style.background =
      "linear-gradient(135deg, #4361ee, #3a56d4)";
    $btn.style.color = "white";
    $btn.style.fontWeight = "700";
    $btn.addEventListener("click", onLoginClick);

    $logout = document.createElement("button");
    $logout.textContent = "Keluar";
    $logout.style.width = "100%";
    $logout.style.padding = "8px";
    $logout.style.marginTop = "6px";
    $logout.style.border = "1px solid #dee2e6";
    $logout.style.borderRadius = "8px";
    $logout.style.cursor = "pointer";
    $logout.style.background = "white";
    $logout.style.color = "#2b2d42";
    $logout.style.fontWeight = "600";
    $logout.addEventListener("click", () => auth && auth.signOut());

    $status = document.createElement("div");
    $status.style.marginTop = "8px";
    $status.style.fontSize = "12px";
    $status.style.color = "#8d99ae";

    const foot = document.createElement("div");
    foot.style.marginTop = "8px";
    foot.style.fontSize = "11px";
    foot.style.color = "#8d99ae";
    foot.textContent =
      "Offline-ready: perubahan akan tersinkron saat koneksi kembali.";

    $panel.appendChild(title);
    $panel.appendChild($email);
    $panel.appendChild($password);
    $panel.appendChild($btn);
    $panel.appendChild($logout);
    $panel.appendChild($status);
    $panel.appendChild(foot);

    document.body.appendChild($panel);
  }

  function renderPanel() {
    if (!$panel) return;
    const onlineTxt = STATUS.online ? "Online" : "Offline";
    let line1 = `Status: ${STATUS.auth} • ${onlineTxt}`;
    if (STATUS.user && STATUS.user.email) line1 += ` • ${STATUS.user.email}`;
    const line2 = STATUS.message || "";
    const line3 = STATUS.lastError ? `Error: ${STATUS.lastError}` : "";
    const line4 = STATUS.lastSyncedAt
      ? `Last sync: ${new Date(STATUS.lastSyncedAt).toLocaleString()}`
      : "";

    $status.innerHTML = [line1, line2, line3, line4].filter(Boolean).join("<br/>");

    const signedIn = STATUS.auth === "signed-in";
    $email.disabled = signedIn;
    $password.disabled = signedIn;
    $btn.disabled = signedIn || STATUS.auth === "authenticating";
    $logout.disabled = !signedIn;
  }

  async function onLoginClick() {
    if (!auth) {
      STATUS.lastError =
        "Firebase belum siap. Pastikan firebase-config.js dan SDK sudah dimuat.";
      renderPanel();
      return;
    }
    const email = ($email.value || "").trim();
    const pass = ($password.value || "").trim();
    if (!email || !pass) {
      STATUS.lastError = "Email dan Password wajib diisi.";
      renderPanel();
      return;
    }
    STATUS.auth = "authenticating";
    STATUS.message = "Memproses...";
    STATUS.lastError = null;
    renderPanel();

    try {
      await auth.signInWithEmailAndPassword(email, pass);
      STATUS.message = "Login berhasil.";
    } catch (e) {
      if (e && e.code === "auth/user-not-found") {
        try {
          await auth.createUserWithEmailAndPassword(email, pass);
          STATUS.message = "Akun dibuat dan login berhasil.";
        } catch (e2) {
          STATUS.auth = "signed-out";
          STATUS.lastError = e2.message || String(e2);
        }
      } else {
        STATUS.auth = "signed-out";
        STATUS.lastError = e.message || String(e);
      }
    } finally {
      if (STATUS.auth !== "signed-out") {
        STATUS.auth = "signed-in";
      }
      renderPanel();
    }
  }

  function setupOnlineOffline() {
    try {
      window.addEventListener("online", () => {
        STATUS.online = true;
        STATUS.message = "Koneksi kembali online.";
        renderPanel();
      });
      window.addEventListener("offline", () => {
        STATUS.online = false;
        STATUS.message = "Sedang offline. Perubahan akan diantre.";
        renderPanel();
      });
    } catch {}
  }

  function init() {
    debouncedWrite = debounce((fn) => fn(), 350);
    createPanel();
    setupOnlineOffline();

    if (typeof firebase === "undefined" || !firebase || !firebase.auth || !firebase.firestore) {
      STATUS.lastError =
        "Firebase SDK belum lengkap. Pastikan firebase-app-compat, firebase-auth-compat, dan firebase-firestore-compat dimuat.";
      renderPanel();
      return;
    }

    if (!ensureFirebase()) {
      renderPanel();
      return;
    }

    enablePersistence().finally(() => {
      startAuthListener();
      STATUS.initialized = true;
      STATUS.message =
        STATUS.message || "Siap digunakan. Silakan login untuk mulai sinkronisasi.";
      renderPanel();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
