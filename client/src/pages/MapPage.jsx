import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Car
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { calculateRoute } from '../services/api';

// Distinct palette colors for days
const DAY_COLORS = ['#173F35', '#F1A66A', '#2B7A78', '#D97706', '#4F46E5', '#059669'];

// Helper to create modern custom HTML map pins
function createCustomPin(number, color, dayNum) {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          font-weight: 800;
          font-size: 11px;
          line-height: 1;
        ">${number}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

// Controller component to smoothly fly map to selected coordinates
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const { activeTrip } = useTrip();
  const [selectedDayTab, setSelectedDayTab] = useState('all'); // 'all' or day number
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distanceKm: 0, durationMinutes: 0, coordinates: [] });
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const days = activeTrip?.days || [];

  // Filter activities based on tab
  const displayedActivities = useMemo(() => {
    if (selectedDayTab === 'all') {
      const all = [];
      days.forEach((day, dIdx) => {
        (day.activities || []).forEach((act, aIdx) => {
          if (act.latitude && act.longitude) {
            all.push({
              ...act,
              dayNumber: day.day,
              orderNumber: aIdx + 1,
              color: DAY_COLORS[dIdx % DAY_COLORS.length]
            });
          }
        });
      });
      return all;
    } else {
      const targetDay = days.find((d) => d.day === parseInt(selectedDayTab, 10));
      if (!targetDay) return [];
      const dIdx = days.findIndex((d) => d.day === parseInt(selectedDayTab, 10));
      return (targetDay.activities || [])
        .filter((a) => a.latitude && a.longitude)
        .map((act, aIdx) => ({
          ...act,
          dayNumber: targetDay.day,
          orderNumber: aIdx + 1,
          color: DAY_COLORS[dIdx % DAY_COLORS.length]
        }));
    }
  }, [days, selectedDayTab]);

  // Center coordinates
  const defaultCenter = useMemo(() => {
    if (selectedActivity?.latitude && selectedActivity?.longitude) {
      return [selectedActivity.latitude, selectedActivity.longitude];
    }
    if (displayedActivities.length > 0) {
      const avgLat = displayedActivities.reduce((sum, a) => sum + a.latitude, 0) / displayedActivities.length;
      const avgLon = displayedActivities.reduce((sum, a) => sum + a.longitude, 0) / displayedActivities.length;
      return [avgLat, avgLon];
    }
    if (activeTrip?.destinationCoordinates?.lat && activeTrip?.destinationCoordinates?.lon) {
      return [activeTrip.destinationCoordinates.lat, activeTrip.destinationCoordinates.lon];
    }
    return [26.9124, 75.7873]; // Fallback Jaipur
  }, [displayedActivities, selectedActivity, activeTrip]);

  // Calculate OSRM route whenever displayed activities change
  useEffect(() => {
    if (displayedActivities.length < 2) {
      setRouteInfo({ distanceKm: 0, durationMinutes: 0, coordinates: [] });
      return;
    }

    let isMounted = true;
    setIsCalculatingRoute(true);

    const waypoints = displayedActivities.map((a) => [a.latitude, a.longitude]);
    calculateRoute(waypoints)
      .then((res) => {
        if (isMounted && res) {
          setRouteInfo(res);
        }
      })
      .catch((err) => console.error('Route error:', err))
      .finally(() => {
        if (isMounted) setIsCalculatingRoute(false);
      });

    return () => {
      isMounted = false;
    };
  }, [displayedActivities]);

  if (!activeTrip) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-charcoal-border">
        <MapPin className="w-8 h-8 text-forest mx-auto mb-3" />
        <h2 className="text-xl font-bold">No Active Trip</h2>
        <p className="text-xs text-charcoal-muted mt-1">Create or select a trip to view interactive maps.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Day Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-warmorange-dark">
            Interactive OpenStreetMap
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            {activeTrip.destination.split(',')[0]} Route Map
          </h1>
        </div>

        {/* Day Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setSelectedDayTab('all');
              setSelectedActivity(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDayTab === 'all'
                ? 'bg-forest text-offwhite shadow-sm'
                : 'bg-white border border-charcoal-border text-charcoal hover:bg-offwhite'
            }`}
          >
            All Days ({displayedActivities.length})
          </button>

          {days.map((d) => (
            <button
              key={d.day}
              onClick={() => {
                setSelectedDayTab(d.day.toString());
                setSelectedActivity(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDayTab === d.day.toString()
                  ? 'bg-forest text-offwhite shadow-sm'
                  : 'bg-white border border-charcoal-border text-charcoal hover:bg-offwhite'
              }`}
            >
              Day {d.day}
            </button>
          ))}
        </div>
      </div>

      {/* Route Distance & Travel Duration Banner */}
      <div className="p-4 rounded-2xl bg-white border border-charcoal-border shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-forest" />
            <span className="text-charcoal-muted font-medium">Estimated Driving Route:</span>
            <span className="font-extrabold text-forest">{routeInfo.distanceKm} km</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-warmorange" />
            <span className="text-charcoal-muted font-medium">Est. Drive Time:</span>
            <span className="font-extrabold text-charcoal">~{routeInfo.durationMinutes} mins</span>
          </div>
        </div>

        {/* Disclaimer distinguishing estimated route from live traffic */}
        <div className="flex items-center gap-1.5 text-[11px] text-charcoal-muted">
          <Info className="w-3.5 h-3.5 text-forest" />
          <span>Calculated via OSRM logistics · Standard driving pace (not live traffic)</span>
        </div>
      </div>

      {/* Main Map + Sidebar Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
        {/* Left: Attractions List & Navigator */}
        <div className="bg-white rounded-3xl border border-charcoal-border shadow-soft p-4 flex flex-col h-full overflow-hidden order-2 lg:order-1">
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-muted pb-3 border-b border-charcoal-border/50 flex items-center justify-between">
            <span>Attractions Sequence ({displayedActivities.length})</span>
            <span className="text-[10px] text-forest font-semibold">Click to locate</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 py-3">
            {displayedActivities.map((act) => {
              const isSelected = selectedActivity?.id === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setSelectedActivity(act)}
                  className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-start gap-3 group ${
                    isSelected
                      ? 'bg-mint/40 border-forest shadow-sm'
                      : 'bg-offwhite/50 border-charcoal-border hover:bg-white hover:border-forest/40'
                  }`}
                >
                  {/* Pin Badge */}
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-sm"
                    style={{ backgroundColor: act.color }}
                  >
                    {act.orderNumber}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-charcoal truncate">{act.name}</span>
                      <span className="text-[10px] text-charcoal-muted shrink-0 font-medium">{act.time}</span>
                    </div>
                    <div className="text-[10px] text-charcoal-muted mt-0.5 flex items-center gap-2">
                      <span>Day {act.dayNumber}</span>
                      <span>·</span>
                      <span>{act.category}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-charcoal-muted group-hover:text-forest shrink-0 mt-1" />
                </button>
              );
            })}

            {displayedActivities.length === 0 && (
              <div className="text-center py-10 text-xs text-charcoal-muted">
                No attraction coordinates available for this view.
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive Leaflet Map */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-charcoal-border shadow-elevated relative h-full order-1 lg:order-2">
          <MapContainer
            center={defaultCenter}
            zoom={12}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            {/* OpenStreetMap Tile Layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Map Centering Controller */}
            <MapController center={defaultCenter} zoom={selectedActivity ? 14 : 12} />

            {/* OSRM Route Polyline */}
            {routeInfo.coordinates.length > 0 && (
              <Polyline
                positions={routeInfo.coordinates}
                color="#173F35"
                weight={4}
                opacity={0.8}
                dashArray={selectedDayTab === 'all' ? '6, 6' : undefined}
              />
            )}

            {/* Markers for all displayed attractions */}
            {displayedActivities.map((act) => (
              <Marker
                key={act.id}
                position={[act.latitude, act.longitude]}
                icon={createCustomPin(act.orderNumber, act.color, act.dayNumber)}
                eventHandlers={{
                  click: () => setSelectedActivity(act)
                }}
              >
                <Popup>
                  <div className="w-56 p-1 space-y-2">
                    <img
                      src={act.image || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80'}
                      alt={act.name}
                      className="w-full h-24 object-cover rounded-xl"
                    />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-warmorange">
                        Day {act.dayNumber} · Stop #{act.orderNumber}
                      </div>
                      <div className="text-xs font-bold text-charcoal mt-0.5">{act.name}</div>
                      <div className="text-[11px] text-charcoal-muted mt-0.5 line-clamp-2">
                        {act.description}
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-charcoal-border/40 flex items-center justify-between text-[11px] font-semibold text-forest">
                        <span>{act.time}</span>
                        <span>{act.estimatedCost > 0 ? `₹${act.estimatedCost}` : 'Free'}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
