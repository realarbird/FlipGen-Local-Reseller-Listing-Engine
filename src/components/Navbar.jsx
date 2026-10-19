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
  driveState,
  onOpenDriveModal
}) {
  const isOnline = ollamaStatus.connected;

  // Authentic Google Drive icon
  const GoogleDriveIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            type="button"
            onClick={() => setActiveView('single')}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-600/20 group-hover:bg-orange-700 transition-colors">
              <Layers className="w-[18px] h-[18px]" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-slate-900 dark:text-white transition-colors">
              FlipGen
            </span>
          </button>

          {/* Discrete Engine Status Dot */}
          <button
            type="button"
            onClick={demoMode ? onToggleDemoMode : isOnline ? onOpenSettings : onOpenCorsModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
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
            <span>
              {demoMode ? 'Gemma 2 · Demo' : isOnline ? 'Gemma 2 · Ready' : 'Ollama · Offline'}
            </span>
          </button>
        </div>

        {/* Segmented Navigation Tabs */}
        <nav className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-[13px] font-medium text-slate-600 dark:text-slate-400 transition-colors">
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

        {/* Right Actions, Dark Mode Toggle & Google Drive Connect */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Quick Demo Mode Badge */}
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

          {/* Theme Toggle (Dark / Light Mode) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px] text-amber-400" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>

          {/* Help & CORS Guide */}
          <button
            type="button"
            onClick={onOpenCorsModal}
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Help & CORS Guide"
            aria-label="Help"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Settings & Model Selection"
            aria-label="Settings"
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5"></div>

          {/* Google Drive Connect Button in place of profile picture (JD) */}
          {driveState?.isConnected ? (
            <button
              type="button"
              onClick={onOpenDriveModal}
              className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs group"
              title="Connected to Google Drive. Click to manage cloud sync."
            >
              {driveState.user?.picture ? (
                <img
                  src={driveState.user.picture}
                  alt={driveState.user.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {driveState.user?.given_name?.[0] || driveState.user?.name?.[0] || 'G'}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {driveState.user?.given_name || driveState.user?.name?.split(' ')[0] || 'Drive'}
                </span>
                {driveState.isSyncing ? (
                  <RotateCw className="w-3 h-3 text-orange-600 animate-spin" />
                ) : (
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenDriveModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:border-orange-500/40 transition-all cursor-pointer group"
              title="Connect Google Drive to sync listings, ledger archives, and preferences across devices"
            >
              <GoogleDriveIcon />
              <span className="hidden sm:inline">Connect Drive</span>
              <span className="sm:hidden">Sync</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
