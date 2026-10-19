import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut as fbSignOut, 
  GoogleAuthProvider, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { getArchiveItems, importArchiveItemsFromCloud } from './ledgerService';

function sanitizeData(data) {
  if (data === undefined) return null;
  return JSON.parse(JSON.stringify(data));
}

let currentLastError = null;

const AUTH_STORAGE_KEY = 'flipgen_auth_user';
const LAST_SYNC_KEY = 'flipgen_last_sync_timestamp';
const CLOUD_MOCK_STORAGE = 'flipgen_cloud_mock_storage';
const FIREBASE_CONFIG_STORAGE = 'flipgen_firebase_custom_config';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDzdj8ZVzySsTk0-UnvimcLPrNw2yjwd0U",
  authDomain: "flipgen-reseller-engine.firebaseapp.com",
  projectId: "flipgen-reseller-engine",
  storageBucket: "flipgen-reseller-engine.firebasestorage.app",
  messagingSenderId: "723388573425",
  appId: "1:723388573425:web:97736acbb73fc56cc32b50"
};

export function getFirebaseConfig() {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  try {
    const custom = localStorage.getItem(FIREBASE_CONFIG_STORAGE);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
  }

  return envConfig;
}

export function saveCustomFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE);
  } else {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE, JSON.stringify(config));
  }
}

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;

export function getFirebaseInstances() {
  const config = getFirebaseConfig();
  const isConfigured = Boolean(config.apiKey && config.projectId);

  if (!isConfigured) {
    return { isConfigured: false, app: null, auth: null, db: null };
  }

  if (!firebaseApp) {
    try {
      firebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);
      firebaseAuth = getAuth(firebaseApp);
      firestoreDb = getFirestore(firebaseApp);
    } catch (err) {
      return { isConfigured: false, app: null, auth: null, db: null, error: err };
    }
  }

  return { isConfigured: true, app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
}

const syncListeners = new Set();

function notifyListeners(state) {
  syncListeners.forEach((listener) => {
    try {
      listener(state);
    } catch (err) {
    }
  });
}

export function getSyncState() {
  let user = null;
  let isDemo = false;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      user = parsed.user || null;
      isDemo = Boolean(parsed.isDemo);
    }
  } catch (e) {
    user = null;
  }

  const { isConfigured } = getFirebaseInstances();
  const lastSync = localStorage.getItem(LAST_SYNC_KEY) || null;

  return {
    isConnected: !!user,
    user: user,
    isDemo: isDemo,
    lastSyncedAt: lastSync,
    isSyncing: false,
    lastError: currentLastError,
    isFirebaseConfigured: isConfigured
  };
}

export function subscribeToSync(listener) {
  syncListeners.add(listener);
  listener(getSyncState());
  return () => syncListeners.delete(listener);
}

export async function signInWithGoogle() {
  const { isConfigured, auth } = getFirebaseInstances();

  if (!isConfigured || !auth) {
    throw new Error('Firebase is not yet configured with API keys. You can add them in Settings or use the 1-Click Instant Demo Account.');
  }

  notifyListeners({ ...getSyncState(), isSyncing: true });

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    const userData = {
      uid: fbUser.uid,
      name: fbUser.displayName || 'Google User',
      email: fbUser.email || '',
      picture: fbUser.photoURL || '',
      given_name: fbUser.displayName ? fbUser.displayName.split(' ')[0] : 'User'
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: userData, isDemo: false }));
    const now = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, now);

    notifyListeners({
      isConnected: true,
      user: userData,
      isDemo: false,
      lastSyncedAt: now,
      isSyncing: false,
      isFirebaseConfigured: true
    });

    return userData;
  } catch (err) {
    notifyListeners({ ...getSyncState(), isSyncing: false });
    throw err;
  }
}

export async function signInWithDemoAccount() {
  const demoUser = {
    uid: 'demo-reseller-12345',
    name: 'Alex Reseller',
    email: 'alex.reseller@gmail.com',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    given_name: 'Alex'
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: demoUser, isDemo: true }));
  const now = new Date().toISOString();
  localStorage.setItem(LAST_SYNC_KEY, now);

  notifyListeners({
    ...getSyncState(),
    isConnected: true,
    user: demoUser,
    isDemo: true,
    lastSyncedAt: now,
    isSyncing: true
  });

  await new Promise((r) => setTimeout(r, 400));

  notifyListeners({
    ...getSyncState(),
    isConnected: true,
    user: demoUser,
    isDemo: true,
    lastSyncedAt: now,
    isSyncing: false
  });

  return demoUser;
}

export async function signOutAccount() {
  const { auth } = getFirebaseInstances();
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch (e) {
    }
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LAST_SYNC_KEY);

  notifyListeners({
    isConnected: false,
    user: null,
    isDemo: false,
    lastSyncedAt: null,
    isSyncing: false,
    isFirebaseConfigured: getSyncState().isFirebaseConfigured
  });
}

