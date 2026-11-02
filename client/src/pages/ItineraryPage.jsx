import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Users,
  DollarSign,
  Clock,
  MapPin,
  Tag,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Zap,
  ArrowRightLeft,
  ChevronRight,
  Map as MapIcon,
  Sun,
  Sunset,
  Moon,
  Info
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useItinerary } from '../context/ItineraryContext';
import EditActivityModal from '../components/EditActivityModal';
import AddActivityModal from '../components/AddActivityModal';
import OptimizeComparisonModal from '../components/OptimizeComparisonModal';

export default function ItineraryPage() {
  const { activeTrip } = useTrip();
  const {
    editActivity,
    removeActivity,
    addActivity,
    moveActivity,
    regenerateDayPlan,
    optimizeTripRoute,
    acceptOptimizedItinerary,
    rejectOptimizedItinerary,
    isRegeneratingDay,
    isOptimizing,
    optimizationComparison
  } = useItinerary();

  // Active Day Tab (1, 2, 3...)
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);

  // Modal states
  const [editingActivity, setEditingActivity] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [regeneratingDayNumber, setRegeneratingDayNumber] = useState(null);

  if (!activeTrip || !activeTrip.days || activeTrip.days.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-charcoal-border shadow-soft p-8">
        <div className="w-16 h-16 rounded-3xl bg-mint/50 flex items-center justify-center text-forest mx-auto mb-4">
          <Calendar className="w-8 h-8 text-forest" />
        </div>
        <h2 className="text-2xl font-extrabold text-charcoal">No Active Itinerary Found</h2>
        <p className="text-sm text-charcoal-muted max-w-md mx-auto mt-2 mb-6">
          Start by generating a new AI-powered trip or select a saved trip from your collection.
        </p>
        <Link
          to="/app/create"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest text-offwhite text-sm font-bold hover:bg-forest-hover shadow-soft transition-colors"
        >
          <Sparkles className="w-4 h-4 text-warmorange" />
          <span>Create a Trip</span>
        </Link>
      </div>
    );
  }

  const days = activeTrip.days || [];
  const currentDay = days.find((d) => d.day === selectedDayNumber) || days[0];

  const handleRegenerateClick = async (dayNum) => {
    setRegeneratingDayNumber(dayNum);
    await regenerateDayPlan(dayNum);
    setRegeneratingDayNumber(null);
  };

  // Group activities into morning, afternoon, evening
  const morningActivities = (currentDay?.activities || []).filter(
    (a) => (a.slot || '').toLowerCase() === 'morning' || a.time?.includes('AM')
  );

  const afternoonActivities = (currentDay?.activities || []).filter(
    (a) => (a.slot || '').toLowerCase() === 'afternoon' ||
      (a.time?.includes('PM') && parseInt(a.time, 10) < 5 && parseInt(a.time, 10) !== 12) ||
      a.time?.startsWith('12:')
  );

  const eveningActivities = (currentDay?.activities || []).filter(
    (a) => !morningActivities.includes(a) && !afternoonActivities.includes(a)
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Itinerary Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-forest text-offwhite shadow-elevated border border-forest-light">
        {/* Destination Cover Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeTrip.destinationImage || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'}
            alt={activeTrip.destination}
            className="w-full h-full object-cover object-center filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* AI Generated Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint/20 border border-mint/40 text-mint text-xs font-extrabold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-warmorange" />
                <span>AI Generated with Nemotron 3.5</span>
              </span>
              {activeTrip.isDemo && (
                <span className="bg-warmorange text-charcoal px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Demo Itinerary
                </span>
              )}
            </div>

            {/* Quick Action: Optimize Route & Map */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={optimizeTripRoute}
                disabled={isOptimizing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warmorange hover:bg-warmorange-hover text-charcoal text-xs font-extrabold shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
              >
                <Zap className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                <span>{isOptimizing ? 'Optimizing Routes...' : 'Optimize Trip'}</span>
              </button>

              <Link
                to="/app/map"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors"
              >
                <MapIcon className="w-4 h-4 text-mint" />
                <span>View on Map</span>
              </Link>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {activeTrip.destination}
            </h1>
            <p className="text-sm text-mint/80 mt-1">
              Customized for {activeTrip.travelStyle || 'Cultural'} travel · {activeTrip.duration} Days Adventure
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-mint/70 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-warmorange" />
                <span>Duration</span>
              </span>
              <span className="text-base font-extrabold text-white block mt-0.5">
                {activeTrip.duration} Days
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-mint/70 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-mint" />
                <span>Travelers</span>
              </span>
              <span className="text-base font-extrabold text-white block mt-0.5">
                {activeTrip.travelers} People
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-mint/70 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-warmorange" />
                <span>Per Person</span>
              </span>
              <span className="text-base font-extrabold text-white block mt-0.5">
                ₹{activeTrip.perPersonBudget?.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-mint/70 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-mint" />
                <span>Total Budget</span>
              </span>
              <span className="text-base font-extrabold text-white block mt-0.5">
                ₹{activeTrip.totalEstimatedBudget?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Day Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {days.map((day) => {
            const isSelected = day.day === selectedDayNumber;
            return (
              <button
                key={day.day}
                onClick={() => setSelectedDayNumber(day.day)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-forest text-offwhite shadow-soft scale-105'
                    : 'bg-white border border-charcoal-border text-charcoal hover:bg-mint/30 hover:border-forest/30'
                }`}
              >
                <span>Day {day.day}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isSelected ? 'bg-mint text-forest' : 'bg-offwhite text-charcoal-muted'
                }`}>
                  {day.activities?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Day Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Add Activity */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-charcoal-border hover:border-forest text-charcoal text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-forest" />
            <span>Add Place</span>
          </button>

          {/* Regenerate Current Day with AI */}
          <button
            onClick={() => handleRegenerateClick(selectedDayNumber)}
            disabled={regeneratingDayNumber === selectedDayNumber}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-mint text-forest border border-mint-dark text-xs font-bold hover:bg-mint-dark/50 transition-colors disabled:opacity-50"
            title="Generate fresh attractions for this specific day using NVIDIA Nemotron AI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regeneratingDayNumber === selectedDayNumber ? 'animate-spin' : ''}`} />
            <span>{regeneratingDayNumber === selectedDayNumber ? 'Regenerating...' : 'Regenerate Day with AI'}</span>
          </button>
        </div>
      </div>

      {/* Selected Day Content */}
      <div className="space-y-6">
        {/* Day Title & Daily Cost Banner */}
        <div className="p-5 rounded-3xl bg-white border border-charcoal-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-warmorange-dark">
              Day {currentDay.day} Focus
            </div>
            <h2 className="text-xl font-extrabold text-charcoal mt-0.5">
              {currentDay.title || `Day ${currentDay.day} Sightseeing`}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="p-2.5 rounded-2xl bg-offwhite border border-charcoal-border/70 text-right">
              <span className="text-[10px] text-charcoal-muted uppercase font-bold block">Estimated Daily Cost</span>
              <span className="text-sm font-extrabold text-forest">₹{currentDay.estimatedDailyCost?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Day Activity Slots */}
        <div className="space-y-6">
          {/* Morning Activities */}
          {morningActivities.length > 0 && (
            <TimeSlotSection
              title="Morning"
              icon={Sun}
              color="text-warmorange"
              activities={morningActivities}
              dayNumber={currentDay.day}
              allDays={days}
              onEdit={(act) => setEditingActivity(act)}
              onRemove={(actId) => removeActivity(currentDay.day, actId)}
              onMove={(actId, toDay) => moveActivity(currentDay.day, toDay, actId)}
            />
          )}

          {/* Afternoon Activities */}
          {afternoonActivities.length > 0 && (
            <TimeSlotSection
              title="Afternoon"
              icon={Sunset}
              color="text-warmorange-dark"
              activities={afternoonActivities}
              dayNumber={currentDay.day}
              allDays={days}
              onEdit={(act) => setEditingActivity(act)}
              onRemove={(actId) => removeActivity(currentDay.day, actId)}
              onMove={(actId, toDay) => moveActivity(currentDay.day, toDay, actId)}
            />
          )}

          {/* Evening Activities */}
          {eveningActivities.length > 0 && (
            <TimeSlotSection
              title="Evening"
              icon={Moon}
              color="text-forest"
              activities={eveningActivities}
              dayNumber={currentDay.day}
              allDays={days}
              onEdit={(act) => setEditingActivity(act)}
              onRemove={(actId) => removeActivity(currentDay.day, actId)}
              onMove={(actId, toDay) => moveActivity(currentDay.day, toDay, actId)}
            />
          )}

          {/* Empty state for day if all activities removed */}
          {(!currentDay.activities || currentDay.activities.length === 0) && (
            <div className="text-center py-12 p-6 rounded-3xl bg-white border border-charcoal-border">
              <p className="text-xs text-charcoal-muted mb-3">No activities planned for this day yet.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-forest text-offwhite text-xs font-bold"
              >
                Add Your First Place
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Activity Modal */}
      <EditActivityModal
        isOpen={Boolean(editingActivity)}
        activity={editingActivity}
        dayNumber={selectedDayNumber}
        onClose={() => setEditingActivity(null)}
        onSave={(dNum, actId, data) => editActivity(dNum, actId, data)}
      />

      {/* Add Custom Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        dayNumber={selectedDayNumber}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(dNum, data) => addActivity(dNum, data)}
      />

      {/* Route Optimization Comparison Modal */}
      <OptimizeComparisonModal
        isOpen={Boolean(optimizationComparison)}
        optimizationData={optimizationComparison}
        onClose={() => rejectOptimizedItinerary()}
        onAccept={() => acceptOptimizedItinerary()}
        onReject={() => rejectOptimizedItinerary()}
      />
    </div>
  );
}

// Subcomponent: TimeSlotSection
function TimeSlotSection({ title, icon: Icon, color, activities, dayNumber, allDays, onEdit, onRemove, onMove }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-charcoal">
        <Icon className={`w-4 h-4 ${color}`} />
        <span>{title} Schedule</span>
        <span className="text-charcoal-muted text-[11px] font-normal">({activities.length} {activities.length === 1 ? 'place' : 'places'})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((act) => (
          <AttractionCard
            key={act.id}
            activity={act}
            dayNumber={dayNumber}
            allDays={allDays}
            onEdit={() => onEdit(act)}
            onRemove={() => onRemove(act.id)}
            onMove={(targetDay) => onMove(act.id, targetDay)}
          />
        ))}
      </div>
    </div>
  );
}

// Subcomponent: AttractionCard
function AttractionCard({ activity, dayNumber, allDays, onEdit, onRemove, onMove }) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-charcoal-border shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between">
      {/* Attraction Image & Badges */}
      <div className="relative h-44 overflow-hidden bg-charcoal">
        <img
          src={activity.image || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

        {/* Time Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-charcoal flex items-center gap-1 shadow-sm">
          <Clock className="w-3 h-3 text-forest" />
          <span>{activity.time || '09:00 AM'}</span>
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 right-3 bg-forest/90 backdrop-blur-sm text-mint px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
          {activity.category || 'Sightseeing'}
        </div>

        {/* Bottom Attraction Name */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h4 className="text-base font-extrabold leading-tight text-white drop-shadow-sm">
            {activity.name}
          </h4>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">
          {activity.description || 'Explore this verified point of interest.'}
        </p>

        {/* Fee & Location */}
        <div className="pt-2 border-t border-charcoal-border/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-charcoal font-semibold">
            <DollarSign className="w-3.5 h-3.5 text-forest" />
            <span>
              {activity.estimatedCost > 0
                ? `Est. Entry: ₹${activity.estimatedCost}`
                : 'Free / Public Access'}
            </span>
          </div>

          {activity.latitude && (
            <Link
              to="/app/map"
              className="text-[11px] text-forest font-semibold hover:underline flex items-center gap-0.5"
            >
              <MapPin className="w-3 h-3 text-forest" />
              <span>Locate</span>
            </Link>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-charcoal-border/50 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-charcoal hover:bg-offwhite hover:text-forest transition-colors"
              title="Edit Attraction"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Move between days dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                className="p-1.5 rounded-lg text-charcoal hover:bg-offwhite hover:text-forest transition-colors"
                title="Move attraction to another day"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>

              {showMoveMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMoveMenu(false)} />
                  <div className="absolute left-0 bottom-full mb-1 w-32 rounded-xl bg-white shadow-elevated border border-charcoal-border py-1 z-30 text-xs">
                    <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-charcoal-muted border-b border-charcoal-border/40">
                      Move to:
                    </div>
                    {allDays
                      .filter((d) => d.day !== dayNumber)
                      .map((d) => (
                        <button
                          key={d.day}
                          onClick={() => {
                            onMove(d.day);
                            setShowMoveMenu(false);
                          }}
                          className="w-full px-2.5 py-1.5 text-left hover:bg-mint/40 text-charcoal font-medium"
                        >
                          Day {d.day}
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title="Remove Attraction"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
