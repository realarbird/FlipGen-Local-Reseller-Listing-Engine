import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

export default function CorsHelpModal({ isOpen, onClose, onEnableDemoMode }) {
  const [copiedCmd, setCopiedCmd] = useState(null);
  const [activeTab, setActiveTab] = useState('mac');

  if (!isOpen) return null;

  const copyCommand = (cmd, key) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const primaryCommand = 'OLLAMA_ORIGINS="*" ollama serve';
  const macRestartCommand = 'launchctl setenv OLLAMA_ORIGINS "*" && pkill -f Ollama && open -a Ollama';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cors-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs">
              <Terminal className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 id="cors-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Ollama Local Connection & CORS Setup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your browser directly to local Gemma 2 at $0 token cost
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto text-sm">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200 text-xs">Why is CORS configuration needed?</p>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-1 leading-relaxed">
                Browsers enforce Cross-Origin Resource Sharing (CORS) security. By default, Ollama only accepts requests from localhost origins. Starting Ollama with <code className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded font-mono font-semibold">OLLAMA_ORIGINS="*"</code> allows FlipGen to talk directly to your local models with zero latency and complete privacy.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
              macOS Quick Fix (Set Environment & Restart Ollama)
            </label>
            <div className="relative group">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400">
                <span className="truncate">{macRestartCommand}</span>
                <button
                  type="button"
                  onClick={() => copyCommand(macRestartCommand, 'mac-quick')}
                  className="ml-2 flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-700 shrink-0 cursor-pointer"
                >
                  {copiedCmd === 'mac-quick' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('mac')}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'mac'
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                macOS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('linux')}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'linux'
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Linux (systemd)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('win')}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'win'
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Windows (PowerShell)
              </button>
            </div>

            {activeTab === 'mac' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <p>1. Quit the Ollama icon from your top menu bar.</p>
                <p>2. Run this command in Terminal to start Ollama with CORS permissions:</p>
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-400">
                  <span>{primaryCommand}</span>
                  <button
                    type="button"
                    onClick={() => copyCommand(primaryCommand, 'mac-serve')}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-[11px] cursor-pointer"
                  >
                    {copiedCmd === 'mac-serve' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'mac-serve' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p>3. Pull the recommended Gemma 2 model:</p>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-300">
                  ollama run gemma2
                </div>
              </div>
            )}

            {activeTab === 'linux' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <p>1. Edit the systemd service configuration for Ollama:</p>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-300">
                  sudo systemctl edit ollama.service
                </div>
                <p>2. Add the environment variable block:</p>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-400">
                  [Service]<br />
                  Environment="OLLAMA_ORIGINS=*"
                </div>
                <p>3. Reload and restart systemd:</p>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-300">
                  sudo systemctl daemon-reload && sudo systemctl restart ollama
                </div>
              </div>
            )}

            {activeTab === 'win' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <p>1. Exit the Ollama background process from your system tray.</p>
                <p>2. Open PowerShell and launch Ollama with the origin flag:</p>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-400 flex items-center justify-between">
                  <span>$env:OLLAMA_ORIGINS="*"; ollama serve</span>
                  <button
                    type="button"
                    onClick={() => copyCommand('$env:OLLAMA_ORIGINS="*"; ollama serve', 'win-serve')}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-[11px] cursor-pointer"
                  >
                    {copiedCmd === 'win-serve' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'win-serve' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Evaluating on Render / Without Local Ollama?</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enable Judge Demo Mode to evaluate with realistic simulated Gemma 2 output immediately.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onEnableDemoMode();
                onClose();
              }}
              className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              Enable Judge Demo Mode
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 shrink-0">
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
