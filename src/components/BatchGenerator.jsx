import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { 
  Upload, 
  FileSpreadsheet, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Gauge, 
  DollarSign, 
  Search,
  Eye,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_BATCH_ITEMS } from '../services/sampleData';
import { generateListing } from '../services/ollamaService';
import PlatformCard from './PlatformCard';

export default function BatchGenerator({ ollamaStatus, config }) {
  const [items, setItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null); // For detail drawer/modal
  const [dragOver, setDragOver] = useState(false);

  // Cumulative batch metrics
  const [batchStats, setBatchStats] = useState({
    totalTokens: 0,
    startTime: null,
    totalDurationMs: 0,
    moneySaved: 0.0, // calculated at $0.03 per listing vs GPT-4o
    completedCount: 0
  });

  const stopSignalRef = useRef(false);
  const fileInputRef = useRef(null);

  // Load sample vintage items
  const handleLoadSampleBatch = () => {
    stopSignalRef.current = true;
    setIsProcessing(false);
    setCurrentIndex(-1);

    const formatted = SAMPLE_BATCH_ITEMS.map((item, idx) => ({
      ...item,
      id: `sample-${idx + 1}`,
      status: 'pending', // 'pending' | 'processing' | 'completed' | 'failed'
      generatedData: null,
      error: null
    }));

    setItems(formatted);
    setBatchStats({
      totalTokens: 0,
      startTime: null,
      totalDurationMs: 0,
      moneySaved: 0.0,
      completedCount: 0
    });
  };

  // Parse uploaded CSV
  const handleFileUpload = (file) => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          alert('CSV file appears empty or unparseable.');
          return;
        }

        const parsedItems = results.data.map((row, idx) => ({
          id: `csv-${Date.now()}-${idx}`,
          item_name: row.item_name || row.title || row.Item || row.Name || `Item #${idx + 1}`,
          condition: row.condition || row.Condition || 'Good / Gently Used',
          raw_notes: row.raw_notes || row.notes || row.Notes || row.description || '',
          price: row.price || row.Price || '35.00',
          cost: row.cost || row.Cost || '5.00',
          status: 'pending',
          generatedData: null,
          error: null
        }));

        setItems(parsedItems);
        setCurrentIndex(-1);
        setIsProcessing(false);
        setBatchStats({
          totalTokens: 0,
          startTime: null,
          totalDurationMs: 0,
          moneySaved: 0.0,
          completedCount: 0
        });
      },
      error: (err) => {
        alert(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  // Start sequential batch processing
  const startProcessing = async () => {
    if (items.length === 0) return;

    stopSignalRef.current = false;
    setIsProcessing(true);

    const batchStartTime = performance.now();
    let currentTokens = batchStats.totalTokens;
    let completed = batchStats.completedCount;

    for (let i = 0; i < items.length; i++) {
      if (stopSignalRef.current) break;

      // Skip already completed items
      if (items[i].status === 'completed') continue;

      setCurrentIndex(i);

      // Mark current item as processing
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: 'processing' } : item
        )
      );

      try {
        const res = await generateListing(items[i], {
          baseUrl: config.baseUrl,
          model: config.model,
          demoMode: config.demoMode || !ollamaStatus.connected,
          temperature: config.temperature
        });

        if (stopSignalRef.current) break;

        if (res.success) {
          completed++;
          const tokensAdded = res.metrics?.tokens || 340;
          currentTokens += tokensAdded;

          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? {
                    ...item,
                    status: 'completed',
                    generatedData: res.data,
                    metrics: res.metrics
                  }
                : item
            )
          );

          setBatchStats((prev) => ({
            ...prev,
            totalTokens: currentTokens,
            completedCount: completed,
            totalDurationMs: Math.round(performance.now() - batchStartTime),
            moneySaved: parseFloat((completed * 0.03).toFixed(2))
          }));
        }
      } catch (err) {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'failed', error: err.message } : item
          )
        );
      }
    }

    setIsProcessing(false);
    setCurrentIndex(-1);

    // If all completed, trigger confetti
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#10b981', '#f59e0b']
    });
  };

  const pauseProcessing = () => {
    stopSignalRef.current = true;
    setIsProcessing(false);
  };

  const resetBatch = () => {
    stopSignalRef.current = true;
    setIsProcessing(false);
    setCurrentIndex(-1);
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'pending',
        generatedData: null,
        error: null
      }))
    );
    setBatchStats({
      totalTokens: 0,
      startTime: null,
      totalDurationMs: 0,
      moneySaved: 0.0,
      completedCount: 0
    });
  };

  // Export completed listings to CSV
  const handleExportCSV = () => {
    if (items.length === 0) return;

    const exportRows = items.map((item) => {
      const g = item.generatedData;
      return {
        'Original Item Name': item.item_name,
        'Condition': item.condition,
        'Target Price': item.price,
        'COGS': item.cost || '',
        'Raw Notes': item.raw_notes,
        'Status': item.status,
        'eBay Title (80-Char Max)': g?.ebay?.title || '',
        'eBay Description': g?.ebay?.description || '',
        'eBay Keywords': g?.ebay?.keywords ? g.ebay.keywords.join(', ') : '',
        'Poshmark Title': g?.poshmark?.title || '',
        'Poshmark Description': g?.poshmark?.description || '',
        'Poshmark Tags': g?.poshmark?.tags ? g.poshmark.tags.join(', ') : '',
        'Mercari Title': g?.mercari?.title || '',
        'Mercari Description': g?.mercari?.description || '',
        'Mercari Hashtags': g?.mercari?.hashtags ? g.mercari.hashtags.join(', ') : '',
        'Pricing & Strategy Tip': g?.pricing_tip || ''
      };
    });

    const csvString = Papa.unparse(exportRows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `flipgen_batch_listings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter items
  const filteredItems = items.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Volume Reseller Engine: 50+ Listings at $0 Cost</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Batch CSV Listing Generator
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Upload your inventory spreadsheet or test with our sample vintage batch. Gemma 2 runs sequentially through every row, outputting tailored titles, descriptions, and keywords for eBay, Poshmark, and Mercari.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleLoadSampleBatch}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Load Sample Vintage Batch (5 Items)</span>
            </button>

            <a
              href="/sample_vintage_batch.csv"
              download
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 font-medium text-xs transition-colors flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Blank / Sample CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* CSV Dropzone & Metrics Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Dropzone */}
        <div className="lg:col-span-7">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-indigo-400 bg-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              Drop your inventory CSV here or click to browse
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Supported columns: <code className="text-indigo-300 font-mono">item_name</code>, <code className="text-indigo-300 font-mono">condition</code>, <code className="text-indigo-300 font-mono">raw_notes</code>, <code className="text-indigo-300 font-mono">price</code>.
            </p>
            <span className="text-[11px] text-slate-500">Supports 50+ items in a single run with zero token rate limits</span>
          </div>
        </div>

        {/* Live Metrics & Money Saved Counter */}
        <div className="lg:col-span-5 flex flex-col justify-between glass-panel rounded-3xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Reseller Cost Advantage
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Free / Local
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">Money Saved</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  ${batchStats.moneySaved.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">vs $0.03/listing cloud APIs</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">Tokens Generated</span>
                <span className="text-xl font-extrabold text-indigo-400 font-mono">
                  {batchStats.totalTokens.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">$0.00 spent</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Batch Progress</span>
                <span className="font-semibold text-slate-200">
                  {completedCount} / {items.length} items ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-2 pt-4">
            {!isProcessing ? (
              <button
                disabled={items.length === 0 || completedCount === items.length}
                onClick={startProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{completedCount > 0 && completedCount < items.length ? 'Resume Batch' : 'Start Batch Processing'}</span>
              </button>
            ) : (
              <button
                onClick={pauseProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Processing</span>
              </button>
            )}

            <button
              disabled={items.length === 0 || isProcessing}
              onClick={resetBatch}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-40 transition-colors"
              title="Reset all rows to pending"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Batch Data Table */}
      {items.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">
                Queue & Listings Table ({items.length} Items)
              </h2>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by name or condition..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleExportCSV}
                disabled={completedCount === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Enriched CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">eBay SEO Title (80-Char)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-950/40">
                {filteredItems.map((item, idx) => {
                  const isCurrent = isProcessing && currentIndex === idx;
                  const g = item.generatedData;
                  const ebayTitle = g?.ebay?.title;
                  const ebayLen = ebayTitle ? ebayTitle.length : 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isCurrent ? 'bg-indigo-500/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        {item.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        )}
                        {item.status === 'processing' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-medium animate-pulse">
                            <Sparkles className="w-3 h-3 animate-spin" /> Processing
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                            Pending
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-100 max-w-xs truncate">
                        {item.item_name}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {item.condition}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-200">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate">
                        {ebayTitle ? (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-200 truncate">{ebayTitle}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                              ebayLen <= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                              {ebayLen}/80
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">Not generated yet</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {item.status === 'completed' ? (
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                          >
                            <Eye className="w-3 h-3 text-indigo-400" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Item Detail Modal / Inspection Drawer */}
      {selectedItem && selectedItem.generatedData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  Listing Preview & Copy
                </span>
                <h3 className="text-base font-bold text-white truncate max-w-lg">
                  {selectedItem.item_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 3 Platform Cards */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {selectedItem.generatedData.pricing_tip && (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                  <strong className="text-indigo-300">Reseller Comps & Pricing Strategy: </strong>
                  {selectedItem.generatedData.pricing_tip}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <PlatformCard
                  platform="ebay"
                  data={selectedItem.generatedData.ebay}
                  price={selectedItem.price}
                />
                <PlatformCard
                  platform="poshmark"
                  data={selectedItem.generatedData.poshmark}
                  price={selectedItem.price}
                />
                <PlatformCard
                  platform="mercari"
                  data={selectedItem.generatedData.mercari}
                  price={selectedItem.price}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
