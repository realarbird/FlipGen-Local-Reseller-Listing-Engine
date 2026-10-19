import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Tag, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Gauge
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PlatformCard from './PlatformCard';
import FeeCalculator from './FeeCalculator';
import { PRESET_ITEMS } from '../services/sampleData';
import { generateListing } from '../services/ollamaService';

export default function SingleItemGenerator({ ollamaStatus, config }) {
  const [formData, setFormData] = useState({
    item_name: 'Vintage 1998 Sony Walkman WM-FX195 Radio Cassette Player',
    condition: 'Good / Gently Used',
    price: '48.00',
    cost: '6.00',
    raw_notes: 'Tested working with cassette playback, rewind, and fast forward. AM/FM radio tuner works smoothly. Clean battery compartment with zero corrosion. Light surface scuffs on rear casing. Includes original OEM belt clip.'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [listingResult, setListingResult] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  const conditionOptions = [
    'Brand New with Tags (NWT)',
    'Like New / Mint',
    'Good / Gently Used',
    'Fair / Minor Flaws',
    'For Parts / Restoration'
  ];

  const handlePresetSelect = (preset) => {
    setFormData({
      item_name: preset.name,
      condition: preset.condition,
      price: preset.price,
      cost: preset.cost,
      raw_notes: preset.notes
    });
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!formData.item_name.trim()) return;

    setIsLoading(true);
    setErrorNotice(null);

    try {
      const res = await generateListing(formData, {
        baseUrl: config.baseUrl,
        model: config.model,
        demoMode: config.demoMode || !ollamaStatus.connected,
        temperature: config.temperature
      });

      if (res.success) {
        setListingResult(res.data);
        setMetrics(res.metrics);

        // Fire celebratory confetti for the side hustler!
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#f59e0b']
        });
      }
    } catch (err) {
      setErrorNotice(err.message || 'Failed to generate listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Hero / Intro banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Local Gemma 2 Listing Optimization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Single Item Multi-Platform Generator
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Turn messy thrift notes and raw condition observations into 3 distinct, search-optimized listings for <strong>eBay</strong> (strict 80-char cap), <strong>Poshmark</strong>, and <strong>Mercari</strong> simultaneously with zero cloud token cost.
          </p>

          {/* Quick Preset Buttons */}
          <div className="pt-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
              ⚡ Quick Fill Presets (1-Click Test):
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_ITEMS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Item Name */}
            <div className="md:col-span-8 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Item Name or Working Title *</span>
                <span className="text-[11px] text-slate-500 font-normal">Brand, model, key identifiers</span>
              </label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                placeholder="e.g. Vintage 1998 Sony Walkman WM-FX195"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Condition Dropdown */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
              >
                {conditionOptions.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Price */}
            <div className="md:col-span-6 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Selling Price ($)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="48.00"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Thrift Purchase Cost */}
            <div className="md:col-span-6 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Purchase Cost / Thrift COGS ($)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="6.00"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Raw Notes & Flaws */}
            <div className="md:col-span-12 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Raw Notes, Flaws & Inclusions</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal">Mention scratches, testing results, bundled accessories</span>
              </label>
              <textarea
                rows={3}
                value={formData.raw_notes}
                onChange={(e) => setFormData({ ...formData, raw_notes: e.target.value })}
                placeholder="Tested cassette & radio functions. Battery bay is clean with zero corrosion. Light scratches on rear casing. Includes belt clip."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                {config.demoMode || !ollamaStatus.connected 
                  ? 'Simulated Gemma 2 (Judge Demo Mode)' 
                  : `Local Gemma 2 (${config.model || 'gemma2'})`}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono font-medium">$0.00 Token Cost</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.item_name.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Platform Listings...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Generate Multi-Platform Listings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generation Metrics Banner */}
      {metrics && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generation Time: <strong className="text-slate-200">{metrics.durationMs}ms</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Speed: <strong className="text-slate-200">{metrics.tokensPerSec} tokens/sec</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Generated: <strong className="text-slate-200">{metrics.tokens} tokens</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-medium">
              Saved ~$0.03 vs GPT-4o
            </span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {listingResult && (
        <div className="space-y-6">
          
          {/* Fee & Profit Calculator */}
          <FeeCalculator
            price={formData.price}
            cost={formData.cost}
            pricingTip={listingResult.pricing_tip}
          />

          {/* 3 Platform Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PlatformCard
              platform="ebay"
              data={listingResult.ebay}
              price={formData.price}
            />
            <PlatformCard
              platform="poshmark"
              data={listingResult.poshmark}
              price={formData.price}
            />
            <PlatformCard
              platform="mercari"
              data={listingResult.mercari}
              price={formData.price}
            />
          </div>

        </div>
      )}

    </div>
  );
}
