import { haversineDistance } from './osmService.js';

/**
 * Solve TSP for a small set of points (nearest-neighbor + 2-opt)
 */
function optimizePointsOrder(activities) {
  if (!activities || activities.length <= 2) return activities;

  // Filter out any activity missing coordinates
  const validActs = activities.filter(a => a.latitude && a.longitude);
  if (validActs.length <= 2) return activities;

  // Start with the first activity (anchor for the morning)
  const remaining = [...validActs.slice(1)];
  const ordered = [validActs[0]];

  while (remaining.length > 0) {
    const current = ordered[ordered.length - 1];
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(
        current.latitude, current.longitude,
        remaining[i].latitude, remaining[i].longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    ordered.push(remaining.splice(nearestIndex, 1)[0]);
  }

  // 2-opt improvement
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < ordered.length - 1; i++) {
      for (let k = i + 1; k < ordered.length; k++) {
        const d1 = haversineDistance(ordered[i - 1].latitude, ordered[i - 1].longitude, ordered[i].latitude, ordered[i].longitude) +
                   haversineDistance(ordered[k].latitude, ordered[k].longitude, ordered[(k + 1) % ordered.length]?.latitude || ordered[k].latitude, ordered[(k + 1) % ordered.length]?.longitude || ordered[k].longitude);
        const d2 = haversineDistance(ordered[i - 1].latitude, ordered[i - 1].longitude, ordered[k].latitude, ordered[k].longitude) +
                   haversineDistance(ordered[i].latitude, ordered[i].longitude, ordered[(k + 1) % ordered.length]?.latitude || ordered[k].latitude, ordered[(k + 1) % ordered.length]?.longitude || ordered[k].longitude);

        if (d2 < d1 - 0.05) {
          // Reverse slice between i and k
          const slice = ordered.slice(i, k + 1).reverse();
          ordered.splice(i, k - i + 1, ...slice);
          improved = true;
        }
      }
    }
  }

  // Append any activities that lacked coordinates back at the end
  const missingCoords = activities.filter(a => !a.latitude || !a.longitude);
  return [...ordered, ...missingCoords];
}

/**
 * Calculate total route distance for a list of activities
 */
function calculateListDistance(activities) {
  let dist = 0;
  for (let i = 0; i < activities.length - 1; i++) {
    const a1 = activities[i];
    const a2 = activities[i + 1];
    if (a1.latitude && a1.longitude && a2.latitude && a2.longitude) {
      dist += haversineDistance(a1.latitude, a1.longitude, a2.latitude, a2.longitude);
    }
  }
  return dist;
}

const DEFAULT_TIME_SLOTS = [
  { time: '09:00 AM', slot: 'morning' },
  { time: '12:00 PM', slot: 'afternoon' },
  { time: '03:30 PM', slot: 'afternoon' },
  { time: '06:30 PM', slot: 'evening' },
  { time: '08:30 PM', slot: 'evening' }
];

/**
 * Optimize full itinerary to reduce travel distances and time
 */
export function optimizeItinerary(itinerary) {
  if (!itinerary || !itinerary.days) {
    throw new Error('Invalid itinerary provided for optimization.');
  }

  let totalOriginalDistance = 0;
  let totalOptimizedDistance = 0;

  const optimizedDays = itinerary.days.map((day) => {
    const origActivities = day.activities || [];
    const origDist = calculateListDistance(origActivities);
    totalOriginalDistance += origDist;

    const optimizedActs = optimizePointsOrder(origActivities);
    const optDist = calculateListDistance(optimizedActs);
    totalOptimizedDistance += optDist;

    // Re-assign times smoothly
    const updatedActs = optimizedActs.map((act, idx) => {
      const slotInfo = DEFAULT_TIME_SLOTS[Math.min(idx, DEFAULT_TIME_SLOTS.length - 1)];
      return {
        ...act,
        time: act.time || slotInfo.time,
        slot: slotInfo.slot
      };
    });

    return {
      ...day,
      activities: updatedActs,
      optimizedDistanceKm: parseFloat(optDist.toFixed(1)),
      originalDistanceKm: parseFloat(origDist.toFixed(1))
    };
  });

  const distanceSaved = Math.max(0, totalOriginalDistance - totalOptimizedDistance);
  const minutesSaved = Math.round(distanceSaved * 2.5); // Approx 2.5 mins per km urban travel
  const percentageSaved = totalOriginalDistance > 0 ? Math.round((distanceSaved / totalOriginalDistance) * 100) : 0;

  return {
    optimizedItinerary: {
      ...itinerary,
      days: optimizedDays,
      isOptimized: true,
      lastOptimizedAt: new Date().toISOString()
    },
    metrics: {
      originalDistanceKm: parseFloat(totalOriginalDistance.toFixed(1)),
      optimizedDistanceKm: parseFloat(totalOptimizedDistance.toFixed(1)),
      savedDistanceKm: parseFloat(distanceSaved.toFixed(1)),
      savedMinutes: minutesSaved,
      percentageSaved: percentageSaved
    }
  };
}
