import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, MapPin, DollarSign, Loader2, Check } from 'lucide-react';

const STAGES = [
  { label: 'Discovering destination coordinates...', icon: MapPin },
  { label: 'Querying real attractions via Overpass API...', icon: Compass },
  { label: 'Synthesizing itinerary with NVIDIA Nemotron 3.5...', icon: Sparkles },
  { label: 'Calculating route logistics and budget estimates...', icon: DollarSign }
];

export default function LoadingModal({ isOpen, destination }) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-elevated border border-charcoal-border text-center relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-mint/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-warmorange/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central Animated Compass */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-mint/60 animate-ping opacity-30" />
          <div className="relative w-20 h-20 rounded-3xl bg-forest flex items-center justify-center shadow-card text-offwhite">
            <Compass className="w-10 h-10 text-mint animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-xl font-extrabold text-charcoal mb-1">
          Crafting Your Trip to {destination || 'Your Dream Place'}
        </h3>
        <p className="text-xs text-charcoal-muted mb-6">
          Powered by live OpenStreetMap data & NVIDIA Nemotron AI
        </p>

        {/* Stages list */}
        <div className="space-y-3 text-left">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = idx < stageIndex;
            const isCurrent = idx === stageIndex;

            return (
              <div
                key={stage.label}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                  isCurrent
                    ? 'bg-mint/40 border border-mint-dark text-forest font-semibold'
                    : isDone
                    ? 'text-charcoal-muted line-through opacity-70'
                    : 'text-charcoal-muted opacity-40'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-forest text-mint flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-forest animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-xs leading-tight">{stage.label}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-charcoal-border/50 text-[11px] text-charcoal-muted">
          Please wait while Nemotron structures activities and coordinates...
        </div>
      </div>
    </div>
  );
}
