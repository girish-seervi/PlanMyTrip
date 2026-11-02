import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Plus, ChevronDown, Check, Cpu, Sparkles } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { checkServerStatus } from '../services/api';

export default function Header({ onToggleSidebar, onOpenSettings }) {
  const { trips, activeTrip, activeTripId, setActiveTripId, customApiKey } = useTrip();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState({ online: false, hasKey: false });

  useEffect(() => {
    let mounted = true;
    checkServerStatus().then((res) => {
      if (mounted) {
        setServerStatus({
          online: res.status === 'online',
          hasKey: res.nvidiaKeyConfigured || Boolean(customApiKey)
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, [customApiKey]);

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-md border-b border-charcoal-border/60 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Trip Switcher */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-charcoal hover:bg-offwhite transition-colors border border-charcoal-border"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Active Trip Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-offwhite hover:bg-mint/30 border border-charcoal-border text-left transition-all"
          >
            <div className="hidden sm:block">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">Active Trip</span>
              <span className="block text-sm font-bold text-forest truncate max-w-[200px]">
                {activeTrip ? activeTrip.destination : 'No Trip Selected'}
              </span>
            </div>
            <div className="sm:hidden text-xs font-bold text-forest truncate max-w-[130px]">
              {activeTrip ? activeTrip.destination.split(',')[0] : 'Trips'}
            </div>
            <ChevronDown className={`w-4 h-4 text-charcoal-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white shadow-elevated border border-charcoal-border py-2 z-30 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-charcoal-muted border-b border-charcoal-border/50">
                  Switch Active Trip
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {trips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => {
                        setActiveTripId(trip.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-offwhite transition-colors ${
                        trip.id === activeTripId ? 'bg-mint/40 font-bold' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-charcoal truncate">{trip.destination}</div>
                        <div className="text-[10px] text-charcoal-muted">
                          {trip.duration} Days · {trip.currency} {trip.totalEstimatedBudget?.toLocaleString()}
                        </div>
                      </div>
                      {trip.id === activeTripId && <Check className="w-4 h-4 text-forest shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-charcoal-border/50">
                  <Link
                    to="/app/create"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-forest text-offwhite text-xs font-semibold hover:bg-forest-hover transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Trip</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: AI Model Status, Quick Actions */}
      <div className="flex items-center gap-3">
        {/* NVIDIA Nemotron Status Badge */}
        <button
          onClick={onOpenSettings}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
            serverStatus.hasKey
              ? 'bg-mint/40 border-mint-dark text-forest'
              : 'bg-warmorange/10 border-warmorange/40 text-warmorange-dark'
          }`}
          title="Click to manage NVIDIA Nemotron API Key"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Nemotron 3.5</span>
          <span className={`w-2 h-2 rounded-full ${serverStatus.hasKey ? 'bg-forest' : 'bg-warmorange animate-pulse'}`} />
        </button>

        {/* Quick Create Trip Button */}
        <Link
          to="/app/create"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-offwhite text-sm font-semibold hover:bg-forest-hover shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Sparkles className="w-4 h-4 text-warmorange" />
          <span className="hidden sm:inline">New Trip</span>
        </Link>
      </div>
    </header>
  );
}
