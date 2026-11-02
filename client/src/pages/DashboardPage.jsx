import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  ArrowRight,
  TrendingUp,
  Clock,
  Split,
  Plus
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useExpense } from '../context/ExpenseContext';

export default function DashboardPage() {
  const { trips, activeTrip, setActiveTripId } = useTrip();
  const { totalSpent } = useExpense();

  const totalTripsPlanned = trips.length;
  const totalEstimatedSpending = trips.reduce(
    (sum, t) => sum + (Number(t.totalEstimatedBudget) || 0),
    0
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-forest text-offwhite shadow-elevated relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-mint/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint/20 border border-mint/40 text-mint text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-warmorange" />
            <span>Welcome back, Girish</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready for your next journey?
          </h1>
          <p className="text-xs sm:text-sm text-mint/80 leading-relaxed">
            Manage your AI-crafted itineraries, interactive OpenStreetMap routes, and Splitwise expense balances in one place.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link
            to="/app/create"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-warmorange hover:bg-warmorange-hover text-charcoal text-xs font-extrabold shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Adventure</span>
          </Link>
        </div>
      </div>

      {/* 4 Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
            Total Trips Planned
          </span>
          <span className="text-2xl font-extrabold text-charcoal mt-1 block">
            {totalTripsPlanned}
          </span>
          <span className="text-[11px] text-charcoal-muted">Persisted in LocalStorage</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
            Total Estimated Budget
          </span>
          <span className="text-2xl font-extrabold text-forest mt-1 block">
            ₹{totalEstimatedSpending.toLocaleString()}
          </span>
          <span className="text-[11px] text-charcoal-muted">Across all adventures</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
            Active Trip Expenses
          </span>
          <span className="text-2xl font-extrabold text-charcoal mt-1 block">
            ₹{totalSpent.toLocaleString()}
          </span>
          <span className="text-[11px] text-charcoal-muted">Recorded group spending</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
            AI Engine Model
          </span>
          <span className="text-sm font-extrabold text-forest mt-2 block font-mono truncate">
            nemotron-3.5-30b
          </span>
          <span className="text-[10px] text-warmorange font-bold uppercase">NVIDIA NIM Verified</span>
        </div>
      </div>

      {/* Current Active Trip Highlight Card */}
      {activeTrip && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-charcoal-border shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-charcoal-border/50">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-warmorange-dark block">
                Primary Focus
              </span>
              <h2 className="text-xl font-extrabold text-charcoal mt-0.5">
                Current Active Itinerary
              </h2>
            </div>

            <Link
              to="/app/itinerary"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-offwhite text-xs font-bold hover:bg-forest-hover shadow-soft transition-colors"
            >
              <span>Open Itinerary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="relative h-48 rounded-2xl overflow-hidden shadow-soft">
              <img
                src={activeTrip.destinationImage || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'}
                alt={activeTrip.destination}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <div className="text-base font-extrabold">{activeTrip.destination}</div>
                <div className="text-xs text-mint font-medium">{activeTrip.duration} Days · {activeTrip.travelers} Travelers</div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-offwhite border border-charcoal-border/60">
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Duration</span>
                  <span className="font-extrabold text-charcoal">{activeTrip.duration} Days</span>
                </div>

                <div className="p-3 rounded-2xl bg-offwhite border border-charcoal-border/60">
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Travel Style</span>
                  <span className="font-extrabold text-forest">{activeTrip.travelStyle || 'Cultural'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-offwhite border border-charcoal-border/60">
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Per Person</span>
                  <span className="font-extrabold text-charcoal">₹{activeTrip.perPersonBudget?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/app/map"
                  className="px-3.5 py-2 rounded-xl bg-offwhite border border-charcoal-border hover:border-forest text-xs font-bold text-charcoal transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-forest" />
                  <span>View Route Map</span>
                </Link>

                <Link
                  to="/app/expenses"
                  className="px-3.5 py-2 rounded-xl bg-offwhite border border-charcoal-border hover:border-forest text-xs font-bold text-charcoal transition-colors flex items-center gap-1.5"
                >
                  <Split className="w-3.5 h-3.5 text-warmorange" />
                  <span>Split Group Expenses</span>
                </Link>

                <Link
                  to="/app/budget"
                  className="px-3.5 py-2 rounded-xl bg-offwhite border border-charcoal-border hover:border-forest text-xs font-bold text-charcoal transition-colors flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5 text-mint-dark" />
                  <span>Budget Breakdown</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Trips Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-charcoal">Your Trips Portfolio</h3>
          <Link to="/app/trips" className="text-xs font-bold text-forest hover:underline">
            View All ({trips.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.slice(0, 3).map((trip) => (
            <div
              key={trip.id}
              onClick={() => setActiveTripId(trip.id)}
              className="p-4 rounded-3xl bg-white border border-charcoal-border shadow-soft hover:shadow-card cursor-pointer transition-all flex items-center gap-3 group"
            >
              <img
                src={trip.destinationImage || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=150&q=80'}
                alt={trip.destination}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-charcoal truncate">{trip.destination}</div>
                <div className="text-[11px] text-charcoal-muted mt-0.5">
                  {trip.duration} Days · {trip.travelers} Travelers
                </div>
                <div className="text-[11px] font-extrabold text-forest mt-1">
                  ₹{trip.totalEstimatedBudget?.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
