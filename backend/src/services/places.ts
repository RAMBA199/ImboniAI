import mongoose from 'mongoose';
import { Place } from '../types';

// Static fallback data when DB is not available
export const STATIC_PLACES: Place[] = [
  {
    id: '1', name: 'Inzora Rooftop Café', description: 'Stunning rooftop café with panoramic views of Kigali hills. Perfect for coffee, cocktails, and light bites.',
    category: 'cafe', tags: ['coffee', 'rooftop', 'views', 'relaxation'], latitude: -1.9441, longitude: 30.0619,
    address: 'KG 7 Ave, Kigali', image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    rating: 4.7, price_range: '$$', is_wheelchair_accessible: true, is_budget_friendly: false, is_family_friendly: true,
  },
  {
    id: '2', name: 'Kigali Serena Restaurant', description: 'Award-winning fine dining in the heart of Kigali. International and local cuisine in an elegant setting.',
    category: 'restaurant', tags: ['fine-dining', 'international', 'luxury'], latitude: -1.9480, longitude: 30.0588,
    address: 'KN 3 Ave, Kigali', image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    rating: 4.8, price_range: '$$$', is_wheelchair_accessible: true, is_budget_friendly: false, is_family_friendly: true,
  },
  {
    id: '3', name: "Nyamirambo Women's Center", description: 'Community café run by local women. Authentic Rwandan breakfast and cultural tours available.',
    category: 'cafe', tags: ['local', 'community', 'breakfast', 'cultural', 'authentic'], latitude: -1.9756, longitude: 30.0461,
    address: 'Nyamirambo, Kigali', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    rating: 4.6, price_range: '$', is_wheelchair_accessible: false, is_budget_friendly: true, is_family_friendly: true,
  },
  {
    id: '4', name: 'Kigali Genocide Memorial', description: 'A powerful and important memorial. Educational and deeply moving tribute to history.',
    category: 'landmark', tags: ['history', 'memorial', 'education', 'cultural'], latitude: -1.9379, longitude: 30.0545,
    address: 'Gasabo, Kigali', image_url: 'https://images.unsplash.com/photo-1580654843061-8c90a9c2e89f?w=800',
    rating: 4.9, price_range: 'Free', is_wheelchair_accessible: true, is_budget_friendly: true, is_family_friendly: false,
  },
  {
    id: '5', name: 'Bourbon Coffee', description: "Popular local coffee chain with Rwanda's finest single-origin coffee. Great workspace vibe.",
    category: 'cafe', tags: ['coffee', 'workspace', 'wifi', 'local-brand'], latitude: -1.9510, longitude: 30.0588,
    address: 'KN 6 Ave, Kigali', image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    rating: 4.4, price_range: '$', is_wheelchair_accessible: true, is_budget_friendly: true, is_family_friendly: true,
  },
  {
    id: '6', name: 'Cactus Bar & Restaurant', description: 'Lively outdoor bar with live music on weekends. Great cocktails and street food vibes.',
    category: 'nightlife', tags: ['nightlife', 'live-music', 'cocktails', 'outdoor'], latitude: -1.9525, longitude: 30.0600,
    address: 'KG 11 Ave, Kigali', image_url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800',
    rating: 4.3, price_range: '$$', is_wheelchair_accessible: false, is_budget_friendly: true, is_family_friendly: false,
  },
  {
    id: '7', name: 'Kimironko Market', description: 'Vibrant local market with fresh produce, traditional crafts, and authentic street food.',
    category: 'market', tags: ['market', 'local', 'crafts', 'food', 'shopping'], latitude: -1.9332, longitude: 30.1028,
    address: 'Kimironko, Kigali', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    rating: 4.5, price_range: '$', is_wheelchair_accessible: false, is_budget_friendly: true, is_family_friendly: true,
  },
  {
    id: '8', name: 'Mt. Kigali Park & Trails', description: 'Scenic hiking trails with stunning city views. Great for morning runs and nature walks.',
    category: 'outdoor', tags: ['hiking', 'nature', 'exercise', 'views'], latitude: -1.9612, longitude: 30.0389,
    address: 'Nyamirambo, Kigali', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    rating: 4.6, price_range: 'Free', is_wheelchair_accessible: false, is_budget_friendly: true, is_family_friendly: true,
  },
  {
    id: '9', name: 'Heaven Restaurant', description: "Iconic Kigali restaurant with award-winning cuisine and lush garden setting.",
    category: 'restaurant', tags: ['fine-dining', 'garden', 'international', 'iconic'], latitude: -1.9502, longitude: 30.0632,
    address: 'Kiyovu, Kigali', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    rating: 4.8, price_range: '$$$', is_wheelchair_accessible: true, is_budget_friendly: false, is_family_friendly: true,
  },
  {
    id: '10', name: 'Kigali Arena', description: 'World-class indoor arena hosting sports events, concerts, and conferences.',
    category: 'entertainment', tags: ['sports', 'concerts', 'events', 'modern'], latitude: -1.9538, longitude: 30.0918,
    address: 'Kimihurura, Kigali', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    rating: 4.7, price_range: '$$', is_wheelchair_accessible: true, is_budget_friendly: false, is_family_friendly: true,
  },
  {
    id: '11', name: 'Repub Lounge', description: 'Trendy rooftop lounge with DJs, cocktails, and Kigali night views.',
    category: 'nightlife', tags: ['nightlife', 'rooftop', 'dj', 'cocktails'], latitude: -1.9489, longitude: 30.0622,
    address: 'KN 3 Ave, Kigali', image_url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
    rating: 4.4, price_range: '$$$', is_wheelchair_accessible: true, is_budget_friendly: false, is_family_friendly: false,
  },
  {
    id: '12', name: 'Kimisagara Street Food', description: 'Local street food paradise. Brochettes, grilled fish, samosas at budget prices.',
    category: 'street-food', tags: ['street-food', 'local', 'budget', 'brochettes'], latitude: -1.9644, longitude: 30.0420,
    address: 'Kimisagara, Kigali', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    rating: 4.5, price_range: '$', is_wheelchair_accessible: false, is_budget_friendly: true, is_family_friendly: true,
  },
  {
    id: '13', name: 'Inema Arts Center', description: 'Contemporary African art gallery and studio. Showcasing Rwandan and Pan-African artists.',
    category: 'art', tags: ['art', 'gallery', 'culture', 'creative', 'african'], latitude: -1.9392, longitude: 30.0748,
    address: 'Kacyiru, Kigali', image_url: 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=800',
    rating: 4.6, price_range: '$', is_wheelchair_accessible: true, is_budget_friendly: true, is_family_friendly: true,
  },
  {
    id: '14', name: 'Question Coffee', description: 'Social enterprise café supporting Rwandan coffee farmers. Specialty brews and cozy atmosphere.',
    category: 'cafe', tags: ['coffee', 'specialty', 'social-enterprise', 'cozy'], latitude: -1.9420, longitude: 30.0780,
    address: 'Kacyiru, Kigali', image_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
    rating: 4.7, price_range: '$$', is_wheelchair_accessible: true, is_budget_friendly: false, is_family_friendly: true,
  },
  {
    id: '15', name: 'Kigali Public Library', description: 'Modern, serene public library with reading rooms, free wifi, and community events.',
    category: 'education', tags: ['reading', 'study', 'wifi', 'quiet', 'free'], latitude: -1.9471, longitude: 30.0602,
    address: 'KN 5 Ave, Kigali', image_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
    rating: 4.5, price_range: 'Free', is_wheelchair_accessible: true, is_budget_friendly: true, is_family_friendly: true,
  },
  // Kiyovu-specific places for hackathon density
  {
    id: '16', name: 'Kiyovu Market', description: 'Bustling local market with fresh produce, crafts, and street food. Perfect for quick bites.',
    category: 'market', tags: ['market', 'local', 'fresh', 'street-food'], latitude: -1.9515, longitude: 30.0618,
    address: 'Kiyovu, Kigali', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    rating: 4.3, price_range: '$', is_wheelchair_accessible: false, is_budget_friendly: true, is_family_friendly: true,
  },
  {
    id: '17', name: 'Papyrus Café Kiyovu', description: 'Cozy café with excellent Rwandan coffee and light meals. Great for working or meeting.',
    category: 'cafe', tags: ['coffee', 'workspace', 'rwandan', 'cozy'], latitude: -1.9508, longitude: 30.0625,
    address: 'Kiyovu, Kigali', image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    rating: 4.4, price_range: '$$', is_wheelchair_accessible: true, is_budget_friendly: false, is_family_friendly: true,
  },
  {
    id: '18', name: 'Le Jardin Restaurant', description: 'French-inspired cuisine in a garden setting. Romantic and elegant dining experience.',
    category: 'restaurant', tags: ['french', 'garden', 'romantic', 'elegant'], latitude: -1.9498, longitude: 30.0638,
    address: 'Kiyovu, Kigali', image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    rating: 4.6, price_range: '$$$', is_wheelchair_accessible: true, is_budget_friendly: false, is_family_friendly: true,
  },
  {
    id: '19', name: 'Kiyovu Pharmacy & Café', description: 'Modern pharmacy with an attached café. Coffee and light snacks while you wait.',
    category: 'cafe', tags: ['pharmacy', 'coffee', 'convenient', 'modern'], latitude: -1.9522, longitude: 30.0612,
    address: 'Kiyovu, Kigali', image_url: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800',
    rating: 4.2, price_range: '$', is_wheelchair_accessible: true, is_budget_friendly: true, is_family_friendly: true,
  },
  {
    id: '20', name: 'Artcafé Kiyovu', description: 'Art gallery and café combined. Local art exhibitions with coffee and pastries.',
    category: 'art', tags: ['art', 'gallery', 'cafe', 'exhibitions', 'local-art'], latitude: -1.9510, longitude: 30.0630,
    address: 'Kiyovu, Kigali', image_url: 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=800',
    rating: 4.5, price_range: '$$', is_wheelchair_accessible: true, is_budget_friendly: false, is_family_friendly: true,
  },
  {
    id: '21', name: 'Kiyovu Tech Hub', description: 'Coworking space for tech entrepreneurs. Fast wifi, meeting rooms, and networking events.',
    category: 'cafe', tags: ['coworking', 'tech', 'wifi', 'networking', 'startup'], latitude: -1.9505, longitude: 30.0628,
    address: 'Kiyovu, Kigali', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    rating: 4.7, price_range: '$$', is_wheelchair_accessible: true, is_budget_friendly: false, is_family_friendly: false,
  },
  {
    id: '22', name: 'Mama Mboga Restaurant', description: 'Authentic Rwandan cuisine with traditional dishes. Family-run with warm hospitality.',
    category: 'restaurant', tags: ['rwandan', 'traditional', 'family-run', 'authentic'], latitude: -1.9528, longitude: 30.0605,
    address: 'Kiyovu, Kigali', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    rating: 4.4, price_range: '$$', is_wheelchair_accessible: false, is_budget_friendly: true, is_family_friendly: true,
  },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function getPlaces(
  category?: string,
  userLat: number = -1.9441,
  userLon: number = 30.0619,
  limit: number = 20
): Promise<Place[]> {
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const places = db.collection('places');
    const query = category && category !== 'all' ? { category } : {};
    const docs = await places.find(query).toArray();

    if (!docs || docs.length === 0) {
      console.warn('No DB places found, falling back to static Kigali dataset');
      let fallbackPlaces = STATIC_PLACES;
      if (category && category !== 'all') {
        fallbackPlaces = fallbackPlaces.filter(p => p.category === category);
      }

      const baseLat = userLat;
      const baseLon = userLon;
      return fallbackPlaces
        .map(p => ({ ...p, distance_km: calculateDistance(baseLat, baseLon, p.latitude, p.longitude) }))
        .sort((a, b) => {
          const distA = a.distance_km || 0;
          const distB = b.distance_km || 0;
          const randomFactor = (Math.random() - 0.5) * 0.1;
          return (distA + randomFactor) - (distB + randomFactor);
        })
        .slice(0, limit);
    }

    return docs
      .map((p: any) => ({
        id: p._id,
        name: p.name,
        description: p.description || '',
        category: p.category || '',
        tags: p.tags,
        latitude: p.location?.lat || 0,
        longitude: p.location?.lng || 0,
        address: p.address || '',
        image_url: p.imageUrl || '',
        rating: p.rating,
        price_range: p.priceRange || '',
        is_wheelchair_accessible: p.isWheelchairAccessible,
        is_budget_friendly: p.isBudgetFriendly,
        is_family_friendly: p.isFamilyFriendly,
        distance_km: calculateDistance(userLat, userLon, p.location?.lat || 0, p.location?.lng || 0),
        created_at: p.createdAt,
      // @ts-ignore
      }))
      .sort((a, b) => {
        const distA = a.distance_km || 0;
        const distB = b.distance_km || 0;
        // Add small random factor to show different places on reload
        const randomFactor = (Math.random() - 0.5) * 0.1; // ±0.05km random variation
        return (distA + randomFactor) - (distB + randomFactor);
      })
      .slice(0, limit);
  } catch (error) {
    console.warn('DB not available, using static data');
    
    // Check if user is in Rwanda/Kigali area (rough bounds)
    const isInRwanda = userLat >= -2.8 && userLat <= -1.0 && userLon >= 28.8 && userLon <= 30.9;
    
    if (!isInRwanda) {
      console.warn('User location outside Rwanda, not showing static Kigali places');
      return [];
    }
    
    let places = STATIC_PLACES;
    if (category && category !== 'all') {
      places = places.filter(p => p.category === category);
    }
    return places
      .map(p => ({ ...p, distance_km: calculateDistance(userLat, userLon, p.latitude, p.longitude) }))
      // @ts-ignore
      .sort((a, b) => {
        const distA = a.distance_km || 0;
        const distB = b.distance_km || 0;
        // Add small random factor to show different places on reload
        const randomFactor = (Math.random() - 0.5) * 0.1; // ±0.05km random variation
        return (distA + randomFactor) - (distB + randomFactor);
      })
      .slice(0, limit);
  }
}

