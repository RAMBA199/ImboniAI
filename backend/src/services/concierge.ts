import { EVENTS_DATA, EventData, getUpcomingEvents } from '../data/events';

export interface UserPreferences {
  interests?: string[];
  budget?: 'budget' | 'moderate' | 'expensive';
  language?: string;
  neighborhoods?: string[];
  favorite_genres?: string[];
  vibe_preferences?: string[];
  mood?: string;
}

export interface EventRecommendation {
  event_name: string;
  place_name: string;
  time: string;
  reason: string;
  vibe_tags: string[];
}

export interface ConciergeResponse {
  intent_analysis: string;
  recommendations: EventRecommendation[];
  trending_wildcard: EventRecommendation;
  local_pro_tip: string;
}

/**
 * Score an event based on user preferences
 * Returns a score between 0 and 100
 */
function scoreEventForUser(event: EventData, userPrefs: UserPreferences): number {
  let score = 0;
  const maxScore = 100;

  // Budget matching (25 points)
  if (userPrefs.budget) {
    const budgetMatch: Record<string, Record<string, number>> = {
      budget: { budget: 25, moderate: 15, expensive: 0 },
      moderate: { budget: 15, moderate: 25, expensive: 10 },
      expensive: { budget: 0, moderate: 10, expensive: 25 },
    };
    score += budgetMatch[userPrefs.budget]?.[event.budget_range] || 0;
  }

  // Interests/categories matching (25 points)
  if (userPrefs.interests && userPrefs.interests.length > 0) {
    const matchedInterests = userPrefs.interests.filter(
      interest =>
        event.category.includes(interest.toLowerCase()) ||
        event.vibe.some(v => v.includes(interest.toLowerCase())) ||
        event.audience.some(a => a.includes(interest.toLowerCase()))
    );
    score += (matchedInterests.length / userPrefs.interests.length) * 25;
  }

  // Genre preference matching (20 points)
  if (userPrefs.favorite_genres && userPrefs.favorite_genres.length > 0) {
    const genreMatch = userPrefs.favorite_genres.includes(event.genre) ? 20 : 0;
    score += genreMatch;
  }

  // Vibe preference matching (15 points)
  if (userPrefs.vibe_preferences && userPrefs.vibe_preferences.length > 0) {
    const matchedVibes = event.vibe.filter(v => userPrefs.vibe_preferences?.includes(v));
    score += (matchedVibes.length / Math.max(userPrefs.vibe_preferences.length, 1)) * 15;
  }

  // Neighborhood preference matching (10 points)
  if (userPrefs.neighborhoods && userPrefs.neighborhoods.length > 0) {
    const isInPreferredNeighborhood = userPrefs.neighborhoods.some(
      n => n.toLowerCase() === event.neighborhood.toLowerCase()
    );
    score += isInPreferredNeighborhood ? 10 : 0;
  }

  // Mood-based adjustments
  if (userPrefs.mood) {
    const moodBoosts: Record<string, string[]> = {
      adventurous: ['exploration', 'local', 'walking', 'authentic', 'hiking'],
      relaxed: ['casual', 'social', 'coffee', 'views', 'peaceful'],
      energetic: ['dancing', 'live_band', 'energetic', 'party', 'fitness'],
      cultural: ['culture', 'art', 'history', 'educational', 'local_artists'],
      romantic: ['intimate', 'upscale', 'romantic', 'views', 'fine_dining'],
    };

    const moodVibes = moodBoosts[userPrefs.mood.toLowerCase()] || [];
    const moodMatches = event.vibe.filter(v => moodVibes.includes(v));
    if (moodMatches.length > 0) {
      score += 5; // Bonus for mood match
    }
  }

  return Math.min(score, maxScore);
}

/**
 * Generate a personalized reason for recommending an event
 */
function generateReason(event: EventData, userPrefs: UserPreferences, score: number): string {
  const reasons: string[] = [];

  if (userPrefs.budget && event.budget_range === userPrefs.budget) {
    reasons.push(`perfectly fits your ${userPrefs.budget} budget`);
  }

  if (userPrefs.favorite_genres?.includes(event.genre)) {
    reasons.push(`matches your love for ${event.genre}`);
  }

  if (userPrefs.interests) {
    const matchedInterests = userPrefs.interests.filter(
      int => event.category.includes(int.toLowerCase()) || event.vibe.some(v => v.includes(int.toLowerCase()))
    );
    if (matchedInterests.length > 0) {
      reasons.push(`aligns with your interests in ${matchedInterests.join(', ')}`);
    }
  }

  if (userPrefs.mood) {
    reasons.push(`great for a ${userPrefs.mood.toLowerCase()} mood`);
  }

  if (event.trending_factor > 0.75) {
    reasons.push(`it's trending right now in Kigali`);
  }

  if (reasons.length === 0) {
    reasons.push(`a unique experience that might surprise you`);
  }

  return reasons.join(' and ');
}

