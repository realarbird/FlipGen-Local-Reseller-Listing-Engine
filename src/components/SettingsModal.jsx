import React, { useState } from 'react';
import { X, Settings, RefreshCw, Cpu, Server, Sliders, Check } from 'lucide-react';
import { DEFAULT_OLLAMA_URL, DEFAULT_MODEL } from '../services/ollamaService';

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  availableModels = [],
  onRefreshModels
}) {
  const [url, setUrl] = useState(config.baseUrl || DEFAULT_OLLAMA_URL);
  const [model, setModel] = useState(config.model || DEFAULT_MODEL);
  const [temperature, setTemperature] = useState(config.temperature ?? 0.7);
  const [demoMode, setDemoMode] = useState(config.demoMode || false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshModels();
    setIsRefreshing(false);
  };

  const handleSave = () => {
    onSaveConfig({
      baseUrl: url.trim(),
      model: model.trim(),
      temperature: parseFloat(temperature),
      demoMode: demoMode
    });
    onClose();
  };

  const handleReset = () => {
    setUrl(DEFAULT_OLLAMA_URL);
    setModel(DEFAULT_MODEL);
    setTemperature(0.7);
    setDemoMode(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-lg font-semibold text-white">
                Engine & Model Settings
              </h2>
              <p className="text-xs text-slate-400">
                Configure your local Ollama runtime and prompting options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Base URL */}
          <div>
            <label className="flex items-center gap-2 font-medium text-slate-300 mb-1.5 text-xs uppercase tracking-wider">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ollama Host URL</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Standard local URL is <code className="text-slate-400 font-mono">http://localhost:11434</code>. On Render (HTTPS), paste your free HTTPS tunnel URL (e.g. <code className="text-indigo-400 font-mono">https://...trycloudflare.com</code>).
            </p>
          </div>

          {/* Model selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-2 font-medium text-slate-300 text-xs uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Model Name</span>
              </label>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Detect Models</span>
              </button>
            </div>

            {availableModels.length > 0 ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                {availableModels.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({((m.size || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB)
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gemma2:latest"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Recommended: <span className="text-indigo-300 font-mono">gemma2</span> or <span className="text-indigo-300 font-mono">gemma2:9b</span> for optimal SEO reasoning.
            </p>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-2 font-medium text-slate-300 text-xs uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Temperature: {temperature}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {temperature <= 0.4 ? 'Strict & Deterministic' : temperature >= 0.8 ? 'Creative & Stylistic' : 'Balanced'}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Demo Mode Toggle */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="pr-4">
              <p className="font-medium text-slate-200 text-xs">Simulated Judge Demo Mode</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bypasses Ollama network calls with simulated Gemma 2 outputs. Ideal for testing without a local GPU.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/60 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            Reset Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