export async function pullLatestFromCloud(options = {}) {
  const { throwOnError = false } = options;
  const state = getSyncState();
  if (!state.isConnected || !state.user) return null;

  notifyListeners({ ...state, isSyncing: true, lastError: null });

  try {
    let cloudData = null;

    if (state.isDemo) {
      await new Promise((r) => setTimeout(r, 200));
      const raw = localStorage.getItem(CLOUD_MOCK_STORAGE);
      if (raw) {
        cloudData = JSON.parse(raw);
      }
    } else {
      const { db } = getFirebaseInstances();
      if (db && state.user.uid) {
        let rootData = null;
        let subData = null;
        let fetchErr = null;

        try {
          const rootRef = doc(db, 'users', state.user.uid);
          const rootSnap = await getDoc(rootRef);
          if (rootSnap.exists()) {
            rootData = rootSnap.data();
          }
        } catch (e) {
          fetchErr = e;
        }

        try {
          const docRef = doc(db, 'users', state.user.uid, 'flipgen', 'data');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            subData = docSnap.data();
          }
        } catch (e) {
          if (!fetchErr) fetchErr = e;
        }

        if (subData && rootData) {
          const rootTime = new Date(rootData.syncedAt || 0).getTime();
          const subTime = new Date(subData.syncedAt || 0).getTime();
          cloudData = subTime >= rootTime ? subData : rootData;
        } else {
          cloudData = subData || rootData || null;
        }

        if (!cloudData && fetchErr && !rootData && !subData) {
          if (fetchErr.code === 'permission-denied' || fetchErr.message?.includes('permission')) {
            throw fetchErr;
          }
        }
      }
    }

    const now = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, now);
    currentLastError = null;

    notifyListeners({
      ...getSyncState(),
      isSyncing: false,
      lastSyncedAt: now,
      lastError: null
    });

    return cloudData;
  } catch (err) {
    currentLastError = err.message || 'Failed to pull cloud data';
    notifyListeners({ ...state, isSyncing: false, lastError: currentLastError });
    if (throwOnError) throw err;
    return null;
  }
}

export async function pushToCloud(payload, options = {}) {
  const { throwOnError = false } = options;
  const state = getSyncState();
  if (!state.isConnected || !state.user) return false;

  notifyListeners({ ...state, isSyncing: true, lastError: null });

  try {
    const rawArchive = payload && 'archive' in payload ? payload.archive : getArchiveItems();
    const fullPayload = {
      ...payload,
      archive: rawArchive,
      archiveCount: Array.isArray(rawArchive) ? rawArchive.length : 0,
      appName: 'FlipGen Reseller Engine',
      version: '1.0.0',
      syncedAt: new Date().toISOString(),
      userEmail: state.user.email,
      displayName: state.user.name,
      uid: state.user.uid
    };

    const cleanPayload = sanitizeData(fullPayload);

    if (state.isDemo) {
      await new Promise((r) => setTimeout(r, 300));
      localStorage.setItem(CLOUD_MOCK_STORAGE, JSON.stringify(cleanPayload));
    } else {
      const { db } = getFirebaseInstances();
      if (db && state.user.uid) {
        let rootSuccess = false;
        let subSuccess = false;
        let rootErr = null;
        let subErr = null;

        try {
          const rootRef = doc(db, 'users', state.user.uid);
          await setDoc(rootRef, cleanPayload, { merge: true });
          rootSuccess = true;
        } catch (e) {
          rootErr = e;
        }

        try {
          const docRef = doc(db, 'users', state.user.uid, 'flipgen', 'data');
          await setDoc(docRef, cleanPayload, { merge: true });
          subSuccess = true;
        } catch (e) {
          subErr = e;
        }

        if (!rootSuccess && !subSuccess) {
          throw (rootErr || subErr || new Error('Failed to save to Firestore. Check permissions.'));
        }
      }
    }

    const now = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, now);
    currentLastError = null;

    notifyListeners({
      ...getSyncState(),
      isSyncing: false,
      lastSyncedAt: now,
      lastError: null
    });

    return true;
  } catch (err) {
    currentLastError = err.message || 'Failed to sync with cloud';
    notifyListeners({ ...state, isSyncing: false, lastError: currentLastError });
    if (throwOnError) throw err;
    return false;
  }
}

export async function syncArchiveWithCloud() {
  const state = getSyncState();
  if (!state.isConnected) {
    throw new Error('Please connect your Google account to sync your archive.');
  }

  notifyListeners({ ...state, isSyncing: true, lastError: null });

  try {
    const cloudData = await pullLatestFromCloud({ throwOnError: true });
    let merged = getArchiveItems();
    if (cloudData && Array.isArray(cloudData.archive)) {
      merged = importArchiveItemsFromCloud(cloudData.archive);
    }
    await pushToCloud({ archive: merged }, { throwOnError: true });
    return { success: true, items: merged };
  } catch (err) {
    currentLastError = err.message || 'Sync failed';
    notifyListeners({ ...getSyncState(), isSyncing: false, lastError: currentLastError });
    throw err;
  }
}

export function listenToLiveCloudUpdates(onUpdateCallback) {
  const state = getSyncState();
  if (!state.isConnected || !state.user || state.isDemo) {
    return () => {};
  }

  const { db } = getFirebaseInstances();
  if (!db || !state.user.uid) {
    return () => {};
  }

  let unsubSub = null;
  let unsubRoot = null;

  try {
    const rootRef = doc(db, 'users', state.user.uid);
    unsubRoot = onSnapshot(rootRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && (Array.isArray(data.archive) || data.baseUrl || data.theme)) {
          onUpdateCallback(data);
        }
      }
    }, () => {});
  } catch (e) {
  }

  try {
    const docRef = doc(db, 'users', state.user.uid, 'flipgen', 'data');
    unsubSub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && (Array.isArray(data.archive) || data.baseUrl || data.theme)) {
          onUpdateCallback(data);
        }
      }
    }, () => {});
  } catch (e) {
  }

  return () => {
    if (typeof unsubRoot === 'function') unsubRoot();
    if (typeof unsubSub === 'function') unsubSub();
  };
}

export function initAuthObserver(onUserChange) {
  const { auth, isConfigured } = getFirebaseInstances();
  if (!isConfigured || !auth) return () => {};

  return onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      const userData = {
        uid: fbUser.uid,
        name: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        picture: fbUser.photoURL || '',
        given_name: fbUser.displayName ? fbUser.displayName.split(' ')[0] : 'User'
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: userData, isDemo: false }));
      notifyListeners(getSyncState());
      if (onUserChange) onUserChange(userData);
    }
  });
}
