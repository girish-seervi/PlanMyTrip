import axios from 'axios';
import { getAttractionImage, getDestinationImage } from '../utils/imageHelper.js';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL_NAME = 'nvidia/nemotron-3.5-lightning-30b-a3b';

const SYSTEM_PROMPT = `You are an expert travel planner.

Your task is to generate practical, realistic and personalized travel itineraries.

Consider the user's destination, trip duration, number of travelers, budget and interests.

Use the provided real-world attraction data as the source of places.

Do not invent attractions, addresses, coordinates, ratings or entry fees.

Group nearby attractions together to reduce unnecessary travel.

Create a balanced schedule with morning, afternoon and evening activities.

Provide realistic estimated costs in the local currency.

Do not exceed the user's budget unnecessarily.

Avoid repeating attractions.

Return structured JSON matching the requested schema.

If information is unavailable, return null instead of inventing it.`;

/**
 * Clean and extract JSON string from LLM response
 */
function extractJsonFromResponse(rawText) {
  if (!rawText) return null;

  // Remove <think>...</think> if present from reasoning models
  let cleanText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Check for ```json ... ``` or ``` ... ```
  const codeBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleanText = codeBlockMatch[1].trim();
  }

  // Find opening and closing brackets
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanText = cleanText.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    // Attempt minor repair: remove trailing commas before } or ]
    try {
      const repaired = cleanText
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      return JSON.parse(repaired);
    } catch (e) {
      console.error('Failed to parse JSON from AI response:', err.message);
      throw new Error(`Invalid JSON format returned by AI: ${err.message}`);
    }
  }
}

/**
 * Call NVIDIA NIM API
 */
