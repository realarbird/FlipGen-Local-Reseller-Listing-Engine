import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SingleItemGenerator from './components/SingleItemGenerator';
import BatchGenerator from './components/BatchGenerator';
import SalesArchive from './components/SalesArchive';
import CorsHelpModal from './components/CorsHelpModal';
import SettingsModal from './components/SettingsModal';
import GoogleSyncModal from './components/GoogleSyncModal';
import { 
  checkOllamaConnection, 
  DEFAULT_OLLAMA_URL, 
  DEFAULT_MODEL 
} from './services/ollamaService';
import { 
  getSyncState, 
  subscribeToSync, 
  pullLatestFromCloud, 
  pushToCloud,
  listenToLiveCloudUpdates,
  initAuthObserver
} from './services/firebaseService';
import { getArchiveItems, importArchiveItemsFromCloud } from './services/ledgerService';
import { Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('single');
  const [isCorsModalOpen, setIsCorsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('flipgen_theme') || 'light';
  });

  // Google Cloud Sync State (Firebase 1-Click Auth)
  const [syncState, setSyncState] = useState(getSyncState());

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

  // Apply Theme to document HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('flipgen_theme', theme);
  }, [theme]);

  // Subscribe to Google Firebase sync updates & auth state changes
  useEffect(() => {
    const unsub = subscribeToSync((state) => {
      setSyncState(state);
    });
    const unsubAuth = initAuthObserver((userData) => {
      setSyncState((prev) => ({ ...prev, user: userData, isConnected: true }));
    });
    return () => {
      unsub();
      unsubAuth();
    };
  }, []);

  // Real-time cross-device listener (phone ↔ laptop live updates)
  useEffect(() => {
    if (syncState?.isConnected && !syncState?.isDemo) {
      const unsubLive = listenToLiveCloudUpdates((cloudData) => {
        if (cloudData) {
          if (cloudData.theme && (cloudData.theme === 'dark' || cloudData.theme === 'light')) {
            setTheme(cloudData.theme);
          }
          if (cloudData.baseUrl) {
            setConfig((prev) => ({
              ...prev,
              baseUrl: cloudData.baseUrl,
              model: cloudData.model || prev.model,
              temperature: cloudData.temperature ?? prev.temperature
            }));
          }
          if (Array.isArray(cloudData.archive) && cloudData.archive.length > 0) {
            importArchiveItemsFromCloud(cloudData.archive);
          }
        }
      });
      return () => {
        if (typeof unsubLive === 'function') unsubLive();
      };
    }
  }, [syncState?.user?.uid, syncState?.isConnected, syncState?.isDemo]);

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

  // Google Cloud Auto-Sync on startup:
  // "Everytime someone opens this page, if the website is already logged into it should check for updates on information."
  useEffect(() => {
    verifyConnection();

    const autoSyncFromCloudOnOpen = async () => {
      const currentState = getSyncState();
      if (currentState.isConnected) {
        try {
          const cloudData = await pullLatestFromCloud();
          if (cloudData) {
            // 1. Sync theme preference from Google Cloud
            if (cloudData.theme && (cloudData.theme === 'dark' || cloudData.theme === 'light')) {
              setTheme(cloudData.theme);
            }
            // 2. Sync localhostUrl / model preferences
            if (cloudData.baseUrl) {
              setConfig((prev) => ({
                ...prev,
                baseUrl: cloudData.baseUrl,
                model: cloudData.model || prev.model,
                temperature: cloudData.temperature ?? prev.temperature
              }));
              verifyConnection(cloudData.baseUrl);
            }
            // 3. Sync Sales Archive ledger records
            if (Array.isArray(cloudData.archive) && cloudData.archive.length > 0) {
              importArchiveItemsFromCloud(cloudData.archive);
            }
          }
        } catch (syncErr) {
          console.warn('Initial cloud auto-sync note:', syncErr);
        }
      }
    };

    autoSyncFromCloudOnOpen();
  }, []);

  // Sync current bundle to Google Cloud (Firestore)
  const handlePushToCloud = useCallback(async (overrides = {}) => {
    const currentState = getSyncState();
    if (!currentState.isConnected) return;

    const payload = {
      theme: overrides.theme || theme,
      baseUrl: overrides.baseUrl || config.baseUrl,
      model: overrides.model || config.model,
      temperature: overrides.temperature ?? config.temperature,
      demoMode: overrides.demoMode ?? config.demoMode,
      archive: getArchiveItems(),
      ...overrides
    };

    await pushToCloud(payload);
  }, [theme, config]);

  // Toggle Theme handler
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    handlePushToCloud({ theme: nextTheme });
  };

  const handleToggleDemoMode = () => {
    setConfig((prev) => {
      const next = { ...prev, demoMode: !prev.demoMode };
      handlePushToCloud({ demoMode: next.demoMode });
      return next;
    });
  };

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    verifyConnection(newConfig.baseUrl);
    handlePushToCloud({
      baseUrl: newConfig.baseUrl,
      model: newConfig.model,
      temperature: newConfig.temperature,
      demoMode: newConfig.demoMode
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased flex flex-col selection:bg-orange-100 selection:text-orange-950 dark:selection:bg-orange-950 dark:selection:text-orange-100 font-sans transition-colors duration-150">
      
      {/* Streamlined Top Navigation */}
      <Navbar
        ollamaStatus={ollamaStatus}
        demoMode={config.demoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onOpenCorsModal={() => setIsCorsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        syncState={syncState}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Discrete Judge Demo Mode Banner */}
      {config.demoMode && (
        <div className="bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/60 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 transition-colors">
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
              className="text-amber-800 dark:text-amber-300 hover:underline transition-colors shrink-0 text-[11px] flex items-center gap-1 cursor-pointer"
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
            onItemSaved={() => handlePushToCloud()}
          />
        ) : activeView === 'batch' ? (
          <BatchGenerator
            ollamaStatus={ollamaStatus}
            config={config}
          />
        ) : (
          <SalesArchive
            onNavigateToListing={() => setActiveView('single')}
            onArchiveChanged={() => handlePushToCloud()}
          />
        )}
      </main>

      {/* Modern Clean Footer matching stitch design */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">FlipGen Studio</span>
            <span>•</span>
            <span>On-device cataloging engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
            <span>Gemma 2 (Local Inference)</span>
            <span>•</span>
            <span>100% Client-Side Privacy</span>
          </div>
        </div>
      </footer>

      {/* Google Cloud Sync Modal (1-Click Google Auth + Firestore Sync) */}
      <GoogleSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncState={syncState}
        onManualSync={handlePushToCloud}
        currentPreferences={{
          theme: theme === 'dark' ? 'Dark' : 'Light',
          baseUrl: config.baseUrl,
          model: config.model,
          archiveCount: getArchiveItems().length
        }}
      />

      {/* CORS Setup Modal */}
      <CorsHelpModal
        isOpen={isCorsModalOpen}
        onClose={() => setIsCorsModalOpen(false)}
        onEnableDemoMode={() => setConfig((prev) => ({ ...prev, demoMode: true }))}
      />

      {/* Settings Modal */}
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
