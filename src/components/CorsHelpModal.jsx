import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function CorsHelpModal({ isOpen, onClose, onEnableDemoMode }) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState('mac');

  if (!isOpen) return null;

  const copyCommand = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const primaryCommand = 'OLLAMA_ORIGINS="*" ollama serve';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cors-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cors-modal-title" className="text-lg font-semibold text-white">
                Ollama Local Connection & CORS Setup
              </h2>
              <p className="text-xs text-slate-400">
                Connect your browser to local Gemma 2 at $0 token cost
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick callout */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-300">Why is this needed?</p>
              <p className="text-xs text-amber-200/90 mt-1">
                Browsers enforce Cross-Origin Resource Sharing (CORS) security. By default, Ollama only accepts requests from localhost origins. Running with <code className="bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-200 font-mono">OLLAMA_ORIGINS="*"</code> allows FlipGen (hosted on Render or local port) to talk directly to your local models.
              </p>
            </div>
          </div>

          {/* Recommended quick command */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Fastest Solution: Start Ollama with CORS
            </label>
            <div className="relative group">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-emerald-400">
                <span>{primaryCommand}</span>
                <button
                  onClick={() => copyCommand(primaryCommand)}
                  className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
                >
                  {copiedCmd ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
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

          {/* OS-specific tabs */}
          <div>
            <div className="flex gap-2 border-b border-slate-800 mb-3 text-xs">
              <button
                onClick={() => setActiveTab('mac')}
                className={`pb-2 px-1 font-medium transition-colors border-b-2 ${
                  activeTab === 'mac'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                macOS
              </button>
              <button
                onClick={() => setActiveTab('linux')}
                className={`pb-2 px-1 font-medium transition-colors border-b-2 ${
                  activeTab === 'linux'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Linux (systemd)
              </button>
              <button
                onClick={() => setActiveTab('windows')}
                className={`pb-2 px-1 font-medium transition-colors border-b-2 ${
                  activeTab === 'windows'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Windows
              </button>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
              {activeTab === 'mac' && (
                <>
                  <p className="text-slate-400"># 1. Quit the Ollama menu bar app</p>
                  <p className="text-slate-400"># 2. In Terminal, run:</p>
                  <p className="text-emerald-400 font-semibold">launchctl setenv OLLAMA_ORIGINS "*"</p>
                  <p className="text-slate-400"># 3. Restart Ollama from Applications</p>
                  <p className="text-slate-400"># Or simply run in any terminal:</p>
                  <p className="text-indigo-400">OLLAMA_ORIGINS="*" ollama serve</p>
                </>
              )}

              {activeTab === 'linux' && (
                <>
                  <p className="text-slate-400"># Edit systemd service configuration:</p>
                  <p className="text-emerald-400">sudo systemctl edit ollama.service</p>
                  <p className="text-slate-400"># Add under [Service]:</p>
                  <p className="text-slate-200">Environment="OLLAMA_ORIGINS=*"</p>
                  <p className="text-slate-400"># Reload and restart:</p>
                  <p className="text-indigo-400">sudo systemctl daemon-reload && sudo systemctl restart ollama</p>
                </>
              )}

              {activeTab === 'windows' && (
                <>
                  <p className="text-slate-400"># 1. Quit Ollama from system tray</p>
                  <p className="text-slate-400"># 2. Open Settings &gt; System &gt; About &gt; Advanced system settings</p>
                  <p className="text-slate-400"># 3. Click 'Environment Variables' and add under User variables:</p>
                  <p className="text-emerald-400">Variable: OLLAMA_ORIGINS</p>
                  <p className="text-emerald-400">Value: *</p>
                  <p className="text-slate-400"># 4. Restart Ollama from Start Menu</p>
                </>
              )}
            </div>
          </div>

          {/* Model pull instruction */}
          <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200">Don't have Gemma 2 installed yet?</span>
              <p className="text-slate-400">Run this once to download the model (~1.6GB):</p>
            </div>
            <code className="bg-slate-900 px-2.5 py-1 rounded text-indigo-300 font-mono border border-slate-700">
              ollama run gemma2
            </code>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-slate-950/60 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero tokens sent to cloud APIs. 100% private.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onEnableDemoMode();
                onClose();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 transition-all shadow-lg shadow-amber-500/10"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Use Judge Demo Mode (No Ollama needed)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
