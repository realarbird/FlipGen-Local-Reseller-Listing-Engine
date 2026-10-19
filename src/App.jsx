import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SingleItemGenerator from './components/SingleItemGenerator';
import BatchGenerator from './components/BatchGenerator';
import CorsHelpModal from './components/CorsHelpModal';
import SettingsModal from './components/SettingsModal';
import { 
  checkOllamaConnection, 
  DEFAULT_OLLAMA_URL, 
  DEFAULT_MODEL 
} from './services/ollamaService';
import { Sparkles, Terminal, Shield, Heart, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('single');
  const [isCorsModalOpen, setIsCorsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [ollamaStatus, setOllamaStatus] = useState({
    connected: false,
    models: [],
    error: null,
    checked: false
  });

  const [config, setConfig] = useState({
    baseUrl: DEFAULT_OLLAMA_URL,
    model: DEFAULT_MODEL,
    temperature: 0.7,
    demoMode: true // Defaults to Demo Mode for zero-friction hackathon judge testing on Render
  });

  // Check Ollama status on startup
  const verifyConnection = async (customUrl) => {
    const targetUrl = customUrl || config.baseUrl;
    const status = await checkOllamaConnection(targetUrl);
    setOllamaStatus({
      connected: status.connected,
      models: status.models,
      error: status.error,
      checked: true
    });

    // If local Ollama is detected, automatically switch off demo mode
    if (status.connected) {
      setConfig((prev) => ({
        ...prev,
        demoMode: false,
        model: status.models.some((m) => m.name.includes('gemma2'))
          ? 'gemma2'
          : status.models[0]?.name || prev.model
      }));
    }
  };

  useEffect(() => {
    verifyConnection();
  }, []);

  const handleToggleDemoMode = () => {
    setConfig((prev) => ({
      ...prev,
      demoMode: !prev.demoMode
    }));
  };

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    verifyConnection(newConfig.baseUrl);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        ollamaStatus={ollamaStatus}
        demoMode={config.demoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onOpenCorsModal={() => setIsCorsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Judge Demo Mode Banner */}
      {config.demoMode && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border-b border-amber-500/20 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Judge Demo Mode Active:</strong> Instant testing with simulated Gemma 2 output. Perfect for judges evaluating on Render without installing local models!
              </span>
            </div>
            <button
              onClick={() => setIsCorsModalOpen(true)}
              className="underline hover:text-white transition-colors shrink-0 text-[11px] flex items-center gap-1"
            >
              <Terminal className="w-3 h-3" />
              <span>Have Ollama locally? Enable CORS guide</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'single' ? (
          <SingleItemGenerator
            ollamaStatus={ollamaStatus}
            config={config}
          />
        ) : (
          <BatchGenerator
            ollamaStatus={ollamaStatus}
            config={config}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-8 px-4 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">FlipGen</span>
            <span>—</span>
            <span>Local Reseller Listing Engine</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-medium">DEV Hacktoberfest 2026 Week 2 "Side Hustle"</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Private ($0 Token Cost)</span>
            </span>
            <a
              href="https://ollama.com/library/gemma2"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <span>Powered by Gemma 2</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CorsHelpModal
        isOpen={isCorsModalOpen}
        onClose={() => setIsCorsModalOpen(false)}
        onEnableDemoMode={() => setConfig((prev) => ({ ...prev, demoMode: true }))}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        availableModels={ollamaStatus.models}
        onRefreshModels={() => verifyConnection(config.baseUrl)}
      />
    </div>
  );
}
