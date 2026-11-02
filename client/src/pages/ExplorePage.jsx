import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, MapPin, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import { POPULAR_DESTINATIONS } from '../data/sampleTrips';

export default function ExplorePage() {
  const navigate = useNavigate();

  const handlePlanDestination = (dest) => {
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
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint/40 border border-mint-dark text-forest text-xs font-bold mb-2">
          <Compass className="w-3.5 h-3.5 text-warmorange" />
          <span>Curated Travel Inspiration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">Explore Destinations</h1>
        <p className="text-sm text-charcoal-muted mt-1">
          Select any popular destination to auto-fill trip parameters and let our NVIDIA Nemotron model craft your daily schedule.
        </p>
      </div>

      {/* Destinations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {POPULAR_DESTINATIONS.map((dest) => (
          <div
            key={dest.id}
            className="group bg-white rounded-3xl overflow-hidden border border-charcoal-border shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image */}
            <div className="relative h-56 overflow-hidden bg-charcoal">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-forest">
                {dest.travelStyle}
              </div>

              <div className="absolute top-3 right-3 bg-forest text-mint px-2.5 py-1 rounded-full text-[10px] font-bold">
                {dest.duration} Days
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-xl font-extrabold">{dest.name}</h3>
                <p className="text-xs text-mint font-medium">{dest.tagline}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {dest.description}
              </p>

              <div className="pt-3 border-t border-charcoal-border/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Budget</span>
                  <span className="text-xs font-bold text-forest">₹{dest.recommendedBudget.toLocaleString()}/person</span>
                </div>

                <button
                  onClick={() => handlePlanDestination(dest)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-offwhite text-xs font-bold hover:bg-forest-hover shadow-soft transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-warmorange" />
                  <span>Plan Trip</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
