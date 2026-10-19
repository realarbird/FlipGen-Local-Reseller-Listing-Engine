import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SingleItemGenerator from './components/SingleItemGenerator';
import BatchGenerator from './components/BatchGenerator';
import SalesArchive from './components/SalesArchive';
import CorsHelpModal from './components/CorsHelpModal';
import SettingsModal from './components/SettingsModal';
import { 
  checkOllamaConnection, 
  DEFAULT_OLLAMA_URL, 
  DEFAULT_MODEL 
} from './services/ollamaService';
import { Sparkles, Terminal } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased flex flex-col selection:bg-orange-100 selection:text-orange-950 font-sans">
      {/* Streamlined Top Navigation */}
      <Navbar
        ollamaStatus={ollamaStatus}
        demoMode={config.demoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onOpenCorsModal={() => setIsCorsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Discrete Judge Demo Mode Banner */}
      {config.demoMode && (
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>Judge Demo Mode Active:</strong> Instant testing with simulated Gemma 2 synthesis for hackathon judges evaluating on Render.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCorsModalOpen(true)}
              className="text-amber-800 hover:text-amber-950 underline transition-colors shrink-0 text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Terminal className="w-3 h-3" />
              <span>Have Ollama locally? CORS guide</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col">
        {activeView === 'single' ? (
          <SingleItemGenerator
            ollamaStatus={ollamaStatus}
            config={config}
            onNavigateToArchive={() => setActiveView('archive')}
          />
        ) : activeView === 'batch' ? (
          <BatchGenerator
            ollamaStatus={ollamaStatus}
            config={config}
          />
        ) : (
          <SalesArchive
            onNavigateToListing={() => setActiveView('single')}
          />
        )}
      </main>

      {/* Modern Clean Footer matching stitch design */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">FlipGen Studio</span>
            <span>•</span>
            <span>On-device cataloging engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Gemma 2 (Local Inference)</span>
            <span>•</span>
            <span>100% Client-Side Privacy</span>
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
