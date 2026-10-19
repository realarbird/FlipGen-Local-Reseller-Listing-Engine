import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Copy, 
  Check, 
  Archive, 
  Truck, 
  ChevronDown, 
  Zap 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRESET_ITEMS } from '../services/sampleData';
import { generateListing } from '../services/ollamaService';
import { saveItemToArchive } from '../services/ledgerService';

export default function SingleItemGenerator({ ollamaStatus, config, onNavigateToArchive, onItemSaved }) {
  const initialPreset = PRESET_ITEMS[0]; // Electronics (Sony Walkman)

  const [activePresetKey, setActivePresetKey] = useState(initialPreset.key);
  const [specimenId, setSpecimenId] = useState(initialPreset.specimen);
  
  const [formData, setFormData] = useState({
    title: initialPreset.name,
    condition: 'good',
    niche: initialPreset.niche,
    cogs: initialPreset.cost,
    price: initialPreset.price,
    notes: initialPreset.notes
  });

  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [savedToLedger, setSavedToLedger] = useState(false);
  const [genMetrics, setGenMetrics] = useState({
    timeStr: '1.4s',
    tokens: 342,
    mode: 'Zero cloud cost'
  });

  // Current active channel data
  const [channelData, setChannelData] = useState({
    specifics: initialPreset.specifics,
    ebay: initialPreset.ebay,
    poshmark: initialPreset.poshmark,
    mercari: initialPreset.mercari,
    pricing_tip: ''
  });

  // Calculate Unit Economics
  const priceNum = parseFloat(formData.price) || 0;
  const cogsNum = parseFloat(formData.cogs) || 0;
  const ebayFee = priceNum * 0.1325 + (priceNum > 0 ? 0.30 : 0);
  const netProfit = Math.max(0, priceNum - cogsNum - ebayFee);
  const roi = cogsNum > 0 ? ((netProfit / cogsNum) * 100).toFixed(1) : '0.0';

  // Preset switch handler
  const handleSelectPreset = (preset) => {
    setActivePresetKey(preset.key);
    setSpecimenId(preset.specimen);
    setFormData({
      title: preset.name,
      condition: preset.condition.toLowerCase().includes('good')
        ? 'good'
        : preset.condition.toLowerCase().includes('like')
        ? 'likenew'
        : preset.condition.toLowerCase().includes('fair')
        ? 'fair'
        : preset.condition.toLowerCase().includes('new')
        ? 'bnwt'
        : 'good',
      niche: preset.niche,
      cogs: preset.cost,
      price: preset.price,
      notes: preset.notes
    });
    setChannelData({
      specifics: preset.specifics,
      ebay: preset.ebay,
      poshmark: preset.poshmark,
      mercari: preset.mercari,
      pricing_tip: ''
    });
    setSavedToLedger(false);
  };

  // Generate / Synthesize Listings
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);
    setSavedToLedger(false);

    const startTime = performance.now();

    try {
      const res = await generateListing({
        item_name: formData.title,
        condition: formData.condition,
        raw_notes: formData.notes,
        price: formData.price,
        cost: formData.cogs
      }, {
        baseUrl: config.baseUrl,
        model: config.model,
        demoMode: config.demoMode || !ollamaStatus.connected,
        temperature: config.temperature
      });

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);

      if (res.success && res.data) {
        setChannelData({
          specifics: res.data.ebay?.specifics || {
            condition: formData.condition === 'bnwt' ? 'Brand New' : formData.condition === 'likenew' ? 'Like New' : 'Pre-owned (Good)',
            model: formData.title.split(' ').slice(1, 3).join(' ') || 'Specimen',
            color: 'Original',
            included: formData.notes.toLowerCase().includes('clip') ? 'Belt Clip' : formData.notes.toLowerCase().includes('box') ? 'Original Box' : 'As Pictured'
          },
          ebay: res.data.ebay,
          poshmark: res.data.poshmark,
          mercari: res.data.mercari,
          pricing_tip: res.data.pricing_tip
        });

        setGenMetrics({
          timeStr: `${elapsed}s`,
          tokens: res.metrics?.tokens || 340,
          mode: config.demoMode ? 'Simulated Gemma 2' : 'Local Gemma 2 ($0 Cost)'
        });

        // Fire festive celebration confetti
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#ea580c', '#16a34a', '#2563eb']
        });
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Copy All Listings to Clipboard
  const handleCopyAll = () => {
    const fullBundle = `=== EBAY LISTING ===
Title (${channelData.ebay?.title?.length || 0}/80):
${channelData.ebay?.title || ''}

Description:
${channelData.ebay?.description || ''}

Keywords:
${channelData.ebay?.keywords?.join(', ') || ''}

=== POSHMARK CLOSET ===
Headline:
${channelData.poshmark?.title || ''}

Description:
${channelData.poshmark?.description || ''}

Tags:
${channelData.poshmark?.tags?.join(' ') || ''}

=== MERCARI LISTING ===
Headline:
${channelData.mercari?.title || ''}

Bullets:
${channelData.mercari?.bullets?.map(b => `• ${b.bold || ''}${b.text}`).join('\n') || ''}

Hashtags:
${channelData.mercari?.hashtags?.join(' ') || ''}
`;
    handleCopy(fullBundle, 'copy-all');
  };

  // Save to Archive Ledger
  const handleSaveToLedger = () => {
    saveItemToArchive({
      specimen: specimenId,
      title: formData.title,
      condition: formData.condition,
      niche: formData.niche,
      cogs: formData.cogs,
      price: formData.price,
      profit: netProfit,
      roi: roi,
      ebayTitle: channelData.ebay?.title,
      poshTitle: channelData.poshmark?.title,
      mercariTitle: channelData.mercari?.title
    });

    setSavedToLedger(true);
    setTimeout(() => setSavedToLedger(false), 2500);

    if (onItemSaved) {
      onItemSaved();
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      
      {/* Clean Page Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Catalog Desk</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">{specimenId}</span>
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium ml-1">
              Auto-saved
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white font-sans">
            Single Item Lister
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Convert raw thrift condition observations into tailored, multi-platform listings for eBay (80-character cap), Poshmark, and Mercari with zero cloud token cost.
          </p>
        </div>

        {/* Quick Preset Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            Presets:
          </span>
          {PRESET_ITEMS.map((preset) => {
            const isActive = activePresetKey === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`preset-btn px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Flow (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-5 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                Item Metadata
              </h2>
              <span className="text-xs text-slate-600 dark:text-slate-400">Step 1 of 2</span>
            </div>

            {/* Working Title with Minimalist Counter */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-800 dark:text-slate-200" htmlFor="workingTitle">
                  Working Title & Identifiers
                </label>
                <span className="text-slate-600 dark:text-slate-400">
                  <span 
                    className={`font-semibold ${
                      formData.title.length > 80 
                        ? 'text-rose-600 font-bold' 
                        : formData.title.length >= 70 
                        ? 'text-amber-600' 
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {formData.title.length}
                  </span>
                  /80 chars
                </span>
              </div>
              <input
                id="workingTitle"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 1994 Carhartt J97 MOS Blanket Lined Detroit Jacket"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all font-sans"
              />
            </div>

            {/* Category & Condition Dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200" htmlFor="conditionSelect">
                  Condition Grade
                </label>
                <div className="relative">
                  <select
                    id="conditionSelect"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all cursor-pointer appearance-none"
                  >
                    <option value="bnwt">New with Tags (BNWT)</option>
                    <option value="likenew">Like New / Mint</option>
                    <option value="good">Good / Gently Used</option>
                    <option value="fair">Fair / Distressed</option>
                    <option value="parts">For Parts</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200" htmlFor="nicheInput">
                  Niche Category
                </label>
                <input
                  id="nicheInput"
                  type="text"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  placeholder="e.g. Consumer Electronics"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all font-sans"
                />
              </div>
            </div>

            {/* Unit Financials & Profit Bar */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-lg border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label 
                    className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
                    htmlFor="cogsInput"
                  >
                    Cost of Goods
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">$</span>
                    <input
                      id="cogsInput"
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.cogs}
                      onChange={(e) => setFormData({ ...formData, cogs: e.target.value })}
                      className="w-full pl-6 pr-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-600"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
                    htmlFor="priceInput"
                  >
                    Target Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">$</span>
                    <input
                      id="priceInput"
                      type="number"
                      step="1.0"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-6 pr-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-600"
                    />
                  </div>
                </div>
              </div>

              {/* Profit & ROI Divider */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Est. Net Profit (eBay ~13.25% fee)</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    +${netProfit.toFixed(2)}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    +{roi}% ROI
                  </span>
                </div>
              </div>
            </div>

            {/* Condition Observations / Raw Notes */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-800 dark:text-slate-200" htmlFor="rawNotes">
                  Raw Condition Notes
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, notes: '' })}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <textarea
                id="rawNotes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Flaws, functionality, inclusions, serials, and tactile notes..."
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs leading-relaxed font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all custom-scrollbar resize-none"
              />
            </div>

            {/* Primary CTA Button */}
            <button
              id="generateBtn"
              type="button"
              disabled={isLoading || !formData.title.trim()}
              onClick={handleGenerate}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold text-sm shadow-sm transition-all shadow-orange-600/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span>Synthesizing...</span>
                  <RotateCw className="w-4 h-4 animate-spin" />
                </>
              ) : (
                <>
                  <span>Generate Listings</span>
                  <Sparkles className="w-4 h-4 fill-white" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: Output Preview & Tailored Channels (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-5" id="generationResults">
          
          {/* Header Bar for Output Desk */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Generated Channels
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  3 Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Synthesized via Gemma 2 in {genMetrics.timeStr} • {genMetrics.mode}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
              >
                {copiedKey === 'copy-all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveToLedger}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                {savedToLedger ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    <span>Save to Ledger</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Channel 1: eBay Marketplace (High Precision SEO) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                  eBay Marketplace
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold tracking-wide">
                  80-Char Cap
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span className={channelData.ebay?.title?.length > 80 ? 'text-rose-600 font-bold' : ''}>
                    {channelData.ebay?.title?.length || 0}
                  </span>
                  {' '}/ 80 Chars
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(channelData.ebay?.title, 'ebay-title')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  {copiedKey === 'ebay-title' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
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

            <div className="p-5 flex flex-col gap-4">
              {/* Title */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                  Optimized Title
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug font-sans">
                  {channelData.ebay?.title}
                </p>
              </div>

              {/* Specifics Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] block">Condition</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {channelData.specifics?.condition || 'Pre-owned (Good)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] block">Model</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {channelData.specifics?.model || 'WM-FX195'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] block">Color</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {channelData.specifics?.color || 'Silver'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] block">Included</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {channelData.specifics?.included || 'Belt Clip'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    Item Description
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(channelData.ebay?.description, 'ebay-desc')}
                    className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                  >
                    {copiedKey === 'ebay-desc' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied Body</span>
                    ) : (
                      <span>Copy Body</span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono bg-slate-50/50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                  {channelData.ebay?.description}
                </p>
              </div>

              {/* Keywords Tags */}
              {channelData.ebay?.keywords && channelData.ebay.keywords.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mr-1">
                    Keywords:
                  </span>
                  {channelData.ebay.keywords.map((kw, i) => (
                    <span 
                      key={i}
                      onClick={() => handleCopy(kw, `kw-${i}`)}
                      className="px-2 py-0.5 rounded bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-mono cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors"
                      title="Click to copy keyword"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Channel 2: Poshmark Closet (Curated & Tags) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                  Poshmark Closet
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-semibold tracking-wide">
                  Aesthetic & Tags
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(channelData.poshmark?.title, 'posh-title')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 transition-colors cursor-pointer"
              >
                {copiedKey === 'posh-title' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                  Listing Headline
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                  {channelData.poshmark?.title}
                </p>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {channelData.poshmark?.description}
              </div>

              {/* Tags */}
              {channelData.poshmark?.tags && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {channelData.poshmark.tags.map((tag, i) => (
                    <span
                      key={i}
                      onClick={() => handleCopy(tag, `ptag-${i}`)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Click to copy tag"
                    >
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Channel 3: Mercari (Concise & Fast Dispatch) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                  Mercari
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-semibold tracking-wide">
                  Concise • Fast Ship
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(channelData.mercari?.title, 'merc-title')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 transition-colors cursor-pointer"
              >
                {copiedKey === 'merc-title' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                  Listing Headline
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                  {channelData.mercari?.title}
                </p>
              </div>

              {/* Bullet Points */}
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-sans">
                {channelData.mercari?.bullets ? (
                  channelData.mercari.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      {b.type === 'truck' ? (
                        <Truck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span>
                        {b.bold && <strong>{b.bold}</strong>}
                        {b.text}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-600 dark:text-slate-300">
                    {channelData.mercari?.description}
                  </li>
                )}
              </ul>

              {/* Hashtags */}
              {channelData.mercari?.hashtags && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {channelData.mercari.hashtags.map((ht, i) => (
                    <span
                      key={i}
                      onClick={() => handleCopy(ht, `mht-${i}`)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Click to copy hashtag"
                    >
                      {ht.startsWith('#') ? ht : `#${ht}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

        </section>

      </div>

    </div>
  );
}
