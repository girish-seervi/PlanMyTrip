import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Compass,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useNotification } from '../context/NotificationContext';
import { searchDestinations, generateItinerary } from '../services/api';
import LoadingModal from '../components/LoadingModal';

const TRAVEL_STYLES = [
  { id: 'Adventure', label: 'Adventure', icon: '🧗‍♂️', desc: 'Thrill, trekking & outdoor action' },
  { id: 'Relaxation', label: 'Relaxation', icon: '🏖️', desc: 'Leisure, peaceful stays & unwinding' },
  { id: 'Luxury', label: 'Luxury', icon: '✨', desc: 'Premium hotels, fine dining & comforts' },
  { id: 'Budget', label: 'Budget', icon: '🪙', desc: 'Smart value, hostels & affordable gems' },
  { id: 'Cultural', label: 'Cultural', icon: '🏛️', desc: 'Heritage, local traditions & history' },
  { id: 'Nature', label: 'Nature', icon: '🌲', desc: 'Scenic landscapes, wildlife & parks' }
];

const INTERESTS = [
  { id: 'Food', label: 'Food & Dining', icon: '🍛' },
  { id: 'History', label: 'History & Heritage', icon: '🏰' },
  { id: 'Shopping', label: 'Shopping & Bazaars', icon: '🛍️' },
  { id: 'Beaches', label: 'Beaches & Ocean', icon: '🌊' },
  { id: 'Mountains', label: 'Mountains & Treks', icon: '⛰️' },
  { id: 'Wildlife', label: 'Wildlife & Safaris', icon: '🐅' },
  { id: 'Photography', label: 'Photography', icon: '📸' },
  { id: 'Nightlife', label: 'Nightlife & Lounges', icon: '🍸' }
];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createNewTrip, customApiKey } = useTrip();
  const { showError, showSuccess } = useNotification();

  // Pre-fill from landing page state if passed
  const passedState = location.state || {};

  // Form State
  const [destination, setDestination] = useState(passedState.destination || 'Jaipur, Rajasthan, India');
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [startDate, setStartDate] = useState(passedState.startDate || '2026-12-15');
  const [endDate, setEndDate] = useState(passedState.endDate || '2026-12-18');
  const [duration, setDuration] = useState(passedState.duration || 3);
  const [travelers, setTravelers] = useState(passedState.travelers || 4);
  const [budget, setBudget] = useState(passedState.budget || 12500);
  const [travelStyle, setTravelStyle] = useState(passedState.travelStyle || 'Cultural');
  const [interests, setInterests] = useState(['History', 'Food', 'Culture', 'Photography']);

  // Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Loading Modal State
  const [isLoading, setIsLoading] = useState(false);

  // Calculate Duration automatically from Start and End Date
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setDuration(diffDays);
      }
    }
  }, [startDate, endDate]);

  // Autocomplete search debouncer
  const handleDestinationInput = (value) => {
    setDestination(value);
    setSelectedCoords(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearchingPlaces(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchDestinations(value);
      setSuggestions(results);
      setIsSearchingPlaces(false);
      setShowDropdown(results.length > 0);
    }, 400);
  };

  const handleSelectSuggestion = (place) => {
    setDestination(place.displayName);
    setSelectedCoords({
      name: place.name,
      lat: place.lat,
      lon: place.lon,
      country: place.country,
      countryCode: place.countryCode
    });
    setShowDropdown(false);
  };

  // Toggle Interest
  const toggleInterest = (interestId) => {
    setInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((i) => i !== interestId)
        : [...prev, interestId]
    );
  };

  // Handle Form Submit & AI Generation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!destination.trim()) {
      showError('Please enter a destination.');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      showError('Ending date must be after starting date.');
      return;
    }

    if (interests.length === 0) {
      showError('Please select at least one interest.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await generateItinerary({
        destination: destination.trim(),
        destinationCoordinates: selectedCoords,
        startDate,
        endDate,
        duration: Number(duration),
        travelers: Number(travelers),
        budget: Number(budget),
        travelStyle,
        interests
      }, customApiKey);

      if (response && response.success && response.itinerary) {
        // Save to state and localStorage
        const newTrip = createNewTrip({
          ...response.itinerary,
          destination: destination.trim(),
          destinationCoordinates: selectedCoords || response.itinerary.destinationCoordinates,
          startDate,
          endDate,
          duration: Number(duration),
          travelers: Number(travelers),
          perPersonBudget: Number(budget),
          totalEstimatedBudget: Number(budget) * Number(travelers),
          travelStyle,
          interests,
          isDemo: false
        });

        showSuccess(`Itinerary for ${destination.split(',')[0]} generated successfully!`);
        setIsLoading(false);
        navigate('/app/itinerary');
      } else {
        throw new Error('AI could not formulate itinerary. Please retry.');
      }
    } catch (err) {
      console.error('Trip generation error:', err);
      setIsLoading(false);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to generate itinerary with AI.';
      showError(errorMsg);
    }
  };

  const totalCalculatedBudget = Number(budget) * Number(travelers);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint/40 border border-mint-dark text-forest text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-warmorange" />
          <span>NVIDIA Nemotron 3.5 Travel Architect</span>
        </div>
        <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">Create Your Trip</h1>
        <p className="text-sm text-charcoal-muted mt-1">
          Tell our AI where you want to go and your preferences. We’ll fetch real attractions and build an optimized schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Destination & Dates */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-charcoal-border shadow-soft space-y-6">
          <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-forest text-mint text-xs flex items-center justify-center font-bold">1</span>
            <span>Where & When</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Destination Autocomplete */}
            <div className="md:col-span-2 relative">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span>Destination (City or Region)</span>
              </label>
              <input
                type="text"
                placeholder="Search any destination (e.g. Jaipur, Bali, Rome, Tokyo)..."
                value={destination}
                onChange={(e) => handleDestinationInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-border focus:border-forest text-sm font-semibold text-charcoal bg-offwhite/50"
                required
              />

              {/* Autocomplete dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white shadow-elevated border border-charcoal-border z-30 max-h-56 overflow-y-auto py-1">
                  {suggestions.map((place, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(place)}
                      className="w-full px-4 py-2.5 text-left text-xs hover:bg-mint/30 transition-colors flex items-center gap-2 border-b border-charcoal-border/30 last:border-none"
                    >
                      <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-charcoal">{place.name}</span>
                        <span className="text-[11px] text-charcoal-muted ml-1.5 truncate block">{place.displayName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Starting Date */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-forest" />
                <span>Starting Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-border focus:border-forest text-sm font-medium text-charcoal bg-offwhite/50"
                required
              />
            </div>

            {/* Ending Date */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-forest" />
                <span>Ending Date</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-border focus:border-forest text-sm font-medium text-charcoal bg-offwhite/50"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-offwhite border border-charcoal-border text-xs text-charcoal-muted font-medium">
            <Clock className="w-4 h-4 text-forest shrink-0" />
            <span>Calculated Trip Duration: <strong className="text-forest font-bold">{duration} Days ({duration - 1} Nights)</strong></span>
          </div>
        </div>

        {/* Step 2: Travelers & Budget */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-charcoal-border shadow-soft space-y-6">
          <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-forest text-mint text-xs flex items-center justify-center font-bold">2</span>
            <span>Travelers & Budget</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Travelers */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-forest" />
                <span>Number of Travelers</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={travelers}
                onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-border focus:border-forest text-sm font-medium text-charcoal bg-offwhite/50"
                required
              />
            </div>

            {/* Budget per Person */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-forest" />
                <span>Budget Per Person (₹)</span>
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Math.max(500, parseFloat(e.target.value) || 0))}
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-border focus:border-forest text-sm font-medium text-charcoal bg-offwhite/50"
                required
              />
            </div>
          </div>

          {/* Total Budget pill */}
          <div className="p-4 rounded-2xl bg-mint/30 border border-mint-dark flex items-center justify-between">
            <div className="text-xs text-forest">
              <span className="font-bold">Total Estimated Group Budget:</span>
              <div className="text-[11px] text-forest/70">₹{budget.toLocaleString()} × {travelers} travelers</div>
            </div>
            <div className="text-xl font-extrabold text-forest">
              ₹{totalCalculatedBudget.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Step 3: Travel Style & Interests */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-charcoal-border shadow-soft space-y-6">
          <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-forest text-mint text-xs flex items-center justify-center font-bold">3</span>
            <span>Style & Interests</span>
          </h2>

          {/* Travel Style Selector */}
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-3">
              Select Primary Travel Style:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TRAVEL_STYLES.map((style) => {
                const isSelected = travelStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setTravelStyle(style.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-forest text-offwhite border-forest shadow-soft'
                        : 'bg-offwhite/40 border-charcoal-border hover:border-forest text-charcoal'
                    }`}
                  >
                    <div className="text-xl mb-1">{style.icon}</div>
                    <div className="text-xs font-bold">{style.label}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-mint' : 'text-charcoal-muted'}`}>
                      {style.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests Multi-Select */}
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-3">
              Select Interests (Multi-select):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {INTERESTS.map((interest) => {
                const isChecked = interests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isChecked
                        ? 'bg-mint text-forest border-mint-dark shadow-sm'
                        : 'bg-white border-charcoal-border text-charcoal hover:bg-offwhite'
                    }`}
                  >
                    <span>{interest.icon}</span>
                    <span className="flex-1 text-left">{interest.label}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-forest" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 4: Summary Card Before Generation */}
        <div className="p-6 rounded-3xl bg-offwhite border border-charcoal-border space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-muted flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-forest" />
            <span>Trip Plan Summary</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-charcoal-muted block text-[10px] uppercase font-bold">Destination</span>
              <span className="font-bold text-charcoal truncate block">{destination.split(',')[0]}</span>
            </div>
            <div>
              <span className="text-charcoal-muted block text-[10px] uppercase font-bold">Duration</span>
              <span className="font-bold text-charcoal">{duration} Days</span>
            </div>
            <div>
              <span className="text-charcoal-muted block text-[10px] uppercase font-bold">Travelers</span>
              <span className="font-bold text-charcoal">{travelers} People</span>
            </div>
            <div>
              <span className="text-charcoal-muted block text-[10px] uppercase font-bold">Style</span>
              <span className="font-bold text-forest">{travelStyle}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-charcoal-muted text-center sm:text-left">
            Real attractions will be verified via Overpass API before Nemotron processes the schedule.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-forest text-offwhite text-sm font-extrabold hover:bg-forest-hover shadow-elevated transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            <Sparkles className="w-5 h-5 text-warmorange" />
            <span>Generate Itinerary with AI</span>
          </button>
        </div>
      </form>

      {/* Loading Modal with 4 Animated Stages */}
      <LoadingModal isOpen={isLoading} destination={destination.split(',')[0]} />
    </div>
  );
}
