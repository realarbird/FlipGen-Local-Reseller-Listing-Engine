import React, { useState } from 'react';
import { 
  X, 
  RotateCw, 
  Check, 
  Cloud, 
  Smartphone, 
  Laptop, 
  ArrowRightLeft, 
  LogOut, 
  Sparkles, 
  FileJson, 
  ShieldCheck, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { 
  connectDemoGoogleAccount, 
  connectRealGoogleAccount, 
  disconnectGoogleAccount, 
  syncFromGoogleDrive, 
  syncToGoogleDrive 
} from '../services/googleDriveService';

export default function GoogleDriveModal({
  isOpen,
  onClose,
  driveState,
  onManualSync,
  currentPreferences = {}
}) {
  const [clientId, setClientId] = useState(driveState?.clientId || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [justSynced, setJustSynced] = useState(false);

  if (!isOpen) return null;

  const handleDemoConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      await connectDemoGoogleAccount();
      // Perform initial push of current preferences to drive
      await onManualSync();
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect demo Google account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRealConnect = async () => {
    if (!clientId.trim()) {
      setErrorMessage('Please enter a Google Cloud OAuth Client ID.');
      return;
    }
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      await connectRealGoogleAccount(clientId.trim());
      await onManualSync();
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authorize with Google Drive');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncNow = async () => {
    setErrorMessage(null);
    try {
      await onManualSync();
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Manual sync failed');
    }
  };

  const handleDisconnect = () => {
    disconnectGoogleAccount();
  };

  // Google Drive custom SVG icon with authentic colors
  const GoogleDriveIcon = () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <GoogleDriveIcon />
            </div>
            <div>
              <h2 id="drive-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Google Drive Cloud Sync
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cross-device sync for your listings, archive, and preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Cross-Device Value Proposition Banner */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Seamless Laptop ↔ Phone Reseller Workflow
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Run local Gemma 2 models at <strong>$0 token cost</strong> on your laptop at home, then access your listings, pricing comps, and inventory archive from your mobile phone while out thrift sourcing.
              </p>
            </div>
          </div>

          {/* Connected State View */}
          {driveState?.isConnected ? (
            <div className="space-y-4">
              
              {/* Account Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {driveState.user?.picture ? (
                    <img
                      src={driveState.user.picture}
                      alt={driveState.user.name}
                      className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {driveState.user?.name?.[0] || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {driveState.user?.name}
                      </span>
                      {driveState.isDemo && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                          Demo
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                      {driveState.user?.email}
                    </span>
                  </div>
                </div>

                {/* Sync Status Badge */}
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Connected</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {driveState.lastSyncedAt
                      ? `Synced ${new Date(driveState.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Syncing on launch'}
                  </span>
                </div>
              </div>

              {/* Synced Elements Breakdown */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs space-y-2">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 block">
                  Cloud Synced Elements (Auto-saved)
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
                  <span>Drive File: <code className="font-mono text-slate-700 dark:text-slate-300">flipgen_reseller_data.json</code></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Auto-sync on page open</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect Account</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={driveState.isSyncing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {driveState.isSyncing ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : justSynced ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Synced to Drive!</span>
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
            /* Disconnected State View */
            <div className="space-y-4">
              
              {/* Option 1: Instant 1-Click Demo Google Account */}
              <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-xs text-orange-950 dark:text-orange-200">
                      1-Click Instant Demo Google Account
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-orange-900/80 dark:text-orange-200/80 leading-relaxed">
                  Evaluate complete Google Drive sync instantly as <strong>Alex Reseller</strong> with zero GCP configuration required.
                </p>
                <button
                  type="button"
                  onClick={handleDemoConnect}
                  disabled={isConnecting}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <GoogleDriveIcon />
                  <span>Connect with 1-Click Demo Account</span>
                </button>
              </div>

              {/* Option 2: Real Google OAuth 2.0 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-3">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Connect Real Google Account (Custom GCP Client ID)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Provide a Google Cloud OAuth 2.0 Web Client ID with Drive scope.
                  </p>
                </div>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600"
                />
                <button
                  type="button"
                  onClick={handleRealConnect}
                  disabled={isConnecting || !clientId.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  <GoogleDriveIcon />
                  <span>Authorize with Google OAuth</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
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