export async function searchPlaces(query: string, userLat = -1.9441, userLon = 30.0619): Promise<Place[]> {
  const searchLower = query.toLowerCase();

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const places = db.collection('places');
    const searchRegex = new RegExp(query, 'i');
    const docs = await places.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
      ],
    }).toArray();

    if (!docs || docs.length === 0) {
      console.warn('No DB search matches found, falling back to static Kigali dataset');
      const staticMatches = STATIC_PLACES.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.tags.some(t => t.toLowerCase().includes(searchLower))
      );
      return staticMatches
        .map(p => ({ ...p, distance_km: calculateDistance(userLat, userLon, p.latitude, p.longitude) }))
        .sort((a, b) => {
          const distA = a.distance_km || 0;
          const distB = b.distance_km || 0;
          const randomFactor = (Math.random() - 0.5) * 0.1;
          return (distA + randomFactor) - (distB + randomFactor);
        });
    }

    return docs.map((p: any) => ({
      id: p._id,
      name: p.name,
      description: p.description || '',
      category: p.category || '',
      tags: p.tags,
      latitude: p.location?.lat || 0,
      longitude: p.location?.lng || 0,
      address: p.address || '',
      image_url: p.imageUrl || '',
      rating: p.rating,
      price_range: p.priceRange || '',
      is_wheelchair_accessible: p.isWheelchairAccessible,
      is_budget_friendly: p.isBudgetFriendly,
      is_family_friendly: p.isFamilyFriendly,
      distance_km: calculateDistance(userLat, userLon, p.location?.lat || 0, p.location?.lng || 0),
      created_at: p.createdAt,
    // @ts-ignore
    })).sort((a, b) => {
      const distA = a.distance_km || 0;
      const distB = b.distance_km || 0;
      // Add small random factor to show different places on reload
      const randomFactor = (Math.random() - 0.5) * 0.1; // ±0.05km random variation
      return (distA + randomFactor) - (distB + randomFactor);
    });
  } catch (error) {
    console.warn('DB not available, using static data');
    const searchLower = query.toLowerCase();
    const places = STATIC_PLACES.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      p.tags.some(t => t.toLowerCase().includes(searchLower))
    );

    return places
      .map(p => ({ ...p, distance_km: calculateDistance(userLat, userLon, p.latitude, p.longitude) }))
      // @ts-ignore
      .sort((a, b) => {
        const distA = a.distance_km || 0;
        const distB = b.distance_km || 0;
        // Add small random factor to show different places on reload
        const randomFactor = (Math.random() - 0.5) * 0.1; // ±0.05km random variation
        return (distA + randomFactor) - (distB + randomFactor);
      });
  }
}
