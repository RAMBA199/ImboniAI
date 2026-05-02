import mongoose from 'mongoose';
import { Place } from '../types';

const DEFAULT_LAT = -1.9441;
const DEFAULT_LON = 30.0619;

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

function toPlace(p: any, userLat: number = DEFAULT_LAT, userLon: number = DEFAULT_LON): Place {
  const latitude = p.location?.lat ?? DEFAULT_LAT;
  const longitude = p.location?.lng ?? DEFAULT_LON;

  const tags = [
    ...(Array.isArray(p.tags) ? p.tags : []),
    ...(p.category ? [p.category] : []),
    ...(p.type ? [p.type] : []),
    ...(p.feel ? p.feel.split(/[,\n]/).map((item: string) => item.trim()).filter(Boolean) : []),
  ].filter((value, index, self) => value && self.indexOf(value) === index);

  return {
    id: String(p._id),
    name: p.name,
    description: p.description || p.menus || p.feel || 'A registered business hidden gem in Kigali.',
    category: p.category || p.type || 'restaurant',
    tags,
    latitude,
    longitude,
    address: p.address || p.locationText || 'Kigali, Rwanda',
    image_url: p.imageUrl || p.image_url || '',
    rating: typeof p.rating === 'number' ? p.rating : 4.2,
    price_range: p.priceRange || p.price_range || '$$',
    is_wheelchair_accessible: typeof p.isWheelchairAccessible === 'boolean' ? p.isWheelchairAccessible : false,
    is_budget_friendly: typeof p.isBudgetFriendly === 'boolean' ? p.isBudgetFriendly : false,
    is_family_friendly: typeof p.isFamilyFriendly === 'boolean' ? p.isFamilyFriendly : false,
    distance_km: calculateDistance(userLat, userLon, latitude, longitude),
    created_at: p.createdAt,
  };
}

export async function registerBusiness(payload: {
  name: string;
  address: string;
  businessType: string;
  businessFeel: string;
  menus: string;
  plan: string;
  locationText?: string;
}) {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');

  const businesses = db.collection('businesses');
  const businessRecord = {
    name: payload.name,
    address: payload.address,
    location: { lat: DEFAULT_LAT, lng: DEFAULT_LON },
    locationText: payload.address,
    type: payload.businessType,
    category: payload.businessType,
    feel: payload.businessFeel,
    menus: payload.menus,
    description: `Menus: ${payload.menus}. Feel: ${payload.businessFeel}.`,
    tags: [payload.businessType, ...payload.businessFeel.split(/[,\n]/).map(t => t.trim()).filter(Boolean)],
    plan: payload.plan,
    rating: 4.2,
    priceRange: '$$',
    isWheelchairAccessible: false,
    isBudgetFriendly: payload.businessFeel.toLowerCase().includes('budget'),
    isFamilyFriendly: payload.businessFeel.toLowerCase().includes('family'),
    createdAt: new Date(),
  };

  const result = await businesses.insertOne(businessRecord as any);
  return toPlace({ ...businessRecord, _id: result.insertedId });
}

export async function getHiddenGems(search?: string, userLat: number = DEFAULT_LAT, userLon: number = DEFAULT_LON, limit: number = 6): Promise<Place[]> {
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const businesses = db.collection('businesses');
    const query: any = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { type: regex },
        { category: regex },
        { tags: regex },
        { menus: regex },
        { feel: regex },
        { address: regex },
      ];
    }

    const docs = await businesses.find(query).sort({ createdAt: -1 }).limit(limit).toArray();
    return docs.map(doc => toPlace(doc, userLat, userLon));
  } catch (error) {
    console.warn('Hidden gems service fallback:', error);
    return [];
  }
}

export async function searchBusinesses(query: string, userLat: number = DEFAULT_LAT, userLon: number = DEFAULT_LON): Promise<Place[]> {
  if (!query || query.trim().length === 0) {
    return getHiddenGems(undefined, userLat, userLon, 5);
  }

  const searchRegex = new RegExp(query, 'i');
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const businesses = db.collection('businesses');
    const docs = await businesses.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { type: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
        { menus: searchRegex },
        { feel: searchRegex },
        { address: searchRegex },
      ],
    }).limit(10).toArray();

    return docs.map(doc => toPlace(doc, userLat, userLon));
  } catch (error) {
    console.warn('Business search fallback:', error);
    return [];
  }
}
