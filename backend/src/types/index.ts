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
  created_at?: Date;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  created_at?: Date;
}

export interface UserPreference {
  user_id: string;
  interests: string[];
  language: string;
  simple_mode: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: Date;
}

export interface ChatRequest {
  message: string;
  session_id: string;
  language?: 'en' | 'rw';
  user_preferences?: string[];
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

export interface ChatResponse {
  response: string;
  places?: Place[];
  locationLinks?: LocationLink[];
  session_id: string;
  model_used: string;
}

export interface VoiceRequest {
  audio_data: string;
  language?: 'en' | 'rw';
}

export interface VoiceResponse {
  transcription: string;
  confidence: number;
  language: string;
}
