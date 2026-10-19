import React from 'react';
import { 
  Zap, 
  Terminal, 
  Settings, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ShoppingBag,
  ExternalLink 
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Hackathon Tag */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">FlipGen</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    Gemma 2
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Local Reseller Listing Engine
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold">Hacktoberfest 2026</span>
              <span className="text-slate-600">•</span>
              <span>Wk 2 Side Hustle</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveView('single')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeView === 'single'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Single Item</span>
            </button>
            <button
              onClick={() => setActiveView('batch')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeView === 'batch'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1.5">
                <span>Batch CSV</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">$0 Cost</span>
              </div>
            </button>
          </div>

          {/* Status, Demo Mode & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Status Pill */}
            {demoMode ? (
              <div 
                onClick={onToggleDemoMode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium cursor-pointer hover:bg-amber-500/20 transition-all"
                title="Simulated Gemma 2 responses active. Click to switch to local Ollama."
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Judge Demo Mode</span>
                <span className="md:hidden">Demo</span>
              </div>
            ) : isOnline ? (
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
                title="Connected to local Ollama runtime"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden md:inline">Ollama Online</span>
                <span className="md:hidden">Online</span>
              </div>
            ) : (
              <button
                onClick={onOpenCorsModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium hover:bg-rose-500/20 transition-all cursor-pointer"
                title="Local Ollama not detected. Click for terminal CORS guide or toggle demo mode."
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Ollama Offline (CORS)</span>
                <span className="md:hidden">Offline</span>
              </button>
            )}

            {/* Quick Demo Mode Toggle Button */}
            <button
              onClick={onToggleDemoMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                demoMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Toggle simulated Gemma 2 engine for Render judges"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demo Mode</span>
            </button>

            {/* Terminal CORS Guide Button */}
            <button
              onClick={onOpenCorsModal}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Ollama CORS terminal instructions"
              aria-label="CORS Setup Guide"
            >
              <Terminal className="w-4 h-4" />
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Settings & Model Selection"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
