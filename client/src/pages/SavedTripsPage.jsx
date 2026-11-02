import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Trash2,
  Copy,
  Eye,
  Plus,
  Sparkles,
  BookmarkCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useNotification } from '../context/NotificationContext';

export default function SavedTripsPage() {
  const navigate = useNavigate();
  const { trips, activeTripId, setActiveTripId, deleteTrip, duplicateTrip } = useTrip();
  const { showSuccess, showInfo } = useNotification();

  const [tripToDelete, setTripToDelete] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredTrips = trips.filter((t) =>
    (t.destination || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleViewTrip = (id) => {
    setActiveTripId(id);
    navigate('/app/itinerary');
  };

  const handleDuplicateTrip = (id) => {
    const cloned = duplicateTrip(id);
    if (cloned) {
      showSuccess(`Trip duplicated: "${cloned.destination}"`);
    }
  };

  const confirmDelete = () => {
    if (tripToDelete) {
      deleteTrip(tripToDelete.id);
      showInfo(`Trip "${tripToDelete.destination}" deleted.`);
      setTripToDelete(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-warmorange-dark">
            Trip Portfolio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            My Saved Trips
          </h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Persisted locally in your browser. Switch between plans anytime.
          </p>
        </div>

        <Link
          to="/app/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest text-offwhite text-xs font-extrabold hover:bg-forest-hover shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-warmorange" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Filter Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Filter saved trips by destination..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full px-4 py-2.5 rounded-2xl border border-charcoal-border focus:border-forest text-xs font-medium bg-white"
        />
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map((trip) => {
          const isActive = trip.id === activeTripId;

          return (
            <div
              key={trip.id}
              className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? 'border-forest ring-2 ring-forest/20 shadow-card'
                  : 'border-charcoal-border hover:border-forest/40 shadow-soft hover:shadow-card'
              }`}
            >
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden bg-charcoal">
                <img
                  src={trip.destinationImage || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'}
                  alt={trip.destination}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-forest">
                  {trip.status || 'Upcoming'}
                </div>

                {/* Demo Badge */}
                {trip.isDemo && (
                  <div className="absolute top-3 right-3 bg-warmorange text-charcoal px-2 py-0.5 rounded-full text-[9px] font-bold">
                    Demo
                  </div>
                )}

                {/* Title */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-extrabold truncate drop-shadow-sm">
                    {trip.destination}
                  </h3>
                  <div className="text-xs text-mint font-medium flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3 h-3 text-warmorange" />
                    <span>{trip.startDate || 'Upcoming'} · {trip.duration} Days</span>
                  </div>
                </div>
              </div>

              {/* Body Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-offwhite border border-charcoal-border/50">
                    <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Travelers</span>
                    <span className="font-extrabold text-charcoal">{trip.travelers} People</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-offwhite border border-charcoal-border/50">
                    <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Estimated Budget</span>
                    <span className="font-extrabold text-forest">
                      ₹{trip.totalEstimatedBudget?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-charcoal-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicateTrip(trip.id)}
                      className="p-2 rounded-xl text-charcoal-muted hover:text-forest hover:bg-offwhite transition-colors"
                      title="Duplicate Trip"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setTripToDelete(trip)}
                      className="p-2 rounded-xl text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleViewTrip(trip.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-mint text-forest border border-mint-dark'
                        : 'bg-forest text-offwhite hover:bg-forest-hover shadow-sm'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Active Plan' : 'View Trip'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Permanent Deletion */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-elevated border border-charcoal-border text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-charcoal">Delete Trip Itinerary?</h3>
            <p className="text-xs text-charcoal-muted mt-2 mb-6">
              Are you sure you want to delete <strong className="text-charcoal">{tripToDelete.destination}</strong>? All associated activities, budget estimates, and group expenses will be removed from LocalStorage.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-charcoal-border text-xs font-bold text-charcoal hover:bg-offwhite"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
