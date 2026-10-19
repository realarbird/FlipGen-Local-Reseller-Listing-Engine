import React, { useState } from 'react';
import { 
  X, 
  RotateCw, 
  Check, 
  Smartphone, 
  Laptop, 
  ArrowRightLeft, 
  LogOut, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Key,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithDemoAccount, 
  signOutAccount, 
  pushToCloud,
  getFirebaseConfig,
  saveCustomFirebaseConfig
} from '../services/firebaseService';

export default function GoogleSyncModal({
  isOpen,
  onClose,
  syncState,
  onManualSync,
  currentPreferences = {}
}) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [justSynced, setJustSynced] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  const currentConfig = getFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');

  if (!isOpen) return null;

  const GoogleLogo = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );

  const handle1ClickGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      if (!syncState.isFirebaseConfigured && !apiKey.trim()) {
        setShowConfigDrawer(true);
        setErrorMessage('Firebase configuration keys not found in .env. Enter your Firebase project keys below or use the 1-Click Instant Demo Account.');
        setIsSigningIn(false);
        return;
      }

      await signInWithGoogle();
      try {
        await onManualSync();
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 2000);
      } catch (syncErr) {
        if (syncErr.code === 'permission-denied' || syncErr.message?.includes('permission')) {
          setErrorMessage('Signed in to Google! Note: Please ensure your firestore.rules are published in Firebase Console to allow cloud reads/writes.');
        } else {
          setErrorMessage(syncErr.message || 'Initial cloud sync had an issue.');
        }
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('Popup blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage('Google Sign-In is not enabled yet in Firebase Console. Go to Authentication > Sign-in method, click Google, toggle Enable, and click Save.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(`Firebase: Domain "${window.location.hostname}" is not authorized. In Firebase Console, go to Authentication > Settings > Authorized domains and add "${window.location.hostname}".`);
      } else if (err.code === 'auth/network-request-failed') {
        setErrorMessage('Network request failed. Please check your internet connection.');
      } else {
        setErrorMessage(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      await signInWithDemoAccount();
      await onManualSync();
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect demo account');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSaveConfig = () => {
    if (!apiKey.trim() || !projectId.trim()) {
      setErrorMessage('API Key and Project ID are required for Firebase.');
      return;
    }
    saveCustomFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      appId: appId.trim()
    });
    setErrorMessage(null);
    setShowConfigDrawer(false);
    window.location.reload();
  };

  const handleSyncNow = async () => {
    setErrorMessage(null);
    try {
      await onManualSync();
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2000);
    } catch (err) {
      if (err.code === 'permission-denied' || err.message?.includes('permission')) {
        setErrorMessage('Sync permission denied. In Firebase Console, publish firestore.rules allowing authenticated users to read/write /users/{userId}.');
      } else {
        setErrorMessage(err.message || 'Sync failed');
      }
    }
  };

  const handleSignOut = async () => {
    await signOutAccount();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-sync-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <GoogleLogo />
            </div>
            <div>
              <h2 id="google-sync-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Google Cloud Sync
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                1-Click authentication & real-time cross-device sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-sm flex-1 overflow-y-auto">
          {(errorMessage || syncState.lastError) && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
              {errorMessage || syncState.lastError}
            </div>
          )}

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Laptop (Local Gemma 2) ↔ Phone Inventory Companion
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Run local Gemma 2 models at <strong>$0 token cost</strong> on your laptop at home, then access your listings, inventory ledger, and dark/light mode from your mobile phone while out thrift sourcing.
              </p>
            </div>
          </div>

          {syncState?.isConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {syncState.user?.picture ? (
                    <img
                      src={syncState.user.picture}
                      alt={syncState.user.name}
                      className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {syncState.user?.name?.[0] || 'G'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {syncState.user?.name}
                      </span>
                      {syncState.isDemo && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                          Demo Sandbox
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                      {syncState.user?.email}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {syncState.lastError ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                      <span>Sync Warning</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Live Synced</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {syncState.lastSyncedAt
                      ? `Synced ${new Date(syncState.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Syncing on open'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs space-y-2">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 block">
                  Synchronized Items (Real-Time Auto Sync)
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>Theme: <strong>{currentPreferences.theme || 'Light'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Host: <strong>{currentPreferences.baseUrl?.replace('http://', '') || 'localhost:11434'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Archive: <strong>{currentPreferences.archiveCount || 0} specimens</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>Model: <strong>{currentPreferences.model || 'gemma2'}</strong></span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Storage: <code className="font-mono text-slate-700 dark:text-slate-300">Firestore Cloud</code></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Auto-sync on page open</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={syncState.isSyncing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {syncState.isSyncing ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : justSynced ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Synced!</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Sync Now</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-3">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    1-Click Google Authentication
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Click below to sign in with your Google account. No manual GCP project or developer console setup required.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handle1ClickGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  <GoogleLogo />
                  <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-xs text-orange-950 dark:text-orange-200">
                      1-Click Instant Demo Account
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                    Judge / Offline Ready
                  </span>
                </div>
                <p className="text-xs text-orange-900/80 dark:text-orange-200/80 leading-relaxed">
                  Evaluate cross-device sync immediately without signing into Google. Uses sandboxed cloud storage.
                </p>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  disabled={isSigningIn}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <GoogleLogo />
                  <span>Test with 1-Click Demo Account</span>
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5" />
                    <span>Custom Firebase Configuration (Optional)</span>
                  </div>
                  {showConfigDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showConfigDrawer && (
                  <div className="p-4 bg-white dark:bg-slate-900 space-y-3 text-xs border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-100">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      If you're deploying your own instance, provide your Firebase Web App credentials or put them in <code className="font-mono text-slate-700 dark:text-slate-300">.env</code>:
                    </p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          API Key (VITE_FIREBASE_API_KEY)
                        </label>
                        <input
                          type="text"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Project ID (VITE_FIREBASE_PROJECT_ID)
                        </label>
                        <input
                          type="text"
                          value={projectId}
                          onChange={(e) => setProjectId(e.target.value)}
                          placeholder="flipgen-reseller"
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveConfig}
                      className="w-full py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs"
                    >
                      Save Configuration
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
