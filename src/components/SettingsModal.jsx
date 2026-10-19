import React, { useState } from 'react';
import { X, Settings, RefreshCw, Cpu, Server, SlidersHorizontal, Check, Sparkles } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-xs">
              <Settings className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-base font-bold text-slate-900">
                Engine & Model Settings
              </h2>
              <p className="text-xs text-slate-500">
                Configure local Ollama runtime and prompting options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Base URL */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-slate-700 mb-1.5 text-xs uppercase tracking-wider">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>Ollama Host URL</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Standard local Ollama endpoint is <code className="text-slate-700 font-mono">http://localhost:11434</code>.
            </p>
          </div>

          {/* Model selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-2 font-semibold text-slate-700 text-xs uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                <span>Model Name</span>
              </label>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Detect Models</span>
              </button>
            </div>

            {availableModels.length > 0 ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all cursor-pointer"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all"
              />
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Recommended: <span className="text-orange-700 font-semibold font-mono">gemma2</span> or <span className="text-orange-700 font-semibold font-mono">gemma2:9b</span> for optimal e-commerce SEO reasoning.
            </p>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-2 font-semibold text-slate-700 text-xs uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Creativity (Temperature)</span>
              </label>
              <span className="font-mono text-xs text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded">
                {temperature}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.1 (Strict & Factual)</span>
              <span>0.7 (Balanced Reseller Copy)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>

          {/* Judge Demo Mode Toggle */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-900 text-xs">
                  Judge Demo Mode (Simulated Gemma 2)
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Simulates Gemma 2 responses with realistic delay for hackathon judges testing without local Ollama.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            Reset Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
