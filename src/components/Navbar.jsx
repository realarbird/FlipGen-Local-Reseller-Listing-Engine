import React from 'react';
import { 
  Layers, 
  HelpCircle, 
  SlidersHorizontal, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Navbar({
  ollamaStatus,
  demoMode,
  onToggleDemoMode,
  onOpenCorsModal,
  onOpenSettings,
  activeView,
  setActiveView
}) {
  const isOnline = ollamaStatus.connected;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => setActiveView('single')}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-600/20 group-hover:bg-orange-700 transition-colors">
              <Layers className="w-[18px] h-[18px]" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-slate-900">
              FlipGen
            </span>
          </button>

          {/* Discrete Engine Status Dot */}
          <button
            type="button"
            onClick={demoMode ? onToggleDemoMode : isOnline ? onOpenSettings : onOpenCorsModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 text-xs font-medium text-slate-600 transition-colors cursor-pointer"
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
        <nav className="flex items-center p-1 bg-slate-100 rounded-lg text-[13px] font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveView('single')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-md transition-all ${
              activeView === 'single'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Lister
          </button>
          <button
            type="button"
            onClick={() => setActiveView('batch')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-md transition-all ${
              activeView === 'batch'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch Processing
          </button>
          <button
            type="button"
            onClick={() => setActiveView('archive')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-md transition-all ${
              activeView === 'archive'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Archive
          </button>
        </nav>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Mode Badge for Judges */}
          <button
            type="button"
            onClick={onToggleDemoMode}
            className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
              demoMode
                ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle Judge Demo Mode vs Local Ollama"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{demoMode ? 'Judge Demo Mode' : 'Local Ollama'}</span>
          </button>

          {/* Help & CORS Guide */}
          <button
            type="button"
            onClick={onOpenCorsModal}
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Help, Shortcuts & CORS Guide"
            aria-label="Help"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Settings & Model Selection"
            aria-label="Settings"
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" />
          </button>

          <div className="h-4 w-px bg-slate-200"></div>

          {/* User Profile Avatar */}
          <div 
            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shadow-sm select-none"
            title="Signed in as Reseller Desk (JD)"
          >
            JD
          </div>
        </div>

      </div>
    </header>
  );
}
