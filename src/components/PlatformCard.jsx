import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Hash, Tag, Info, ShoppingBag } from 'lucide-react';

export default function PlatformCard({ platform, data, price }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!data) return null;

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderBadge = () => {
    switch (platform) {
      case 'ebay':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>eBay</span>
            <span className="text-[10px] text-blue-300 font-normal">80-Char SEO</span>
          </div>
        );
      case 'poshmark':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 font-semibold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
            <span>Poshmark</span>
            <span className="text-[10px] text-pink-300 font-normal">Closet Style</span>
          </div>
        );
      case 'mercari':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>Mercari</span>
            <span className="text-[10px] text-indigo-300 font-normal">Fast Sale</span>
          </div>
        );
      default:
        return null;
    }
  };

  const titleLength = data.title ? data.title.length : 0;
  const isEbay = platform === 'ebay';
  const isOverEbayLimit = isEbay && titleLength > 80;

  // Build full listing text for 1-click copy
  const getFullListingText = () => {
    let text = `TITLE:\n${data.title}\n\nDESCRIPTION:\n${data.description}`;
    if (data.keywords && data.keywords.length) {
      text += `\n\nKEYWORDS:\n${data.keywords.join(', ')}`;
    }
    if (data.tags && data.tags.length) {
      text += `\n\nTAGS:\n${data.tags.map(t => `#${t}`).join(' ')}`;
    }
    if (data.hashtags && data.hashtags.length) {
      text += `\n\nHASHTAGS:\n${data.hashtags.join(' ')}`;
    }
    return text;
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:border-slate-700/80 group">
      
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {renderBadge()}
        </div>

        {/* eBay Char Limit Indicator */}
        {isEbay && (
          <div className={`text-[11px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 ${
            isOverEbayLimit
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold'
              : titleLength >= 70
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <span>{titleLength}</span>
            <span className="text-slate-600">/</span>
            <span>80 chars</span>
          </div>
        )}

        <button
          onClick={() => handleCopy(getFullListingText(), `${platform}-all`)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors border border-slate-700/60"
          title="Copy entire listing (Title + Description + Tags)"
        >
          {copiedKey === `${platform}-all` ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied All</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy All</span>
            </>
          )}
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5 space-y-4 flex-1 flex flex-col">
        
        {/* Title Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Listing Title
            </span>
            <button
              onClick={() => handleCopy(data.title, `${platform}-title`)}
              className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              {copiedKey === `${platform}-title` ? (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-0.5">
                  <Copy className="w-3 h-3" /> Copy Title
                </span>
              )}
            </button>
          </div>
          <p className="text-sm font-medium text-slate-100 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
            {data.title || 'Generating title...'}
          </p>
        </div>

        {/* Description Section */}
        <div className="space-y-1.5 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Description & Specifics
            </span>
            <button
              onClick={() => handleCopy(data.description, `${platform}-desc`)}
              className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              {copiedKey === `${platform}-desc` ? (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-0.5">
                  <Copy className="w-3 h-3" /> Copy Body
                </span>
              )}
            </button>
          </div>
          <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 whitespace-pre-wrap leading-relaxed font-sans flex-1 max-h-60 overflow-y-auto">
            {data.description || 'Generating description...'}
          </div>
        </div>

        {/* Tags / Keywords */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
            {isEbay ? 'Search Keywords' : platform === 'poshmark' ? 'Closet Style Tags' : 'Hashtags'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {isEbay && data.keywords?.map((kw, i) => (
              <span
                key={i}
                onClick={() => handleCopy(kw, `kw-${i}`)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors flex items-center gap-1 font-mono"
                title="Click to copy keyword"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                {kw}
              </span>
            ))}

            {platform === 'poshmark' && data.tags?.map((tag, i) => (
              <span
                key={i}
                onClick={() => handleCopy(`#${tag.replace('#', '')}`, `ptag-${i}`)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20 cursor-pointer hover:bg-pink-500/20 transition-colors flex items-center gap-1 font-mono"
                title="Click to copy tag"
              >
                <Hash className="w-2.5 h-2.5 opacity-60" />
                {tag.replace('#', '')}
              </span>
            ))}

            {platform === 'mercari' && data.hashtags?.map((ht, i) => (
              <span
                key={i}
                onClick={() => handleCopy(ht, `mht-${i}`)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 cursor-pointer hover:bg-indigo-500/20 transition-colors flex items-center gap-1 font-mono"
                title="Click to copy hashtag"
              >
                <Hash className="w-2.5 h-2.5 opacity-60" />
                {ht.replace('#', '')}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Info Pill */}
      <div className="px-5 py-2.5 bg-slate-900/30 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="text-slate-500">
          {isEbay ? 'Standard 13.25% + $0.30' : platform === 'poshmark' ? 'Flat 20% Fee' : '10% Selling Fee'}
        </span>
        <span className="font-semibold text-slate-300">
          Target: ${parseFloat(price || 0).toFixed(2)}
        </span>
      </div>

    </div>
  );
}
