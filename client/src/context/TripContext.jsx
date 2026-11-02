import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SAMPLE_JAIPUR_TRIP } from '../data/sampleTrips';

const TripContext = createContext(null);

const STORAGE_KEY_TRIPS = 'planmytrip_saved_trips_v1';
const STORAGE_KEY_ACTIVE_ID = 'planmytrip_active_trip_id_v1';
const STORAGE_KEY_API_KEY = 'planmytrip_nvidia_key_v1';

export function TripProvider({ children }) {
  // Load saved trips from LocalStorage or initialize with default sample
  const [trips, setTrips] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRIPS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading trips from localStorage:', e);
    }
    return [SAMPLE_JAIPUR_TRIP];
  });

  const [activeTripId, setActiveTripId] = useState(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (storedId) return storedId;
    } catch (e) {}
    return SAMPLE_JAIPUR_TRIP.id;
  });

  const [customApiKey, setCustomApiKeyState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
    } catch (e) {
      return '';
    }
  });

  // Sync trips to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.error('Error persisting trips to localStorage:', e);
    }
  }, [trips]);

  // Sync active trip id to LocalStorage
  useEffect(() => {
    try {
      if (activeTripId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeTripId);
      }
    } catch (e) {}
  }, [activeTripId]);

  // Sync custom API key
  const setCustomApiKey = (key) => {
    setCustomApiKeyState(key);
    try {
      if (key) {
        localStorage.setItem(STORAGE_KEY_API_KEY, key);
      } else {
        localStorage.removeItem(STORAGE_KEY_API_KEY);
      }
    } catch (e) {}
  };

  // Find active trip or fallback to first trip
  const activeTrip = useMemo(() => {
    const found = trips.find(t => t.id === activeTripId);
    return found || trips[0] || null;
  }, [trips, activeTripId]);

  // Create new trip
  const createNewTrip = (tripData) => {
    const id = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTrip = {
      id,
      createdAt: new Date().toISOString(),
      status: 'Upcoming',
      members: [
        { id: 'mem_1', name: 'You (Organizer)', isLeader: true, avatar: '👤' }
      ],
      expenses: [],
      ...tripData
    };

    setTrips(prev => [newTrip, ...prev]);
    setActiveTripId(id);
    return newTrip;
  };

  // Update active trip
  const updateActiveTrip = (updates) => {
    if (!activeTrip) return;
    setTrips(prev => prev.map(t => {
      if (t.id === activeTrip.id) {
        return {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  // Update any trip by ID
  const updateTripById = (id, updates) => {
    setTrips(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  // Delete trip
  const deleteTrip = (id) => {
    setTrips(prev => {
      const remaining = prev.filter(t => t.id !== id);
      if (remaining.length === 0) {
        // Keep at least sample trip if user deletes all
        return [SAMPLE_JAIPUR_TRIP];
      }
      return remaining;
    });

    if (activeTripId === id) {
      const nextTrip = trips.find(t => t.id !== id);
      if (nextTrip) {
        setActiveTripId(nextTrip.id);
      } else {
        setActiveTripId(SAMPLE_JAIPUR_TRIP.id);
      }
    }
  };

  // Duplicate trip
  const duplicateTrip = (id) => {
    const toClone = trips.find(t => t.id === id);
    if (!toClone) return;

    const clonedId = `trip_${Date.now()}_copy`;
    const clonedTrip = {
      ...toClone,
      id: clonedId,
      destination: `${toClone.destination} (Copy)`,
      createdAt: new Date().toISOString(),
      isDemo: false
    };

    setTrips(prev => [clonedTrip, ...prev]);
    setActiveTripId(clonedId);
    return clonedTrip;
  };

  // Reset to default sample trips
  const resetToDemoTrip = () => {
    setTrips([SAMPLE_JAIPUR_TRIP]);
    setActiveTripId(SAMPLE_JAIPUR_TRIP.id);
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        activeTripId,
        setActiveTripId,
        createNewTrip,
        updateActiveTrip,
        updateTripById,
        deleteTrip,
        duplicateTrip,
        resetToDemoTrip,
        customApiKey,
        setCustomApiKey
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
