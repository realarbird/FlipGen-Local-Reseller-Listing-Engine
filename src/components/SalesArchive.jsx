import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  Download, 
  Trash2, 
  Search, 
  Check, 
  Plus,
  RotateCw
} from 'lucide-react';
import { 
  getArchiveItems, 
  removeArchiveItem, 
  clearArchive, 
  exportArchiveToCSV 
} from '../services/ledgerService';

export default function SalesArchive({ 
  onNavigateToListing, 
  onArchiveChanged,
  syncState,
  onSyncCloud,
  onOpenSyncModal
}) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    const refresh = () => setItems(getArchiveItems());
    refresh();
    window.addEventListener('flipgen_ledger_updated', refresh);
    return () => window.removeEventListener('flipgen_ledger_updated', refresh);
  }, []);

  const handleSyncCloud = async () => {
    if (!syncState?.isConnected) {
      if (onOpenSyncModal) {
        onOpenSyncModal();
      }
      return;
    }
    setIsSyncing(true);
    setSyncError(null);
    try {
      if (onSyncCloud) {
        await onSyncCloud();
      }
      setItems(getArchiveItems());
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2200);
    } catch (err) {
      setSyncError(err.message || 'Sync failed');
      setTimeout(() => setSyncError(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemove = (id) => {
    const updated = removeArchiveItem(id);
    setItems(updated);
    if (onArchiveChanged) onArchiveChanged();
  };

  const handleClear = () => {
    if (window.confirm('Clear all items from your local sales archive ledger?')) {
      const updated = clearArchive();
      setItems(updated);
      if (onArchiveChanged) onArchiveChanged();
    }
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filtered = items.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.specimen && item.specimen.toLowerCase().includes(query)) ||
      (item.niche && item.niche.toLowerCase().includes(query))
    );
  });

  const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0);
  const totalCost = items.reduce((sum, i) => sum + (parseFloat(i.cogs) || 0), 0);
  const totalProfit = items.reduce((sum, i) => sum + (parseFloat(i.profit) || 0), 0);
  const averageRoi = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Inventory Ledgers</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Historical Archive</span>
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium ml-1">
              {items.length} Records
            </span>
            {syncState?.isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloud Synced
              </span>
            ) : (
              <button
                type="button"
                onClick={onOpenSyncModal}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors ml-1 cursor-pointer"
              >
                Local Only • Click to Sync
              </button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white font-sans">
            Sales Archive & Inventory Ledger
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Historical specimen repository tracking unit economics, target valuations, and multi-platform listing syndication across eBay, Poshmark, and Mercari.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncCloud}
            disabled={isSyncing}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all shadow-sm cursor-pointer ${
              syncSuccess
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : syncState?.isConnected
                ? 'border-orange-200 dark:border-orange-800/80 bg-orange-50/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title={
              syncState?.isConnected
                ? `Sync archive with Google Cloud (${syncState.user?.email || 'Connected'})`
                : 'Connect Google account to sync archive across devices'
            }
          >
            {isSyncing ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : syncSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Synced!</span>
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                <span>{syncState?.isConnected ? 'Sync Cloud' : 'Connect Cloud'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={exportArchiveToCSV}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Clear all saved ledger items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Ledger</span>
            </button>
          )}
        </div>
      </div>

      {syncError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3">
          <span>{syncError}</span>
          <button
            type="button"
            onClick={() => setSyncError(null)}
            className="text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Archived Items
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {items.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Specimens</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Target Value
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ${totalValue.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gross Comps</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Thrift COGS
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ${totalCost.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Invested</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Est. Net Profit
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
              +${totalProfit.toFixed(2)}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              +{averageRoi}% ROI
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by specimen #, title, or category..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Showing {filtered.length} of {items.length} records</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
            <Archive className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-1 mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No items found in ledger</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Generate listings in the Single Lister workbench and click "Save to Ledger" to record your inventory here.
            </p>
            {onNavigateToListing && (
              <button
                type="button"
                onClick={onNavigateToListing}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Go to Single Lister</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {item.specimen}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                        {item.niche}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        • {item.condition}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove from ledger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                      Saved {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">COGS</span>
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        ${parseFloat(item.cogs || 0).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">Target</span>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">Est. Profit</span>
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          +${parseFloat(item.profit || 0).toFixed(2)}
                        </span>
                        <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1 py-0.2 rounded">
                          +{parseFloat(item.roi || 0).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">Copy:</span>
                    {item.ebayTitle && (
                      <button
                        type="button"
                        onClick={() => handleCopy(item.ebayTitle, `${item.id}-ebay-m`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/80 text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        {copiedId === `${item.id}-ebay-m` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <span>eBay Title</span>
                        )}
                      </button>
                    )}
                    {item.poshTitle && (
                      <button
                        type="button"
                        onClick={() => handleCopy(item.poshTitle, `${item.id}-posh-m`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/80 text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        {copiedId === `${item.id}-posh-m` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <span>Poshmark Title</span>
                        )}
                      </button>
                    )}
                    {item.mercariTitle && (
                      <button
                        type="button"
                        onClick={() => handleCopy(item.mercariTitle, `${item.id}-merc-m`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/80 text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        {copiedId === `${item.id}-merc-m` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <span>Mercari Title</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">Specimen & Title</th>
                    <th className="py-3 px-4">Niche Category</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4 text-right">COGS</th>
                    <th className="py-3 px-4 text-right">Target Price</th>
                    <th className="py-3 px-4 text-right">Est. Profit (ROI)</th>
                    <th className="py-3 px-4 text-center">Platform Copies</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.specimen}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white truncate" title={item.title}>
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          Saved {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {item.niche}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {item.condition}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                        ${parseFloat(item.cogs || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                            +${parseFloat(item.profit || 0).toFixed(2)}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            +{parseFloat(item.roi || 0).toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {item.ebayTitle && (
                            <button
                              type="button"
                              onClick={() => handleCopy(item.ebayTitle, `${item.id}-ebay`)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                              title="Copy eBay Title"
                            >
                              {copiedId === `${item.id}-ebay` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">eB</span>
                              )}
                            </button>
                          )}
                          {item.poshTitle && (
                            <button
                              type="button"
                              onClick={() => handleCopy(item.poshTitle, `${item.id}-posh`)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                              title="Copy Poshmark Title"
                            >
                              {copiedId === `${item.id}-posh` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">PM</span>
                              )}
                            </button>
                          )}
                          {item.mercariTitle && (
                            <button
                              type="button"
                              onClick={() => handleCopy(item.mercariTitle, `${item.id}-merc`)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                              title="Copy Mercari Title"
                            >
                              {copiedId === `${item.id}-merc` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">MC</span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remove from ledger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
