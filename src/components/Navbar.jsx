import React from 'react';
import { 
  Layers, 
  HelpCircle, 
  SlidersHorizontal, 
  Sparkles, 
  Sun, 
  Moon, 
  RotateCw, 
  Check, 
  Cloud
} from 'lucide-react';

export default function Navbar({
  ollamaStatus,
  demoMode,
  onToggleDemoMode,
  onOpenCorsModal,
  onOpenSettings,
  activeView,
  setActiveView,
  theme,
  onToggleTheme,
  syncState,
  driveState,
  onOpenSyncModal,
  onOpenDriveModal
}) {
  const isOnline = ollamaStatus.connected;
  const activeSyncState = syncState || driveState;
  const handleOpenSync = onOpenSyncModal || onOpenDriveModal;

  const GoogleLogo = () => (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <button 
            type="button"
            onClick={() => setActiveView('single')}
            className="flex items-center gap-2 sm:gap-2.5 group text-left cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-600/20 group-hover:bg-orange-700 transition-colors">
              <Layers className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className="font-bold text-base sm:text-[17px] tracking-tight text-slate-900 dark:text-white transition-colors">
              FlipGen
            </span>
          </button>

          <button
            type="button"
            onClick={demoMode ? onToggleDemoMode : isOnline ? onOpenSettings : onOpenCorsModal}
            className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            title={
              demoMode
                ? 'Judge Demo Mode active (instant simulated inference). Click to switch to local Ollama.'
                : isOnline
                ? 'Connected to local Ollama runtime. Click to adjust settings.'
                : 'Local Ollama not detected. Click for CORS setup instructions.'
            }
          >
            <span 
              className={`w-1.5 h-1.5 rounded-full ${
                demoMode 
                  ? 'bg-amber-500 animate-pulse' 
                  : isOnline 
                  ? 'bg-emerald-500 animate-pulse' 
                  : 'bg-rose-500'
              }`} 
            />
            <span className="hidden sm:inline">
              {demoMode ? 'Gemma 2 · Demo' : isOnline ? 'Gemma 2 · Ready' : 'Ollama · Offline'}
            </span>
            <span className="sm:hidden">
              {demoMode ? 'Demo' : isOnline ? 'Ready' : 'Offline'}
            </span>
          </button>
        </div>

        <nav className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-[13px] font-medium text-slate-600 dark:text-slate-400 transition-colors">
          <button
            type="button"
            onClick={() => setActiveView('single')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
              activeView === 'single'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Single Lister
          </button>
          <button
            type="button"
            onClick={() => setActiveView('batch')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
              activeView === 'batch'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Batch Processing
          </button>
          <button
            type="button"
            onClick={() => setActiveView('archive')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
              activeView === 'archive'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sales Archive
          </button>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleDemoMode}
            className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
              demoMode
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle Judge Demo Mode vs Local Ollama"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{demoMode ? 'Judge Demo' : 'Local Ollama'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCorsModal}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Help & CORS Guide"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Settings & Model Selection"
            aria-label="Settings"
          >
            <SlidersHorizontal className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5"></div>

          {activeSyncState?.isConnected ? (
            <button
              type="button"
              onClick={handleOpenSync}
              className="inline-flex items-center gap-1.5 pl-1.5 pr-2 sm:pr-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs group"
              title="Connected with Google. Click to manage real-time cloud sync."
            >
              {activeSyncState.user?.picture ? (
                <img
                  src={activeSyncState.user.picture}
                  alt={activeSyncState.user.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700"
                />
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {activeSyncState.user?.given_name?.[0] || activeSyncState.user?.name?.[0] || 'G'}
                </div>
              )}
              <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {activeSyncState.user?.given_name || activeSyncState.user?.name?.split(' ')[0] || 'Google'}
                </span>
                {activeSyncState.isSyncing ? (
                  <RotateCw className="w-3 h-3 text-orange-600 animate-spin" />
                ) : (
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenSync}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:border-orange-500/40 transition-all cursor-pointer group"
              title="1-Click Google Sign-In to sync listings, ledger archives, and preferences across devices"
            >
              <GoogleLogo />
              <span className="hidden sm:inline">Google Sync</span>
              <span className="sm:hidden text-[11px]">Sync</span>
            </button>
          )}

        </div>

      </div>

      <div className="md:hidden border-t border-slate-200/70 dark:border-slate-800/70 px-3 py-1.5 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md">
        <nav className="flex items-center w-full p-1 bg-slate-200/60 dark:bg-slate-950 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setActiveView('single')}
            className={`flex-1 py-1.5 px-2 text-center rounded-md transition-all cursor-pointer ${
              activeView === 'single'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Single Lister
          </button>
          <button
            type="button"
            onClick={() => setActiveView('batch')}
            className={`flex-1 py-1.5 px-2 text-center rounded-md transition-all cursor-pointer ${
              activeView === 'batch'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Batch
          </button>
          <button
            type="button"
            onClick={() => setActiveView('archive')}
            className={`flex-1 py-1.5 px-2 text-center rounded-md transition-all cursor-pointer ${
              activeView === 'archive'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Archive
          </button>
        </nav>
      </div>
    </header>
  );
}