/**
 * Find a trending event that might be outside user's usual preferences
 */
function findTrendingWildcard(userPrefs: UserPreferences): EventData | null {
  const trendingEvents = EVENTS_DATA.filter(
    evt =>
      evt.trending_factor > 0.75 &&
      (!userPrefs.interests || !userPrefs.interests.includes(evt.category))
  ).sort((a, b) => b.trending_factor - a.trending_factor);

  return trendingEvents.length > 0 ? trendingEvents[0] : null;
}

/**
 * Analyze user intent from their mood, preferences, and available events
 */
function analyzeUserIntent(userPrefs: UserPreferences): string {
  const parts: string[] = [];

  if (userPrefs.mood) {
    parts.push(`you're feeling ${userPrefs.mood.toLowerCase()}`);
  }

  if (userPrefs.budget) {
    parts.push(`you're looking for ${userPrefs.budget} options`);
  }

  if (userPrefs.interests && userPrefs.interests.length > 0) {
    parts.push(`interested in ${userPrefs.interests.slice(0, 2).join(' and ')}`);
  }

  if (parts.length === 0) {
    return "Let's find you something amazing in Kigali!";
  }

  return `Based on what I understand, ${parts.join(', ')}. Here's what I'd recommend:`;
}

/**
 * Generate a local pro tip based on the day/time and recommendations
 */
function generateLocalProTip(recommendations: EventRecommendation[], userPrefs: UserPreferences): string {
  const tips = [
    "Amakuru! Pro tip: Traffic in Kigali is lighter after 10 AM on weekends—plan accordingly if you're heading to Kigali Center.",
    "Local insight: Many Kigali restaurants are busy on Friday/Saturday evenings. Reserve ahead or arrive early, especially in Kigali Center.",
    "Street food is cheaper at dusk (5-7 PM) in Kimihurura and Kimironko. Come hungry and bring cash!",
    "Nyamirambo is best experienced early in the morning when locals are active. The vibe shifts by afternoon.",
    "Mount Kigali trails are beautiful but muddy after rain. Check weather and wear good shoes.",
    "Rwandan coffee is world-class! Try a specialty roast at any café—Question and Bourbon Coffee have unique blends.",
    "Most cultural sites (Inema Arts, Kigali Memorial) are quieter on weekday mornings. Avoid tourist crowds.",
    "Weekends are lively in all neighborhoods, but Kigali Center gets crowded by 6 PM. Arrive early for better experience.",
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Main concierge function: Match user to events and generate recommendations
 */
export async function generateConciergeRecommendations(
  userPreferences: UserPreferences
): Promise<ConciergeResponse> {
  // Get upcoming events for the next 7 days
  const upcomingEvents = getUpcomingEvents(7);

  // Score all events
  const scoredEvents = upcomingEvents
    .map(event => ({
      event,
      score: scoreEventForUser(event, userPreferences),
    }))
    .sort((a, b) => b.score - a.score);

  // Get top 3 recommendations
  const topRecommendations = scoredEvents.slice(0, 3).map(({ event, score }) => ({
    event_name: event.name,
    place_name: event.place_name,
    time: `${event.time} (${event.day_of_week})`,
    reason: generateReason(event, userPreferences, score),
    vibe_tags: event.vibe.slice(0, 4), // Top 4 vibes
  }));

  // Find trending wildcard
  const wildcardEvent = findTrendingWildcard(userPreferences);
  const trendingWildcard: EventRecommendation = wildcardEvent
    ? {
        event_name: wildcardEvent.name,
        place_name: wildcardEvent.place_name,
        time: `${wildcardEvent.time} (${wildcardEvent.day_of_week})`,
        reason: `🔥 Trending in Kigali right now: ${wildcardEvent.description}`,
        vibe_tags: wildcardEvent.vibe.slice(0, 3),
      }
    : {
        event_name: 'Explore Kigali',
        place_name: 'Everywhere',
        time: 'Anytime',
        reason: 'The best adventure is the one you discover yourself!',
        vibe_tags: ['exploration', 'authentic'],
      };

  return {
    intent_analysis: analyzeUserIntent(userPreferences),
    recommendations: topRecommendations,
    trending_wildcard: trendingWildcard,
    local_pro_tip: generateLocalProTip(topRecommendations, userPreferences),
  };
}
