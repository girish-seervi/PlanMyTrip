import React from 'react';
import { Check, X, ArrowRight, Sparkles, Navigation, TrendingDown, Clock } from 'lucide-react';

export default function OptimizeComparisonModal({
  isOpen,
  onClose,
  optimizationData,
  onAccept,
  onReject
}) {
  if (!isOpen || !optimizationData) return null;

  const { optimizedItinerary, metrics, currentItinerary } = optimizationData;
  const currentDays = currentItinerary?.days || [];
  const optDays = optimizedItinerary?.days || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-elevated border border-charcoal-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-forest text-offwhite border-b border-forest-light flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-mint/20 border border-mint/40 flex items-center justify-center text-mint">
              <Sparkles className="w-5 h-5 text-warmorange" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">AI Route Optimization</h3>
              <p className="text-xs text-mint/80">
                Attractions grouped and reordered geographically to eliminate back-and-forth travel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-offwhite/80 hover:text-white hover:bg-forest-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Efficiency Metrics Cards */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-offwhite border-b border-charcoal-border">
          <div className="p-3.5 rounded-2xl bg-white border border-charcoal-border shadow-soft text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center justify-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-forest" />
              <span>Distance Saved</span>
            </div>
            <div className="text-xl font-extrabold text-forest mt-1">
              {metrics.savedDistanceKm} km
            </div>
            <div className="text-[10px] text-charcoal-muted">
              From {metrics.originalDistanceKm} km to {metrics.optimizedDistanceKm} km
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-charcoal-border shadow-soft text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-warmorange" />
              <span>Drive Time Saved</span>
            </div>
            <div className="text-xl font-extrabold text-warmorange-dark mt-1">
              ~{metrics.savedMinutes} mins
            </div>
            <div className="text-[10px] text-charcoal-muted">Estimated urban transit</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-charcoal-border shadow-soft text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center justify-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-mint-dark" />
              <span>Efficiency Gain</span>
            </div>
            <div className="text-xl font-extrabold text-forest mt-1">
              {metrics.percentageSaved}%
            </div>
            <div className="text-[10px] text-charcoal-muted">Less transit fatigue</div>
          </div>
        </div>

        {/* Day-by-Day Reorder Comparison */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
            Comparison of Day Routes:
          </div>

          {optDays.map((optDay, index) => {
            const originalDay = currentDays[index] || { activities: [] };
            const originalActs = originalDay.activities || [];
            const optActs = optDay.activities || [];

            return (
              <div key={optDay.day} className="p-4 rounded-2xl border border-charcoal-border bg-white space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-charcoal-border/50">
                  <span className="text-xs font-bold text-forest">
                    Day {optDay.day}: {optDay.title}
                  </span>
                  <span className="text-[11px] font-medium text-charcoal-muted">
                    {optDay.originalDistanceKm} km → {optDay.optimizedDistanceKm} km
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Before */}
                  <div className="p-3 rounded-xl bg-offwhite/80 border border-charcoal-border/60">
                    <div className="font-bold text-charcoal-muted mb-2 text-[10px] uppercase">
                      Current Sequence:
                    </div>
                    <ol className="space-y-1.5 list-decimal list-inside text-charcoal">
                      {originalActs.map((act, i) => (
                        <li key={act.id || i} className="truncate">
                          <span className="font-semibold text-charcoal">{act.name}</span>
                          <span className="text-charcoal-muted text-[10px] ml-1.5">({act.time})</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* After */}
                  <div className="p-3 rounded-xl bg-mint/30 border border-mint-dark/50">
                    <div className="font-bold text-forest mb-2 text-[10px] uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-warmorange" />
                      <span>Optimized Sequence:</span>
                    </div>
                    <ol className="space-y-1.5 list-decimal list-inside text-forest">
                      {optActs.map((act, i) => (
                        <li key={act.id || i} className="truncate">
                          <span className="font-bold text-forest">{act.name}</span>
                          <span className="text-forest/70 text-[10px] ml-1.5">({act.time})</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-offwhite border-t border-charcoal-border flex items-center justify-between">
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-charcoal-border text-xs font-bold text-charcoal hover:bg-white transition-colors"
          >
            <X className="w-3.5 h-3.5 text-charcoal-muted" />
            <span>Keep Original</span>
          </button>

          <button
            onClick={onAccept}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest text-offwhite text-xs font-bold hover:bg-forest-hover shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Check className="w-4 h-4 text-mint" />
            <span>Accept Optimization</span>
          </button>
        </div>
      </div>
    </div>
  );
}
