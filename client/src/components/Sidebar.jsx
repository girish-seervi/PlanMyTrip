import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  Search,
  PlusCircle,
  CalendarCheck2,
  Map as MapIcon,
  PieChart,
  Split,
  BookmarkCheck,
  Settings,
  X,
  ChevronRight
} from 'lucide-react';
import { useTrip } from '../context/TripContext';

const NAV_ITEMS = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/explore', icon: Search, label: 'Explore Destinations' },
  { to: '/app/create', icon: PlusCircle, label: 'Create New Trip', highlight: true },
  { to: '/app/itinerary', icon: CalendarCheck2, label: 'My Itinerary' },
  { to: '/app/map', icon: MapIcon, label: 'Interactive Map' },
  { to: '/app/budget', icon: PieChart, label: 'Budget Planner' },
  { to: '/app/expenses', icon: Split, label: 'Expense Splitter' },
  { to: '/app/trips', icon: BookmarkCheck, label: 'Saved Trips' }
];

export default function Sidebar({ isOpen, onClose, onOpenSettings }) {
  const { activeTrip } = useTrip();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-charcoal/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-charcoal-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-charcoal-border/60">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-mint shadow-soft group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-mint" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-forest tracking-tight">PlanMyTrip</span>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-warmorange">AI Travel & Splitter</span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-charcoal hover:bg-offwhite transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Trip Mini Indicator */}
          {activeTrip && (
            <div className="mx-4 my-4 p-3 rounded-2xl bg-mint/40 border border-mint-dark/40 flex items-center gap-3">
              <img
                src={activeTrip.destinationImage || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=150&q=80'}
                alt={activeTrip.destination}
                className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-forest/70 flex items-center gap-1">
                  <span>Current Trip</span>
                  {activeTrip.isDemo && (
                    <span className="bg-warmorange/20 text-warmorange-dark px-1.5 py-0.2 text-[9px] rounded font-semibold">Demo</span>
                  )}
                </div>
                <div className="text-xs font-bold text-charcoal truncate">{activeTrip.destination}</div>
                <div className="text-[11px] text-charcoal-muted">{activeTrip.duration} Days · {activeTrip.travelers} Travelers</div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-forest text-offwhite shadow-soft'
                        : item.highlight
                        ? 'text-forest hover:bg-mint/40 border border-forest/15'
                        : 'text-charcoal hover:bg-offwhite hover:text-forest'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-warmorange'
                              : item.highlight
                              ? 'text-forest'
                              : 'text-charcoal-muted group-hover:text-forest'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-mint/80" />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-charcoal-border/60 space-y-2">
          {/* Settings Button */}
          <button
            onClick={() => {
              onClose?.();
              onOpenSettings();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-charcoal hover:bg-offwhite hover:text-forest transition-colors"
          >
            <Settings className="w-4 h-4 text-charcoal-muted" />
            <span>Settings & API Key</span>
          </button>

          {/* Demo User Info */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-offwhite border border-charcoal-border/50">
            <div className="w-9 h-9 rounded-full bg-forest text-mint flex items-center justify-center font-bold text-sm shadow-sm">
              GK
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-charcoal truncate">Girish Kailash</div>
              <div className="text-[10px] text-charcoal-muted">Traveler Profile (Demo)</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
