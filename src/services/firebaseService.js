// Firebase Authentication & Cloud Firestore Synchronization Service for FlipGen
// Provides true 1-click Google Sign-in and real-time cross-device sync between
// laptops (running local Ollama at $0 cost) and mobile phones (viewing listings & inventory).

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

const AUTH_STORAGE_KEY = 'flipgen_auth_user';
const LAST_SYNC_KEY = 'flipgen_last_sync_timestamp';
const CLOUD_MOCK_STORAGE = 'flipgen_cloud_mock_storage';
const FIREBASE_CONFIG_STORAGE = 'flipgen_firebase_custom_config';

// Default project configuration for FlipGen Reseller Engine
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDzdj8ZVzySsTk0-UnvimcLPrNw2yjwd0U",
  authDomain: "flipgen-reseller-engine.firebaseapp.com",
  projectId: "flipgen-reseller-engine",
  storageBucket: "flipgen-reseller-engine.firebasestorage.app",
  messagingSenderId: "723388573425",
  appId: "1:723388573425:web:97736acbb73fc56cc32b50"
};

// 1. Read Firebase Config from Vite environment, LocalStorage override, or Default
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
    // Ignore invalid json
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

// 2. Initialize Firebase instances lazily and safely
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
      console.error('Firebase initialization error:', err);
      return { isConfigured: false, app: null, auth: null, db: null, error: err };
    }
  }

  return { isConfigured: true, app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
}

// 3. State Subscription
const syncListeners = new Set();

function notifyListeners(state) {
  syncListeners.forEach((listener) => {
    try {
      listener(state);
    } catch (err) {
      console.error('Error notifying sync listener:', err);
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
    isFirebaseConfigured: isConfigured
  };
}

export function subscribeToSync(listener) {
  syncListeners.add(listener);
  listener(getSyncState());
  return () => syncListeners.delete(listener);
}

// 4. One-Click Google Sign In
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

// 5. One-Click Instant Demo Account (Sandbox Sync)
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

  // Simulated roundtrip
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

// 6. Sign Out
export async function signOutAccount() {
  const { auth } = getFirebaseInstances();
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout note:', e);
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

// 7. Pull Latest Data from Cloud on Startup
export async function pullLatestFromCloud() {
  const state = getSyncState();
  if (!state.isConnected || !state.user) return null;

  notifyListeners({ ...state, isSyncing: true });

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
        const docRef = doc(db, 'users', state.user.uid, 'flipgen', 'data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          cloudData = docSnap.data();
        }
      }
    }

    const now = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, now);

    notifyListeners({
      ...getSyncState(),
      isSyncing: false,
      lastSyncedAt: now
    });

    return cloudData;
  } catch (err) {
    console.error('Failed to pull data from cloud:', err);
    notifyListeners({ ...state, isSyncing: false });
    return null;
  }
}

// 8. Push Local Updates to Cloud (Preferences, Ollama URL, Theme, Sales Archive)
export async function pushToCloud(payload) {
  const state = getSyncState();
  if (!state.isConnected || !state.user) return false;

  notifyListeners({ ...state, isSyncing: true });

  try {
    const fullPayload = {
      ...payload,
      appName: 'FlipGen Reseller Engine',
      version: '1.0.0',
      syncedAt: new Date().toISOString(),
      userEmail: state.user.email
    };

    if (state.isDemo) {
      await new Promise((r) => setTimeout(r, 300));
      localStorage.setItem(CLOUD_MOCK_STORAGE, JSON.stringify(fullPayload));
    } else {
      const { db } = getFirebaseInstances();
      if (db && state.user.uid) {
        const docRef = doc(db, 'users', state.user.uid, 'flipgen', 'data');
        await setDoc(docRef, fullPayload, { merge: true });
      }
    }

    const now = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, now);

    notifyListeners({
      ...getSyncState(),
      isSyncing: false,
      lastSyncedAt: now
    });

    return true;
  } catch (err) {
    console.error('Failed to push to cloud:', err);
    notifyListeners({ ...state, isSyncing: false });
    return false;
  }
}

// 9. Real-Time Snapshot Listener for Instant Cross-Device Sync (Phone ↔ Laptop)
export function listenToLiveCloudUpdates(onUpdateCallback) {
  const state = getSyncState();
  if (!state.isConnected || !state.user || state.isDemo) {
    return () => {};
  }

  const { db } = getFirebaseInstances();
  if (!db || !state.user.uid) {
    return () => {};
  }

  try {
    const docRef = doc(db, 'users', state.user.uid, 'flipgen', 'data');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onUpdateCallback(data);
      }
    }, (error) => {
      console.warn('Firestore live listener note:', error);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach Firestore live listener:', err);
    return () => {};
  }
}

// 10. Auto-detect auth state changes from Firebase
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
