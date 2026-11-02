import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Split,
  Route,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { POPULAR_DESTINATIONS } from '../data/sampleTrips';

export default function LandingPage() {
  const navigate = useNavigate();

  // Hero Quick Search Form State
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(15000);

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    navigate('/app/create', {
      state: {
        destination,
        startDate,
        endDate,
        travelers,
        budget
      }
    });
  };

  const handleSelectPopular = (dest) => {
    navigate('/app/create', {
      state: {
        destination: `${dest.name}, ${dest.country}`,
        duration: dest.duration,
        budget: dest.recommendedBudget,
        travelStyle: dest.travelStyle
      }
    });
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2000&q=85"
            alt="Travel Adventure Background"
            className="w-full h-full object-cover object-center filter brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-forest/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint/20 border border-mint/40 text-mint text-xs font-bold tracking-wide backdrop-blur-md animate-in fade-in slide-in-from-top-4">
            <Sparkles className="w-4 h-4 text-warmorange" />
            <span>Powered by NVIDIA Nemotron 3.5 & OpenStreetMap</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Your next adventure <br className="hidden sm:inline" />
            <span className="text-mint">starts here.</span>
          </h1>

          <p className="text-base sm:text-xl text-offwhite/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Plan your perfect trip with AI. Discover places, create itineraries and manage expenses effortlessly.
          </p>

          {/* Quick Search Card Form */}
          <div className="bg-white/95 backdrop-blur-lg p-4 sm:p-6 rounded-3xl shadow-elevated border border-white/40 max-w-4xl mx-auto text-left transition-all">
            <form onSubmit={handleHeroSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Destination */}
              <div className="lg:col-span-2 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-forest" />
                  <span>Destination</span>
                </label>
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm font-semibold text-charcoal bg-offwhite/50"
                  required
                />
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-forest" />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-xs font-semibold text-charcoal bg-offwhite/50"
                />
              </div>

              {/* Travelers */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-forest" />
                  <span>Travelers</span>
                </label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-xs font-semibold text-charcoal bg-offwhite/50"
                >
                  <option value={1}>1 Solo</option>
                  <option value={2}>2 Duo</option>
                  <option value={3}>3 Friends</option>
                  <option value={4}>4 Group</option>
                  <option value={6}>6 Family</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-forest text-offwhite text-sm font-bold hover:bg-forest-hover shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Sparkles className="w-4 h-4 text-warmorange" />
                  <span>Generate My Trip</span>
                </button>
              </div>
            </form>

            {/* Quick Suggestions below input */}
            <div className="mt-4 pt-3 border-t border-charcoal-border/50 flex flex-wrap items-center gap-2 text-xs text-charcoal-muted">
              <span className="font-semibold text-forest">Trending:</span>
              {['Jaipur', 'Goa', 'Manali', 'Bali', 'Kashmir'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setDestination(city)}
                  className="px-2.5 py-1 rounded-full bg-offwhite hover:bg-mint/50 border border-charcoal-border text-charcoal font-medium text-[11px] transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-warmorange-dark mb-1">
              Curated Getaways
            </div>
            <h2 className="text-3xl font-extrabold text-charcoal">
              Popular Destinations
            </h2>
            <p className="text-sm text-charcoal-muted mt-1">
              Pick a top destination and let our AI craft an optimized, budget-friendly itinerary.
            </p>
          </div>
        </div>

        {/* 5 Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {POPULAR_DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              className="group bg-white rounded-3xl overflow-hidden border border-charcoal-border shadow-soft hover:shadow-card transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-lg font-extrabold leading-none">{dest.name}</div>
                  <div className="text-[11px] text-mint font-medium">{dest.country}</div>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-forest">
                  {dest.duration} Days
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed mb-4">
                  {dest.description}
                </p>

                <div className="pt-3 border-t border-charcoal-border/50 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-charcoal-muted uppercase font-bold">Estimated</div>
                    <div className="text-xs font-bold text-forest">₹{dest.recommendedBudget.toLocaleString()}/person</div>
                  </div>

                  <button
                    onClick={() => handleSelectPopular(dest)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest text-offwhite text-xs font-bold hover:bg-forest-hover shadow-soft transition-colors"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-forest text-offwhite p-8 sm:p-12 shadow-elevated relative overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-warmorange">
              Modern Travel-Tech Ecosystem
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Everything you need for seamless group travel
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-mint/20 flex items-center justify-center text-mint">
                <Sparkles className="w-6 h-6 text-warmorange" />
              </div>
              <h3 className="text-lg font-bold text-white">NVIDIA Nemotron AI</h3>
              <p className="text-xs text-mint/80 leading-relaxed">
                Smart day-by-day scheduling based on live OpenStreetMap attractions, travel pace, and actual budget constraints.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-mint/20 flex items-center justify-center text-mint">
                <Route className="w-6 h-6 text-mint" />
              </div>
              <h3 className="text-lg font-bold text-white">Route Optimization</h3>
              <p className="text-xs text-mint/80 leading-relaxed">
                Leaflet interactive maps with real-world OSRM routing. Reorder activities with 1 click to minimize travel distance and driving time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-mint/20 flex items-center justify-center text-mint">
                <Split className="w-6 h-6 text-warmorange" />
              </div>
              <h3 className="text-lg font-bold text-white">Splitwise-Style Splitter</h3>
              <p className="text-xs text-mint/80 leading-relaxed">
                Track group expenses with equal and custom splits. Smart debt simplification automatically calculates who owes whom.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
