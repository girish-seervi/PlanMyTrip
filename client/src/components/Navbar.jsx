import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, User, MapPin } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-charcoal-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-forest flex items-center justify-center text-mint shadow-soft group-hover:scale-105 transition-transform duration-200">
            <Compass className="w-6 h-6 text-mint" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-forest tracking-tight">PlanMyTrip</span>
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-warmorange">Smart Travel & Splitter</span>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/explore"
            className="text-sm font-medium text-charcoal hover:text-forest transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-warmorange" />
            Explore
          </Link>
          <Link
            to="/app/trips"
            className="text-sm font-medium text-charcoal hover:text-forest transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-warmorange" />
            My Trips
          </Link>
          <Link
            to="/app/expenses"
            className="text-sm font-medium text-charcoal hover:text-forest transition-colors"
          >
            Expenses
          </Link>
          <Link
            to="/app/itinerary"
            className="text-sm font-medium text-charcoal hover:text-forest transition-colors"
          >
            AI Itinerary
          </Link>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/app"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-charcoal-border text-charcoal text-sm font-semibold hover:bg-offwhite transition-colors"
          >
            <User className="w-4 h-4 text-forest" />
            <span>Demo Profile</span>
          </Link>

          <Link
            to="/app/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-offwhite text-sm font-semibold hover:bg-forest-hover shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4 text-warmorange" />
            <span>Plan My Trip</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
