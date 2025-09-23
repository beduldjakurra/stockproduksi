(function () {
  const els = {
    email: document.getElementById('email-input'),
    pass: document.getElementById('password-input'),
    btn: document.getElementById('email-login-btn'),
    status: document.getElementById('auth-status'),
  };

  const state = {
    initialized: false,
    db: null,
    auth: null,
    unsub: null,
    lastAppliedAt: 0,
    savingTimer: null,
  };

  function setStatus(msg, isError = false) {
    if (!els.status) return;
    els.status.textContent = msg || '';
    els.status.style.color = isError ? '#d63d63' : 'var(--gray)';
  }

  async function ensureFirebase() {
    if (state.initialized) return;
    if (typeof firebase === 'undefined') {
      setStatus('Firebase SDK tidak ditemukan di halaman.', true);
      throw new Error('Firebase SDK missing');
    }
    if (!firebase.apps || firebase.apps.length === 0) {
      if (!window.FIREBASE_CONFIG) {
        setStatus('Firebase belum dikonfigurasi. Set window.FIREBASE_CONFIG atau inisialisasi manual.', true);
        throw new Error('Firebase config missing');
      }
      firebase.initializeApp(window.FIREBASE_CONFIG);
    }
    try {
      await firebase.firestore().enablePersistence({ synchronizeTabs: true });
    } catch (_) {
      // abaikan (misal multi-tab)
    }
    state.db = firebase.firestore();
    state.auth = firebase.auth();
    state.initialized = true;
  }

  async function signInOrSignUpEmail(email, password) {
    try {
      await state.auth.signInWithEmailAndPassword(email, password);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        await state.auth.createUserWithEmailAndPassword(email, password);
      } else {
        throw e;
      }
    }
  }

  function docRefFor(uid) {
    return state.db.collection('users').doc(uid).collection('state').doc('app');
  }

  function startSync(uid) {
    if (state.unsub) {
      try { state.unsub(); } catch (_) {}
      state.unsub = null;
    }
    state.unsub = docRefFor(uid).onSnapshot((snap) => {
      if (!snap.exists) {
        setStatus('Masuk berhasil. Menunggu data pertama…');
        return;
      }
      const payload = snap.data() || {};
      const remoteUpdatedAt = payload.lastUpdated?.toMillis?.() || 0;
      if (remoteUpdatedAt && remoteUpdatedAt <= state.lastAppliedAt) return;
      if (payload.data != null && typeof window.applyToUI === 'function') {
        try {
          window.applyToUI(payload.data);
        } catch (e) {
          console.error('applyToUI error:', e);
        }
      }
      state.lastAppliedAt = remoteUpdatedAt || Date.now();
      setStatus('Tersinkron. UID: ' + uid.slice(0, 6) + '…');
    });
  }

  function debouncedSave(fn, wait = 350) {
    clearTimeout(state.savingTimer);
    state.savingTimer = setTimeout(fn, wait);
  }

  async function doSave(payload) {
    if (!state.auth || !state.auth.currentUser) {
      setStatus('Belum masuk. Silakan login dulu.', true);
      return;
    }
    const uid = state.auth.currentUser.uid;
    try {
      await docRefFor(uid).set(
        {
          data: payload || {},
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      state.lastAppliedAt = Date.now(); // hindari echo hingga snapshot masuk
      setStatus('Tersimpan.');
    } catch (e) {
      console.error(e);
      setStatus('Gagal menyimpan: ' + (e.message || e.code || e), true);
    }
  }

  function syncSave(payload) {
    debouncedSave(() => doSave(payload));
  }

  // Ekspos API
  window.syncSave = syncSave;
  window.syncRequestInitialLoad = function () { /* no-op */ };

  // Wire UI
  if (els.btn) {
    els.btn.addEventListener('click', async () => {
      try {
        await ensureFirebase();
        const email = (els.email?.value || '').trim();
        const pass = (els.pass?.value || '').trim();
        if (!email || !pass) {
          setStatus('Email dan password wajib diisi.', true);
          return;
        }
        setStatus('Memproses…');
        await signInOrSignUpEmail(email, pass);
        const uid = state.auth.currentUser.uid;
        startSync(uid);
        setStatus('Masuk berhasil. Sinkronisasi aktif.');
      } catch (e) {
        console.error(e);
        setStatus('Gagal masuk/daftar: ' + (e.message || e.code || e), true);
      }
    });
  }

  // Auto-start jika user sudah login (misal reload)
  (async () => {
    try {
      await ensureFirebase();
      state.auth.onAuthStateChanged((user) => {
        if (user) {
          startSync(user.uid);
          setStatus('Tersinkron sebagai UID: ' + user.uid.slice(0, 6) + '…');
        }
      });
    } catch (e) {
      // sudah ditangani di ensureFirebase
    }
  })();
})();