import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Globe, 
  Lock,
  ArrowRight,
  Settings,
  CheckCircle2
} from 'lucide-react';

export default function CorsHelpModal({ 
  isOpen, 
  onClose, 
  onEnableDemoMode,
  currentUrl = 'http://localhost:11434',
  onSaveTunnelUrl,
  onOpenSettings
}) {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const [copiedCmd, setCopiedCmd] = useState(null);
  const [activeTab, setActiveTab] = useState(isHttps ? 'render' : 'mac');
  const [tunnelInput, setTunnelInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUrl && currentUrl.startsWith('https://')) {
      setTunnelInput(currentUrl);
    }
  }, [currentUrl, isOpen]);

  if (!isOpen) return null;

  const copyCommand = (cmd, key) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleApplyTunnel = () => {
    const trimmed = tunnelInput.trim();
    if (!trimmed) return;
    if (onSaveTunnelUrl) {
      onSaveTunnelUrl(trimmed);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const primaryCommand = 'OLLAMA_ORIGINS="*" ollama serve';
  const cloudflareCommand = 'npx cloudflared tunnel --url http://localhost:11434 --http-host-header="localhost:11434"';
  const localtunnelCommand = 'npx localtunnel --port 11434';
  const killOllamaCommand = 'pkill -f Ollama; launchctl setenv OLLAMA_ORIGINS "*"; open -a Ollama';

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
                Ollama & Render (HTTPS) Connection Guide
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
          
          {/* HTTPS / Mixed Content Alert if deployed */}
          {isHttps && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-300 text-sm">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Why can't Render reach http://localhost directly?</span>
              </div>
              <p className="leading-relaxed text-amber-200/90">
                Render serves this site securely over <strong className="text-white">HTTPS</strong>. Modern web browsers block JavaScript on HTTPS pages from requesting insecure <code className="bg-amber-950/80 px-1 py-0.5 rounded font-mono text-amber-300">http://localhost:11434</code> (called the <strong>Mixed Content Security Policy</strong>).
              </p>
              <p className="text-amber-300 font-medium pt-1">
                👉 Follow the 3 quick steps below to connect your local Gemma 2, or toggle <strong className="underline">Judge Demo Mode</strong> for instant zero-setup testing!
              </p>
            </div>
          )}

          {/* Tab Selection */}
          <div>
            <div className="flex gap-2 border-b border-slate-800 mb-3 text-xs overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('render')}
                className={`pb-2 px-2.5 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'render'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Render (HTTPS) Tunnel</span>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded-full">Important</span>
              </button>

              <button
                onClick={() => setActiveTab('mac')}
                className={`pb-2 px-2.5 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === 'mac'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                macOS CORS
              </button>

              <button
                onClick={() => setActiveTab('linux')}
                className={`pb-2 px-2.5 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === 'linux'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Linux (systemd)
              </button>

              <button
                onClick={() => setActiveTab('windows')}
                className={`pb-2 px-2.5 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === 'windows'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Windows CORS
              </button>
            </div>

            {/* TAB: Render HTTPS Tunnel */}
            {activeTab === 'render' && (
              <div className="space-y-5 text-xs">
                
                {/* Method 1: Cloudflare Tunnel */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-100 text-sm">
                      How to Connect Local Gemma 2 to Render (3 Steps)
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                      Free & No Account Needed
                    </span>
                  </div>

                  {/* Step 1: Fix address in use & start Ollama with CORS */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px]">1</span>
                      <span>If you saw "address already in use", restart Ollama with CORS:</span>
                    </div>
                    <p className="text-slate-400 text-[11px] pl-6">
                      Ollama was already running in your Mac menu bar without CORS. Run this in Terminal to restart it with <code className="text-amber-300 font-mono">OLLAMA_ORIGINS="*"</code>:
                    </p>
                    <div className="ml-6 flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-emerald-400 text-[11px]">
                      <span className="truncate">{killOllamaCommand}</span>
                      <button
                        onClick={() => copyCommand(killOllamaCommand, 'kill')}
                        className="ml-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[10px] transition-colors shrink-0"
                      >
                        {copiedCmd === 'kill' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCmd === 'kill' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Start Cloudflare tunnel */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px]">2</span>
                      <span>In a new terminal window, run the Cloudflare Tunnel:</span>
                    </div>
                    <p className="text-slate-400 text-[11px] pl-6">
                      Use the <code className="text-amber-300 font-mono">--http-host-header</code> flag so Ollama allows the connection:
                    </p>
                    <div className="ml-6 flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-emerald-400 text-[11px]">
                      <span className="truncate">{cloudflareCommand}</span>
                      <button
                        onClick={() => copyCommand(cloudflareCommand, 'cf')}
                        className="ml-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[10px] transition-colors shrink-0"
                      >
                        {copiedCmd === 'cf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCmd === 'cf' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 3: CRUCIAL - Input into settings */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-xs">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">3</span>
                      <span>CRITICAL: Enter your generated Cloudflare URL below:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] pl-6 leading-relaxed">
                      Copy the <code className="text-indigo-300 font-mono">https://...trycloudflare.com</code> URL that printed in your terminal and paste it here:
                    </p>

                    <div className="ml-6 space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={tunnelInput}
                          onChange={(e) => setTunnelInput(e.target.value)}
                          placeholder="e.g. https://assignment-clone-constraint-redeem.trycloudflare.com"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-indigo-500/40 rounded-xl text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyTunnel}
                          disabled={!tunnelInput.trim()}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shrink-0"
                        >
                          {saveSuccess ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Connected!</span>
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span>Save & Connect</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-400">
                        You can also change this anytime by clicking the <strong>Settings (⚙️ icon)</strong> in the top right.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Method 2: Browser Site Settings */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200 block">
                    Alternative: Allow Insecure Content in Chrome (No Tunnel Needed)
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>Make sure Ollama is restarted with CORS: <code className="text-indigo-300 font-mono">OLLAMA_ORIGINS="*" ollama serve</code></li>
                    <li>In Chrome/Edge on your Render site, click the <strong>tune / padlock icon</strong> on the left side of the address bar.</li>
                    <li>Click <strong>Site settings</strong>.</li>
                    <li>Find <strong>Insecure content</strong> and change it from <em>Block (default)</em> to <strong className="text-emerald-400">Allow</strong>.</li>
                    <li>Reload this Render tab. The browser will now let Render communicate with your local Ollama!</li>
                  </ol>
                </div>

                {/* Method 3: Judge Demo Mode */}
                <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-amber-300 block text-xs">
                      Zero-Setup: Judge Demo Mode
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Evaluate every feature instantly with realistic simulated Gemma 2 outputs. No local installation required.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onEnableDemoMode();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Use Demo Mode
                  </button>
                </div>

              </div>
            )}

            {/* TAB: macOS */}
            {activeTab === 'mac' && (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
                <p className="text-slate-400"># 1. Quit Ollama (Menu Bar icon -&gt; Quit)</p>
                <p className="text-slate-400"># 2. Or kill existing process in Terminal:</p>
                <p className="text-rose-400">pkill -f Ollama</p>
                <p className="text-slate-400"># 3. Set environment variable globally for Mac apps:</p>
                <p className="text-emerald-400 font-semibold">launchctl setenv OLLAMA_ORIGINS "*"</p>
                <p className="text-slate-400"># 4. Restart Ollama from Applications or terminal:</p>
                <p className="text-indigo-400">open -a Ollama</p>
              </div>
            )}

            {/* TAB: Linux */}
            {activeTab === 'linux' && (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
                <p className="text-slate-400"># Edit systemd service configuration:</p>
                <p className="text-emerald-400">sudo systemctl edit ollama.service</p>
                <p className="text-slate-400"># Add under [Service]:</p>
                <p className="text-slate-200">Environment="OLLAMA_ORIGINS=*"</p>
                <p className="text-slate-400"># Reload and restart:</p>
                <p className="text-indigo-400">sudo systemctl daemon-reload && sudo systemctl restart ollama</p>
              </div>
            )}

            {/* TAB: Windows */}
            {activeTab === 'windows' && (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
                <p className="text-slate-400"># 1. Quit Ollama from system tray</p>
                <p className="text-slate-400"># 2. Open Settings &gt; System &gt; About &gt; Advanced system settings</p>
                <p className="text-slate-400"># 3. Click 'Environment Variables' and add under User variables:</p>
                <p className="text-emerald-400">Variable: OLLAMA_ORIGINS</p>
                <p className="text-emerald-400">Value: *</p>
                <p className="text-slate-400"># 4. Restart Ollama from Start Menu</p>
              </div>
            )}
          </div>

          {/* Model pull instruction */}
          <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200">Don't have Gemma 2 installed yet?</span>
              <p className="text-slate-400">Run this once in your terminal to download (~1.6GB):</p>
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
            <span>Zero tokens sent to closed cloud APIs. 100% private.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Open Settings</span>
              </button>
            )}
            <button
              onClick={() => {
                onEnableDemoMode();
                onClose();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Use Judge Demo Mode</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