async function callNemotron(messages, apiKey) {
  const key = apiKey || process.env.NVIDIA_API_KEY;

  if (!key || key.trim() === '' || key === 'your_api_key_here') {
    throw new Error('NVIDIA_API_KEY is missing. Please add your NVIDIA API key in the server .env file or Settings.');
  }

  try {
    const response = await axios.post(
      NVIDIA_API_URL,
      {
        model: MODEL_NAME,
        messages,
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 4096
      },
      {
        headers: {
          'Authorization': `Bearer ${key.trim()}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 seconds timeout
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Received empty response from NVIDIA Nemotron API.');
    }

    return content;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.error(`NVIDIA API Error (${status}):`, data);

      if (status === 401 || status === 403) {
        throw new Error('Invalid or unauthorized NVIDIA API key. Please check your NVIDIA_API_KEY.');
      } else if (status === 429) {
        throw new Error('NVIDIA API rate limit exceeded. Please wait a moment and retry.');
      } else {
        const errorMsg = data?.error?.message || data?.message || 'NVIDIA NIM API error';
        throw new Error(`NVIDIA API Error (${status}): ${errorMsg}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('NVIDIA API request timed out. Please try again.');
    }
    throw error;
  }
}

/**
 * Generate full trip itinerary using Nemotron and verified attractions
 */
export async function generateItinerary({
  destination,
  destinationCoordinates,
  startDate,
  endDate,
  duration,
  travelers,
  budget,
  travelStyle,
  interests,
  realAttractions = [],
  apiKey
}) {
  const currency = destinationCoordinates?.countryCode === 'in' || destination?.toLowerCase().includes('india') ? 'INR' : 'USD';
  const totalBudget = Number(budget) * Number(travelers);

  // Prepare concise list of verified real attractions
  const placesContext = realAttractions.slice(0, 25).map((a, idx) => ({
    id: idx + 1,
    name: a.name,
    category: a.category,
    lat: a.latitude,
    lon: a.longitude,
    fee: a.fee || 'Moderate / Free',
    description: a.description
  }));

  const userPrompt = `Generate a realistic ${duration}-day travel itinerary for ${destination} based strictly on these verified attractions:
${JSON.stringify(placesContext, null, 2)}

User Trip Parameters:
- Destination: ${destination}
- Duration: ${duration} Days
- Start Date: ${startDate || 'Day 1'}
- End Date: ${endDate || `Day ${duration}`}
- Travelers: ${travelers}
- Budget Per Person: ${budget} ${currency}
- Total Budget: ${totalBudget} ${currency}
- Travel Style: ${travelStyle}
- Traveler Interests: ${interests.join(', ')}

Schema requirements:
Return ONLY a valid JSON object matching this structure:
{
  "destination": "${destination}",
  "duration": ${duration},
  "travelers": ${travelers},
  "currency": "${currency}",
  "totalEstimatedBudget": ${totalBudget},
  "perPersonBudget": ${budget},
  "budgetBreakdown": {
    "accommodation": ${Math.round(totalBudget * 0.4)},
    "food": ${Math.round(totalBudget * 0.25)},
    "transportation": ${Math.round(totalBudget * 0.15)},
    "activities": ${Math.round(totalBudget * 0.12)},
    "miscellaneous": ${Math.round(totalBudget * 0.08)}
  },
  "days": [
    {
      "day": 1,
      "title": "Short title describing the day's theme",
      "activities": [
        {
          "name": "Attraction Name from verified list",
          "description": "Engaging description of what to do here",
          "time": "09:30 AM",
          "slot": "morning",
          "category": "Historical",
          "estimatedCost": 150,
          "latitude": 26.9124,
          "longitude": 75.7873
        }
      ],
      "estimatedDailyCost": 4500
    }
  ]
}

Ensure:
- Exactly ${duration} days are planned in the "days" array.
- Each day has 3 to 4 activities organized across morning, afternoon, and evening.
- Every attraction name and coordinate must match one of the verified places provided.
- Do not repeat attractions across days.
- Do NOT include markdown text outside the JSON.`;

  const rawContent = await callNemotron([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ], apiKey);

  const itinerary = extractJsonFromResponse(rawContent);

  // Validate and post-process
  if (!itinerary.days || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
    throw new Error('AI failed to generate a valid daily itinerary. Please retry.');
  }

  // Cross-reference coordinates & enrich with attraction photos
  itinerary.days.forEach((day, dayIndex) => {
    day.day = dayIndex + 1;
    if (!day.activities || !Array.isArray(day.activities)) {
      day.activities = [];
    }

    day.activities.forEach((act, actIndex) => {
      // Find matching real attraction for precise coordinates
      const matched = realAttractions.find(
        r => r.name.toLowerCase() === (act.name || '').toLowerCase() ||
             r.name.toLowerCase().includes((act.name || '').toLowerCase()) ||
             (act.name || '').toLowerCase().includes(r.name.toLowerCase())
      );

      if (matched) {
        act.latitude = matched.latitude;
        act.longitude = matched.longitude;
        if (!act.category || act.category === 'Sightseeing') {
          act.category = matched.category;
        }
      }

      // If latitude/longitude is missing, use destination coordinates
      if (!act.latitude && destinationCoordinates) {
        act.latitude = destinationCoordinates.lat + (actIndex * 0.005);
        act.longitude = destinationCoordinates.lon + (actIndex * 0.005);
      }

      // Add image
      act.image = getAttractionImage(act.name, act.category);
      act.id = `act_${dayIndex + 1}_${actIndex + 1}_${Date.now()}`;
      act.slot = act.slot || (actIndex === 0 ? 'morning' : actIndex === 1 ? 'afternoon' : 'evening');
    });

    if (!day.estimatedDailyCost) {
      day.estimatedDailyCost = day.activities.reduce((sum, a) => sum + (Number(a.estimatedCost) || 0), 0);
    }
  });

  // Ensure cover image and metadata
  itinerary.destinationImage = getDestinationImage(destination);
  itinerary.travelStyle = travelStyle;
  itinerary.interests = interests;
  itinerary.startDate = startDate;
  itinerary.endDate = endDate;
  itinerary.aiGenerated = true;

  return itinerary;
}

/**
 * Regenerate a single day with AI
 */
export async function regenerateDay({
  destination,
  dayNumber,
  tripContext,
  allExistingAttractionNames = [],
  realAttractions = [],
  apiKey
}) {
  const availableAttractions = realAttractions
    .filter(a => !allExistingAttractionNames.some(name => name.toLowerCase() === a.name.toLowerCase()))
    .slice(0, 15);

  const prompt = `Regenerate Day ${dayNumber} for a trip to ${destination}.

Already visited places on other days (DO NOT USE THESE):
${allExistingAttractionNames.join(', ')}

Available verified places to choose from:
${JSON.stringify(availableAttractions.map(a => ({ name: a.name, category: a.category, lat: a.latitude, lon: a.longitude })), null, 2)}

Return ONLY a JSON object for Day ${dayNumber} matching this structure:
{
  "day": ${dayNumber},
  "title": "Fresh theme for this day",
  "activities": [
    {
      "name": "Attraction Name",
      "description": "Engaging description",
      "time": "09:30 AM",
      "slot": "morning",
      "category": "Historical",
      "estimatedCost": 150,
      "latitude": 26.9124,
      "longitude": 75.7873
    }
  ],
  "estimatedDailyCost": 3500
}

Include 3 to 4 activities for morning, afternoon, and evening. Return strictly valid JSON.`;

  const rawContent = await callNemotron([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ], apiKey);

  const dayData = extractJsonFromResponse(rawContent);

  if (!dayData || !dayData.activities) {
    throw new Error(`Failed to regenerate Day ${dayNumber}. Invalid AI response.`);
  }

  dayData.day = dayNumber;
  dayData.activities.forEach((act, actIndex) => {
    const matched = realAttractions.find(
      r => r.name.toLowerCase() === (act.name || '').toLowerCase()
    );
    if (matched) {
      act.latitude = matched.latitude;
      act.longitude = matched.longitude;
    }
    act.image = getAttractionImage(act.name, act.category);
    act.id = `act_${dayNumber}_${actIndex + 1}_${Date.now()}`;
    act.slot = act.slot || (actIndex === 0 ? 'morning' : actIndex === 1 ? 'afternoon' : 'evening');
  });

  return dayData;
}
