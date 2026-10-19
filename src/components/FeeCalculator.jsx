import React from 'react';
import { TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';

export default function FeeCalculator({ price = 0, cost = 0, pricingTip = '' }) {
  const sellPrice = parseFloat(price) || 0;
  const itemCost = parseFloat(cost) || 0;

  const ebayFee = sellPrice > 0 ? (sellPrice * 0.1325 + 0.30) : 0;
  const ebayNet = Math.max(0, sellPrice - ebayFee);
  const ebayProfit = ebayNet - itemCost;
  const ebayMargin = sellPrice > 0 ? ((ebayProfit / sellPrice) * 100).toFixed(0) : 0;

  const poshFee = sellPrice > 0 ? (sellPrice < 15 ? 2.95 : sellPrice * 0.20) : 0;
  const poshNet = Math.max(0, sellPrice - poshFee);
  const poshProfit = poshNet - itemCost;
  const poshMargin = sellPrice > 0 ? ((poshProfit / sellPrice) * 100).toFixed(0) : 0;

  const mercariFee = sellPrice > 0 ? (sellPrice * 0.10) : 0;
  const mercariNet = Math.max(0, sellPrice - mercariFee);
  const mercariProfit = mercariNet - itemCost;
  const mercariMargin = sellPrice > 0 ? ((mercariProfit / sellPrice) * 100).toFixed(0) : 0;

  const profits = [
    { name: 'eBay', profit: ebayProfit, fee: ebayFee, net: ebayNet, margin: ebayMargin, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { name: 'Mercari', profit: mercariProfit, fee: mercariFee, net: mercariNet, margin: mercariMargin, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { name: 'Poshmark', profit: poshProfit, fee: poshFee, net: poshNet, margin: poshMargin, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  ];

  const highest = profits.reduce((max, p) => p.profit > max.profit ? p : max, profits[0]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Side Hustle Profit & Fee Breakdown</h3>
            <p className="text-[11px] text-slate-400">Estimated net earnings after marketplace fees</p>
          </div>
        </div>

        {sellPrice > 0 && itemCost > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Thrift Cost: <strong className="text-slate-200">${itemCost.toFixed(2)}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Max ROI: <strong className="text-emerald-400">{((highest.profit / itemCost) * 100).toFixed(0)}%</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {profits.map((p) => {
          const isBest = p.name === highest.name && sellPrice > 0;
          return (
            <div 
              key={p.name}
              className={`p-3.5 rounded-xl border relative transition-all ${
                isBest ? 'bg-slate-900 border-emerald-500/40 ring-1 ring-emerald-500/20' : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              {isBest && (
                <span className="absolute -top-2 right-3 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-sm flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> Best Payout
                </span>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${p.color}`}>{p.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">Fee: -${p.fee.toFixed(2)}</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Net Profit</span>
                  <span className={`text-base font-bold font-mono ${p.profit > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    ${p.profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Margin</span>
                  <span>{p.margin}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pricingTip && (
        <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-200 flex gap-2.5 items-start">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-indigo-300 text-[11px] uppercase tracking-wider block">
              Gemma 2 Reseller Strategy Tip
            </span>
            <p className="text-slate-300 text-xs leading-relaxed font-sans">{pricingTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
