import React, { createContext, useContext, useState } from 'react';
import { useTrip } from './TripContext';
import { useNotification } from './NotificationContext';
import { regenerateDay as apiRegenerateDay, optimizeItinerary as apiOptimizeItinerary } from '../services/api';

const ItineraryContext = createContext(null);

export function ItineraryProvider({ children }) {
  const { activeTrip, updateActiveTrip, customApiKey } = useTrip();
  const { showSuccess, showError, showInfo } = useNotification();

  const [isRegeneratingDay, setIsRegeneratingDay] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationComparison, setOptimizationComparison] = useState(null);

  // Edit an activity
  const editActivity = (dayNumber, activityId, updatedData) => {
    if (!activeTrip || !activeTrip.days) return;

    const updatedDays = activeTrip.days.map((day) => {
      if (day.day !== dayNumber) return day;

      const newActivities = (day.activities || []).map((act) => {
        if (act.id === activityId) {
          return { ...act, ...updatedData };
        }
        return act;
      });

      // Recalculate daily cost
      const dailyCost = newActivities.reduce((acc, a) => acc + (Number(a.estimatedCost) || 0), 0);

      return {
        ...day,
        activities: newActivities,
        estimatedDailyCost: dailyCost
      };
    });

    updateActiveTrip({ days: updatedDays });
    showSuccess('Activity updated successfully.');
  };

  // Remove an activity
  const removeActivity = (dayNumber, activityId) => {
    if (!activeTrip || !activeTrip.days) return;

    const updatedDays = activeTrip.days.map((day) => {
      if (day.day !== dayNumber) return day;

      const newActivities = (day.activities || []).filter((act) => act.id !== activityId);
      const dailyCost = newActivities.reduce((acc, a) => acc + (Number(a.estimatedCost) || 0), 0);

      return {
        ...day,
        activities: newActivities,
        estimatedDailyCost: dailyCost
      };
    });

    updateActiveTrip({ days: updatedDays });
    showInfo('Attraction removed from itinerary.');
  };

  // Add custom activity to a day
  const addActivity = (dayNumber, newActivity) => {
    if (!activeTrip || !activeTrip.days) return;

    const updatedDays = activeTrip.days.map((day) => {
      if (day.day !== dayNumber) return day;

      const fullActivity = {
        id: `act_custom_${Date.now()}`,
        name: newActivity.name,
        description: newActivity.description || 'Custom added attraction.',
        time: newActivity.time || '03:00 PM',
        slot: newActivity.slot || 'afternoon',
        category: newActivity.category || 'Sightseeing',
        estimatedCost: Number(newActivity.estimatedCost) || 0,
        latitude: newActivity.latitude || activeTrip.destinationCoordinates?.lat || null,
        longitude: newActivity.longitude || activeTrip.destinationCoordinates?.lon || null,
        image: newActivity.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
      };

      const newActivities = [...(day.activities || []), fullActivity];
      const dailyCost = newActivities.reduce((acc, a) => acc + (Number(a.estimatedCost) || 0), 0);

      return {
        ...day,
        activities: newActivities,
        estimatedDailyCost: dailyCost
      };
    });

    updateActiveTrip({ days: updatedDays });
    showSuccess(`Added "${newActivity.name}" to Day ${dayNumber}.`);
  };

  // Move activity from one day to another
  const moveActivity = (fromDayNumber, toDayNumber, activityId) => {
    if (!activeTrip || !activeTrip.days || fromDayNumber === toDayNumber) return;

    let targetActivity = null;

    // Remove from source day
    const updatedDays = activeTrip.days.map((day) => {
      if (day.day === fromDayNumber) {
        targetActivity = (day.activities || []).find((a) => a.id === activityId);
        const filtered = (day.activities || []).filter((a) => a.id !== activityId);
        return {
          ...day,
          activities: filtered,
          estimatedDailyCost: filtered.reduce((acc, a) => acc + (Number(a.estimatedCost) || 0), 0)
        };
      }
      return day;
    });

    if (!targetActivity) return;

    // Add to target day
    const finalDays = updatedDays.map((day) => {
      if (day.day === toDayNumber) {
        const newActivities = [...(day.activities || []), targetActivity];
        return {
          ...day,
          activities: newActivities,
          estimatedDailyCost: newActivities.reduce((acc, a) => acc + (Number(a.estimatedCost) || 0), 0)
        };
      }
      return day;
    });

    updateActiveTrip({ days: finalDays });
    showSuccess(`Moved activity to Day ${toDayNumber}.`);
  };

  // Regenerate single day using AI
  const regenerateDayPlan = async (dayNumber) => {
    if (!activeTrip) return;

    setIsRegeneratingDay(true);
    try {
      const allNames = [];
      activeTrip.days?.forEach((d) => {
        if (d.day !== dayNumber) {
          (d.activities || []).forEach((a) => {
            if (a.name) allNames.push(a.name);
          });
        }
      });

      const res = await apiRegenerateDay({
        destination: activeTrip.destination,
        dayNumber,
        destinationCoordinates: activeTrip.destinationCoordinates,
        allExistingAttractionNames: allNames,
        interests: activeTrip.interests || []
      }, customApiKey);

      if (res.success && res.day) {
        const updatedDays = activeTrip.days.map((d) => (d.day === dayNumber ? res.day : d));
        updateActiveTrip({ days: updatedDays });
        showSuccess(`Day ${dayNumber} successfully regenerated with NVIDIA AI!`);
      } else {
        throw new Error('Could not regenerate day plan.');
      }
    } catch (err) {
      console.error('Error regenerating day:', err);
      showError(err.response?.data?.error || err.message || 'Failed to regenerate day. Check API key.');
    } finally {
      setIsRegeneratingDay(false);
    }
  };

  // Optimize trip routes
  const optimizeTripRoute = async () => {
    if (!activeTrip || !activeTrip.days) return;

    setIsOptimizing(true);
    try {
      const res = await apiOptimizeItinerary(activeTrip);
      if (res.success && res.optimizedItinerary) {
        setOptimizationComparison({
          optimizedItinerary: res.optimizedItinerary,
          metrics: res.metrics,
          currentItinerary: activeTrip
        });
      } else {
        throw new Error('Failed to compute route optimization.');
      }
    } catch (err) {
      console.error('Error optimizing itinerary:', err);
      showError(err.response?.data?.error || err.message || 'Optimization failed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Accept optimized itinerary
  const acceptOptimizedItinerary = () => {
    if (optimizationComparison && optimizationComparison.optimizedItinerary) {
      updateActiveTrip(optimizationComparison.optimizedItinerary);
      showSuccess(`Trip optimized! Saved ${optimizationComparison.metrics?.savedDistanceKm || 0} km of unnecessary travel.`);
      setOptimizationComparison(null);
    }
  };

  // Reject optimized itinerary
  const rejectOptimizedItinerary = () => {
    setOptimizationComparison(null);
    showInfo('Kept original itinerary arrangement.');
  };

  return (
    <ItineraryContext.Provider
      value={{
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
        optimizationComparison,
        setOptimizationComparison
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
}
