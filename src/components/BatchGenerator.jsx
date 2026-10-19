import React, { useState, useRef } from 'react';
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
  DollarSign, 
  Search,
  Eye,
  X,
  Layers,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';
import { SAMPLE_BATCH_ITEMS, SAMPLE_CSV_CONTENT } from '../services/sampleData';
import { generateListing } from '../services/ollamaService';

export default function BatchGenerator({ ollamaStatus, config }) {
  const [items, setItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const [batchStats, setBatchStats] = useState({
    totalTokens: 0,
    startTime: null,
    totalDurationMs: 0,
    moneySaved: 0.0,
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
      status: 'pending',
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
          niche: row.niche || row.category || 'General Merchandise',
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
      if (items[i].status === 'completed') continue;

      setCurrentIndex(i);

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
          const tokensFromItem = res.metrics?.tokens || 340;
          currentTokens += tokensFromItem;
          const currentDuration = Math.round(performance.now() - batchStartTime);

          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? {
                    ...item,
                    status: 'completed',
                    generatedData: res.data,
                    metrics: res.metrics,
                    error: null
                  }
                : item
            )
          );

          setBatchStats({
            totalTokens: currentTokens,
            startTime: batchStartTime,
            totalDurationMs: currentDuration,
            moneySaved: parseFloat((completed * 0.03).toFixed(2)),
            completedCount: completed
          });
        }
      } catch (err) {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                  ...item,
                  status: 'failed',
                  error: err.message || 'Generation error'
                }
              : item
          )
        );
      }
    }

    setIsProcessing(false);
    setCurrentIndex(-1);

    if (completed > 0) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#ea580c', '#16a34a', '#2563eb']
      });
    }
  };

  const stopProcessing = () => {
    stopSignalRef.current = true;
    setIsProcessing(false);
  };

  const handleReset = () => {
    stopProcessing();
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'pending',
        generatedData: null,
        error: null
      }))
    );
    setCurrentIndex(-1);
    setBatchStats({
      totalTokens: 0,
      startTime: null,
      totalDurationMs: 0,
      moneySaved: 0.0,
      completedCount: 0
    });
  };

  // Export Enriched CSV
  const handleExportCSV = () => {
    if (items.length === 0) return;

    const exportRows = items.map((item) => ({
      item_name: item.item_name,
      condition: item.condition,
      price: item.price,
      cost: item.cost,
      raw_notes: item.raw_notes,
      status: item.status,
      ebay_title: item.generatedData?.ebay?.title || '',
      ebay_description: item.generatedData?.ebay?.description || '',
      poshmark_title: item.generatedData?.poshmark?.title || '',
      poshmark_description: item.generatedData?.poshmark?.description || '',
      poshmark_tags: item.generatedData?.poshmark?.tags?.join(' ') || '',
      mercari_title: item.generatedData?.mercari?.title || '',
      mercari_description: item.generatedData?.mercari?.description || '',
      mercari_hashtags: item.generatedData?.mercari?.hashtags?.join(' ') || ''
    }));

    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FlipGen_Enriched_Batch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSampleTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'FlipGen_Batch_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const filteredItems = items.filter((item) =>
    (item.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.condition || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedTotal = items.filter((i) => i.status === 'completed').length;
  const progressPercent = items.length > 0 ? Math.round((completedTotal / items.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
            <span>Catalog Desk</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Batch Processing</span>
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium ml-1">
              {items.length} in queue
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-sans">
            Batch CSV Processing Desk
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Bulk-synthesize multi-platform listings from spreadsheets with on-device Gemma 2 at $0 token cost.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleLoadSampleBatch}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
          >
            📻 Load 5 Sample Flips
          </button>
          <button
            type="button"
            onClick={handleDownloadSampleTemplate}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
          >
            Template CSV
          </button>
        </div>
      </div>

      {/* Upload Dropzone (if empty or collapsed) */}
      {items.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className={`bg-white rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-all ${
            dragOver ? 'border-orange-500 bg-orange-50/20' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
            <Upload className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Drop inventory CSV file here or browse
          </h3>
          <p className="text-xs text-slate-500 max-w-md mb-4">
            Supports CSV headers: <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">item_name</code>, <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">condition</code>, <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">raw_notes</code>, <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">price</code>
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Select CSV File
            </button>
            <button
              type="button"
              onClick={handleLoadSampleBatch}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all cursor-pointer"
            >
              Use 5 Sample Vintage Items
            </button>
          </div>
        </div>
      )}

      {/* Batch Stats & Controls (when items loaded) */}
      {items.length > 0 && (
        <div className="space-y-4">
          
          {/* Summary Economics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Queue Progress
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {completedTotal} / {items.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">{progressPercent}%</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Inference Cost
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono">
                  $0.00
                </span>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  100% On-Device
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                API Cost Saved
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                  ${batchStats.moneySaved.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-medium">vs GPT-4o</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Tokens Generated
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                  {batchStats.totalTokens}
                </span>
                <span className="text-xs text-slate-500 font-medium">Gemma 2</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {!isProcessing ? (
                <button
                  type="button"
                  onClick={startProcessing}
                  disabled={completedTotal === items.length}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Batch Pipeline</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>Pause Processing</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={completedTotal === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Enriched CSV</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter items..."
                className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Item & Identifier</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Cost</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item, idx) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/70 transition-colors ${
                        item.status === 'processing' ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate" title={item.item_name}>
                          {item.item_name}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {item.raw_notes || 'No raw notes provided'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {item.condition}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        ${parseFloat(item.cost || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {item.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                            <Check className="w-3 h-3" /> Ready
                          </span>
                        ) : item.status === 'processing' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 animate-pulse">
                            Processing
                          </span>
                        ) : item.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700">
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={!item.generatedData}
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Inspect Item Drawer / Modal */}
      {selectedItem && selectedItem.generatedData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 max-h-[85vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Batch Item Specimen
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedItem.item_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* eBay */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  eBay Title ({selectedItem.generatedData.ebay?.title?.length || 0}/80)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedItem.generatedData.ebay?.title, 'drawer-ebay')}
                  className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {copiedKey === 'drawer-ebay' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {selectedItem.generatedData.ebay?.title}
              </p>
              <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap pt-2">
                {selectedItem.generatedData.ebay?.description}
              </p>
            </div>

            {/* Poshmark */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  Poshmark Headline & Tags
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedItem.generatedData.poshmark?.title, 'drawer-posh')}
                  className="text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors"
                >
                  {copiedKey === 'drawer-posh' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {selectedItem.generatedData.poshmark?.title}
              </p>
              <p className="text-xs text-slate-600 whitespace-pre-wrap pt-1">
                {selectedItem.generatedData.poshmark?.description}
              </p>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {selectedItem.generatedData.poshmark?.tags?.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                    {t.startsWith('#') ? t : `#${t}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Mercari */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Mercari Headline & Bullets
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedItem.generatedData.mercari?.title, 'drawer-merc')}
                  className="text-xs font-semibold text-slate-600 hover:text-amber-600 transition-colors"
                >
                  {copiedKey === 'drawer-merc' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {selectedItem.generatedData.mercari?.title}
              </p>
              <div className="text-xs text-slate-600 whitespace-pre-wrap pt-1">
                {selectedItem.generatedData.mercari?.description}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
