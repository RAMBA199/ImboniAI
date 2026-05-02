export interface Place {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  latitude: number;
  longitude: number;
  address: string;
  image_url: string;
  rating: number;
  price_range: string;
  is_wheelchair_accessible: boolean;
  is_budget_friendly: boolean;
  is_family_friendly: boolean;
  distance_km?: number;
}

export interface LocationLink {
  placeId: string;
  placeName: string;
  latitude: number;
  longitude: number;
  address: string;
  image_url: string;
  mapsUrl: string;
  requiresPayment: boolean;
  price_rwf?: number;
  payment_note?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  places?: Place[];
  locationLinks?: LocationLink[];
  timestamp: Date;
}

export interface UserPreferences {
  interests: string[];
  language: 'en' | 'rw';
  simpleMode: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  profilePic?: string;
  preferences: UserPreferences;
  isPaid?: boolean;
}

export type Category = 'all' | 'cafe' | 'restaurant' | 'nightlife' | 'outdoor' | 'market' | 'landmark' | 'art' | 'entertainment' | 'street-food' | 'education';
