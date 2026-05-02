// Real Kigali events data with venue locations and categories
export const EVENTS_DATA: EventData[] = [
  {
    id: 'evt_001',
    name: 'Bourbon Coffee Live Jazz Night',
    place_name: 'Bourbon Coffee (Kigali Center)',
    category: 'music',
    genre: 'jazz',
    time: '19:00',
    duration: '3 hours',
    day_of_week: 'Friday',
    budget_range: 'moderate' as const,
    vibe: ['live_music', 'intimate', 'upscale', 'coffee'],
    description: 'Weekly Friday jazz performance with local and regional artists. Enjoy Rwandan specialty coffee.',
    trending_factor: 0.6,
    neighborhood: 'Kigali Center',
    audience: ['professionals', 'culture_enthusiasts', 'tourists'],
  },
  {
    id: 'evt_002',
    name: 'Inzora Rooftop Weekend Brunch',
    place_name: 'Inzora Rooftop Café',
    category: 'social',
    genre: 'brunch',
    time: '10:00',
    duration: '2.5 hours',
    day_of_week: 'Saturday,Sunday',
    budget_range: 'moderate' as const,
    vibe: ['brunch', 'views', 'social', 'relaxed'],
    description: 'City views, Rwandan coffee, and pastries. Perfect for weekend catch-ups.',
    trending_factor: 0.8,
    neighborhood: 'Kigali Center',
    audience: ['young_professionals', 'friends', 'couples'],
  },
  {
    id: 'evt_003',
    name: 'Cactus Bar Live Band Evening',
    place_name: 'Cactus Bar & Restaurant',
    category: 'nightlife',
    genre: 'afrobeats',
    time: '21:00',
    duration: '4 hours',
    day_of_week: 'Friday,Saturday',
    budget_range: 'moderate' as const,
    vibe: ['live_band', 'dancing', 'cocktails', 'energetic'],
    description: 'High-energy Afrobeats and local music with craft cocktails. Dynamic dance floor.',
    trending_factor: 0.85,
    neighborhood: 'Kigali Center',
    audience: ['young_adults', 'party_goers', 'music_lovers'],
  },
  {
    id: 'evt_004',
    name: 'Kimihurura Evening Stroll & Street Food',
    place_name: 'Kimihurura Street Area',
    category: 'food',
    genre: 'street_food',
    time: '18:00',
    duration: '2 hours',
    day_of_week: 'Friday,Saturday,Sunday',
    budget_range: 'budget' as const,
    vibe: ['local', 'authentic', 'street_food', 'casual'],
    description: 'Authentic street food scene with grilled meat, local drinks, and genuine Kigali atmosphere.',
    trending_factor: 0.7,
    neighborhood: 'Kimihurura',
    audience: ['locals', 'adventurers', 'food_explorers'],
  },
  {
    id: 'evt_005',
    name: 'Inema Arts Center Exhibition',
    place_name: 'Inema Arts Center',
    category: 'culture',
    genre: 'contemporary_art',
    time: '14:00',
    duration: '2 hours',
    day_of_week: 'Wednesday,Thursday,Friday,Saturday,Sunday',
    budget_range: 'budget' as const,
    vibe: ['art', 'culture', 'local_artists', 'creative'],
    description: 'Contemporary Rwandan and African art exhibitions. Support local creatives.',
    trending_factor: 0.75,
    neighborhood: 'Kimihurura',
    audience: ['art_lovers', 'creatives', 'culture_enthusiasts'],
  },
  {
    id: 'evt_006',
    name: 'Nyamirambo Walking Tour',
    place_name: 'Nyamirambo Neighborhood',
    category: 'experience',
    genre: 'cultural_tour',
    time: '09:00',
    duration: '3 hours',
    day_of_week: 'Saturday,Sunday',
    budget_range: 'budget' as const,
    vibe: ['exploration', 'community', 'walking', 'authentic'],
    description: 'Guided walking tour through vibrant Nyamirambo with local guides. Learn real Kigali stories.',
    trending_factor: 0.65,
    neighborhood: 'Nyamirambo',
    audience: ['explorers', 'tourists', 'community_seekers'],
  },
  {
    id: 'evt_007',
    name: 'Mt. Kigali Sunrise Hike',
    place_name: 'Mt. Kigali Park & Trails',
    category: 'outdoor',
    genre: 'hiking',
    time: '06:00',
    duration: '2.5 hours',
    day_of_week: 'Saturday,Sunday',
    budget_range: 'budget' as const,
    vibe: ['nature', 'fitness', 'views', 'peaceful'],
    description: 'Scenic sunrise hike with panoramic city views. Start your weekend active.',
    trending_factor: 0.72,
    neighborhood: 'Mt. Kigali',
    audience: ['fitness_enthusiasts', 'nature_lovers', 'morning_people'],
  },
  {
    id: 'evt_008',
    name: 'Question Coffee Specialty Workshop',
    place_name: 'Question Coffee',
    category: 'learning',
    genre: 'coffee_education',
    time: '15:00',
    duration: '1.5 hours',
    day_of_week: 'Saturday',
    budget_range: 'moderate' as const,
    vibe: ['coffee', 'learning', 'specialty', 'craft'],
    description: 'Learn about Rwandan coffee origins, brewing techniques, and tasting notes from experts.',
    trending_factor: 0.8,
    neighborhood: 'Kigali Center',
    audience: ['coffee_lovers', 'learners', 'foodies'],
  },
  {
    id: 'evt_009',
    name: 'Repub Lounge Sunset Cocktails',
    place_name: 'Repub Lounge',
    category: 'socializing',
    genre: 'cocktail_bar',
    time: '17:00',
    duration: '3 hours',
    day_of_week: 'Thursday,Friday,Saturday',
    budget_range: 'expensive' as const,
    vibe: ['cocktails', 'upscale', 'social', 'sophisticated'],
    description: 'Premium cocktail lounge with sunset views. Perfect for after-work networking.',
    trending_factor: 0.7,
    neighborhood: 'Kigali Center',
    audience: ['professionals', 'upscale_crowd', 'cocktail_enthusiasts'],
  },
  {
    id: 'evt_010',
    name: 'Kimironko Market Saturday Morning',
    place_name: 'Kimironko Market',
    category: 'market',
    genre: 'local_market',
    time: '07:00',
    duration: '2 hours',
    day_of_week: 'Saturday',
    budget_range: 'budget' as const,
    vibe: ['market', 'local', 'fresh_produce', 'authentic'],
    description: 'Early morning market experience with fresh produce, crafts, and local culture.',
    trending_factor: 0.6,
    neighborhood: 'Kimironko',
    audience: ['locals', 'food_explorers', 'market_enthusiasts'],
  },
  {
    id: 'evt_011',
    name: 'Kigali Genocide Memorial Reflection',
    place_name: 'Kigali Genocide Memorial',
    category: 'culture',
    genre: 'historical_site',
    time: '09:00',
    duration: '2 hours',
    day_of_week: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
    budget_range: 'budget' as const,
    vibe: ['history', 'reflective', 'educational', 'solemn'],
    description: 'Important historical site honoring genocide victims. Powerful and educational experience.',
    trending_factor: 0.5,
    neighborhood: 'Kigali Center',
    audience: ['history_buffs', 'reflective_travelers', 'educators'],
  },
  {
    id: 'evt_012',
    name: 'Heaven Restaurant Fine Dining',
    place_name: 'Heaven Restaurant',
    category: 'dining',
    genre: 'fine_dining',
    time: '19:30',
    duration: '2.5 hours',
    day_of_week: 'Friday,Saturday,Sunday',
    budget_range: 'expensive' as const,
    vibe: ['fine_dining', 'romantic', 'upscale', 'gourmet'],
    description: 'Premium dining with Rwandan and international cuisine. Ideal for special occasions.',
    trending_factor: 0.65,
    neighborhood: 'Kigali Center',
    audience: ['couples', 'food_connoisseurs', 'special_occasions'],
  },
] as EventData[];

export interface EventData {
  id: string;
  name: string;
  place_name: string;
  category: string;
  genre: string;
  time: string;
  duration: string;
  day_of_week: string;
  budget_range: 'budget' | 'moderate' | 'expensive';
  vibe: string[];
  description: string;
  trending_factor: number;
  neighborhood: string;
  audience: string[];
}

export function getEventsByCategory(category: string): EventData[] {
  return EVENTS_DATA.filter(evt => evt.category === category);
}

export function getEventsByNeighborhood(neighborhood: string): EventData[] {
  return EVENTS_DATA.filter(evt => evt.neighborhood.toLowerCase() === neighborhood.toLowerCase());
}

export function getUpcomingEvents(daysAhead: number = 7): EventData[] {
  const today = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const upcomingDays = new Set<string>();

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    upcomingDays.add(daysOfWeek[date.getDay()]);
  }

  return EVENTS_DATA.filter(evt => {
    const eventDays = evt.day_of_week.split(',').map(d => d.trim());
    return eventDays.some(day => upcomingDays.has(day));
  });
}
