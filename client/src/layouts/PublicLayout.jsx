import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { Compass, Heart, Github } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-offwhite flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Modern Travel-Tech Footer */}
      <footer className="bg-forest text-offwhite border-t border-forest-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-mint flex items-center justify-center text-forest">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold text-white">PlanMyTrip</span>
              </div>
              <p className="text-xs text-mint/80 leading-relaxed">
                Smart trip planner and expense splitter powered by NVIDIA Nemotron 3.5 AI and OpenStreetMap.
              </p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-warmorange mb-3">Explore</div>
              <ul className="space-y-2 text-xs text-mint/80">
                <li><Link to="/explore" className="hover:text-white transition-colors">Popular Destinations</Link></li>
                <li><Link to="/app/create" className="hover:text-white transition-colors">AI Trip Planner</Link></li>
                <li><Link to="/app/map" className="hover:text-white transition-colors">Interactive Map</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-warmorange mb-3">Features</div>
              <ul className="space-y-2 text-xs text-mint/80">
                <li><Link to="/app/itinerary" className="hover:text-white transition-colors">Editable Itineraries</Link></li>
                <li><Link to="/app/budget" className="hover:text-white transition-colors">Budget Estimator</Link></li>
                <li><Link to="/app/expenses" className="hover:text-white transition-colors">Group Expense Splitter</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-warmorange mb-3">Technology</div>
              <p className="text-xs text-mint/80 leading-relaxed">
                NVIDIA NIM (<code className="text-warmorange">nemotron-3.5-lightning</code>), OpenStreetMap, Nominatim, Overpass API & OSRM routing.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-forest-light flex flex-col sm:flex-row items-center justify-between text-xs text-mint/60">
            <div>© {new Date().getFullYear()} PlanMyTrip Inc. Crafted for modern travelers.</div>
            <div className="flex items-center gap-1 mt-2 sm:mt-0">
              <span>Pair-programmed with</span>
              <Heart className="w-3.5 h-3.5 text-warmorange fill-warmorange inline" />
              <span>for final-year demonstration</span>
            </div>
          </div>
        </div>
      </footer>

      <Toast />
    </div>
  );
}
