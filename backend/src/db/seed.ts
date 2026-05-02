import { connectDB, getOrCreateDemoUser } from './index';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const kigaliPlaces = [
  {
    _id: 'inzora-rooftop-cafe',
    name: 'Inzora Rooftop Café',
    description: 'Stunning rooftop café with panoramic views of Kigali hills. Perfect for coffee, cocktails, and light bites with friends.',
    category: 'cafe',
    tags: ['coffee', 'rooftop', 'views', 'cocktails', 'relaxation'],
    location: { lat: -1.9441, lng: 30.0619 },
    address: 'KG 7 Ave, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    rating: 4.7,
    priceRange: '$$',
    isWheelchairAccessible: true,
    isBudgetFriendly: false,
    isFamilyFriendly: true,
  },
  {
    _id: 'kigali-serena-restaurant',
    name: 'Kigali Serena Hotel Restaurant',
    description: 'Award-winning fine dining in the heart of Kigali. International and local cuisine in an elegant setting.',
    category: 'restaurant',
    tags: ['fine-dining', 'international', 'local-cuisine', 'luxury'],
    location: { lat: -1.9480, lng: 30.0588 },
    address: 'KN 3 Ave, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    rating: 4.8,
    priceRange: '$$$',
    isWheelchairAccessible: true,
    isBudgetFriendly: false,
    isFamilyFriendly: true,
  },
  {
    _id: 'nyamirambo-womens-center',
    name: 'Nyamirambo Women\'s Center Café',
    description: 'Community café run by local women. Authentic Rwandan breakfast and lunch with cultural tours available.',
    category: 'cafe',
    tags: ['local', 'community', 'breakfast', 'cultural', 'authentic'],
    location: { lat: -1.9756, lng: 30.0461 },
    address: 'Nyamirambo, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    rating: 4.6,
    priceRange: '$',
    isWheelchairAccessible: false,
    isBudgetFriendly: true,
    isFamilyFriendly: true,
  },
  {
    _id: 'kigali-genocide-memorial',
    name: 'Kigali Genocide Memorial',
    description: 'A powerful and important memorial honoring victims of the 1994 genocide. Educational and deeply moving.',
    category: 'landmark',
    tags: ['history', 'memorial', 'education', 'cultural', 'important'],
    location: { lat: -1.9379, lng: 30.0545 },
    address: 'Gasabo, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1580654843061-8c90a9c2e89f?w=800',
    rating: 4.9,
    priceRange: 'Free',
    isWheelchairAccessible: true,
    isBudgetFriendly: true,
    isFamilyFriendly: false,
  },
  {
    _id: 'bourbon-coffee',
    name: 'Bourbon Coffee',
    description: 'Popular local coffee chain with Rwanda\'s finest single-origin coffee. Great workspace vibe.',
    category: 'cafe',
    tags: ['coffee', 'workspace', 'wifi', 'local-brand', 'breakfast'],
    location: { lat: -1.9510, lng: 30.0588 },
    address: 'KN 6 Ave, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    rating: 4.4,
    priceRange: '$',
    isWheelchairAccessible: true,
    isBudgetFriendly: true,
    isFamilyFriendly: true,
  },
  {
    _id: 'cactus-bar-restaurant',
    name: 'Cactus Bar & Restaurant',
    description: 'Lively outdoor bar with live music on weekends. Great cocktails and street food vibes.',
    category: 'nightlife',
    tags: ['nightlife', 'live-music', 'cocktails', 'outdoor', 'social'],
    location: { lat: -1.9525, lng: 30.0600 },
    address: 'KG 11 Ave, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800',
    rating: 4.3,
    priceRange: '$$',
    isWheelchairAccessible: false,
    isBudgetFriendly: true,
    isFamilyFriendly: false,
  },
  {
    _id: 'kimironko-market',
    name: 'Kimironko Market',
    description: 'Vibrant local market with fresh produce, traditional crafts, and street food. An authentic Kigali experience.',
    category: 'market',
    tags: ['market', 'local', 'crafts', 'food', 'shopping'],
    location: { lat: -1.9332, lng: 30.1028 },
    address: 'Kimironko, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    rating: 4.5,
    priceRange: '$',
    isWheelchairAccessible: false,
    isBudgetFriendly: true,
    isFamilyFriendly: true,
  },
  {
    _id: 'mt-kigali-park',
    name: 'Mt. Kigali Park & Trails',
    description: 'Scenic hiking trails with stunning city views. Great for morning runs and nature walks.',
    category: 'outdoor',
    tags: ['hiking', 'nature', 'exercise', 'views'],
    location: { lat: -1.9612, lng: 30.0389 },
    address: 'Nyamirambo, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    rating: 4.6,
    priceRange: 'Free',
    isWheelchairAccessible: false,
    isBudgetFriendly: true,
    isFamilyFriendly: true,
  },
  {
    _id: 'heaven-restaurant',
    name: 'Heaven Restaurant',
    description: 'Iconic Kigali restaurant with award-winning cuisine and lush garden setting.',
    category: 'restaurant',
    tags: ['fine-dining', 'garden', 'international', 'iconic'],
    location: { lat: -1.9502, lng: 30.0632 },
    address: 'Kiyovu, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    rating: 4.8,
    priceRange: '$$$',
    isWheelchairAccessible: true,
    isBudgetFriendly: false,
    isFamilyFriendly: true,
  },
  {
    _id: 'kigali-arena',
    name: 'Kigali Arena',
    description: 'World-class indoor arena hosting sports events, concerts, and conferences.',
    category: 'entertainment',
    tags: ['sports', 'concerts', 'events', 'modern'],
    location: { lat: -1.9538, lng: 30.0918 },
    address: 'Kimihurura, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    rating: 4.7,
    priceRange: '$$',
    isWheelchairAccessible: true,
    isBudgetFriendly: false,
    isFamilyFriendly: true,
  },
  {
    _id: 'repub-lounge',
    name: 'Repub Lounge',
    description: 'Trendy rooftop lounge with DJs, cocktails, and Kigali night views.',
    category: 'nightlife',
    tags: ['nightlife', 'rooftop', 'dj', 'cocktails'],
    location: { lat: -1.9489, lng: 30.0622 },
    address: 'KN 3 Ave, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
    rating: 4.4,
    priceRange: '$$$',
    isWheelchairAccessible: true,
    isBudgetFriendly: false,
    isFamilyFriendly: false,
  },
  {
    _id: 'kimisagara-street-food',
    name: 'Kimisagara Street Food',
    description: 'Local street food paradise. Brochettes, grilled fish, samosas at budget prices.',
    category: 'street-food',
    tags: ['street-food', 'local', 'budget', 'brochettes'],
    location: { lat: -1.9644, lng: 30.0420 },
    address: 'Kimisagara, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    rating: 4.5,
    priceRange: '$',
    isWheelchairAccessible: false,
    isBudgetFriendly: true,
    isFamilyFriendly: true,
  },
  {
    _id: 'inema-arts-center',
    name: 'Inema Arts Center',
    description: 'Contemporary African art gallery and studio. Showcasing Rwandan and Pan-African artists.',
    category: 'art',
    tags: ['art', 'gallery', 'culture', 'creative', 'african'],
    location: { lat: -1.9392, lng: 30.0748 },
    address: 'Kacyiru, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=800',
    rating: 4.6,
    priceRange: '$',
    isWheelchairAccessible: true,
    isBudgetFriendly: true,
    isFamilyFriendly: true,
  },
  {
    _id: 'question-coffee',
    name: 'Question Coffee',
    description: 'Social enterprise café supporting Rwandan coffee farmers. Specialty brews and cozy atmosphere.',
    category: 'cafe',
    tags: ['coffee', 'specialty', 'social-enterprise', 'cozy'],
    location: { lat: -1.9420, lng: 30.0780 },
    address: 'Kacyiru, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
    rating: 4.7,
    priceRange: '$$',
    isWheelchairAccessible: true,
    isBudgetFriendly: false,
    isFamilyFriendly: true,
  },
  {
    _id: 'kigali-public-library',
    name: 'Kigali Public Library',
    description: 'Modern, serene public library with reading rooms, free wifi, and community events.',
    category: 'education',
    tags: ['reading', 'study', 'wifi', 'quiet', 'free'],
    location: { lat: -1.9471, lng: 30.0602 },
    address: 'KN 5 Ave, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
    rating: 4.5,
    priceRange: 'Free',
    isWheelchairAccessible: true,
    isBudgetFriendly: true,
    isFamilyFriendly: true,
  },
];

const sampleBusinesses = [
  {
    _id: 'hidden-gem-rooftop-bistro',
    name: 'Hidden Gem Rooftop Bistro',
    description: 'Cozy rooftop bistro with local dishes, craft cocktails, and a laid-back Kigali sunset vibe.',
    category: 'restaurant',
    type: 'restaurant',
    tags: ['hidden-gem', 'rooftop', 'local', 'cocktails'],
    location: { lat: -1.9455, lng: 30.0623 },
    address: 'KG 9 Ave, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    menus: 'Small plates, local favorites, cocktails, mocktails.',
    feel: 'Warm, intimate, locally inspired, relaxing',
    rating: 4.5,
    priceRange: '$$',
    isWheelchairAccessible: false,
    isBudgetFriendly: false,
    isFamilyFriendly: true,
    createdAt: new Date(),
  },
  {
    _id: 'hidden-gem-coffee-lab',
    name: 'Hidden Gem Coffee Lab',
    description: 'A specialty coffee studio with single-origin brews, tasting flights, and a creative local atmosphere.',
    category: 'cafe',
    type: 'cafe',
    tags: ['coffee', 'specialty', 'creative', 'hidden-gem'],
    location: { lat: -1.9467, lng: 30.0587 },
    address: 'KN 5 Ave, Kigali',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    menus: 'Espresso flights, cold brew, artisan pastries.',
    feel: 'Artisanal, quiet, creative, community-driven',
    rating: 4.6,
    priceRange: '$$',
    isWheelchairAccessible: true,
    isBudgetFriendly: false,
    isFamilyFriendly: true,
    createdAt: new Date(),
  },
];

export async function seedPlaces() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');

  const places = db.collection('places');
  await places.deleteMany({}); // Clear existing data
  await places.insertMany(kigaliPlaces as any);
  console.log(`✅ Seeded ${kigaliPlaces.length} places`);
}

export async function seedBusinesses() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');

  const businesses = db.collection('businesses');
  await businesses.deleteMany({});
  await businesses.insertMany(sampleBusinesses as any);
  console.log(`✅ Seeded ${sampleBusinesses.length} hidden gem businesses`);
}

async function main() {
  let retries = 10;
  while (retries > 0) {
    try {
      console.log('Attempting to connect to MongoDB...');
      await connectDB();
      console.log('Connected! Seeding database...');
      await getOrCreateDemoUser();
      await seedPlaces();
      await seedBusinesses();
      console.log('🎉 Database seeded successfully!');
      return; // Success, exit normally
    } catch (error) {
      console.error(`❌ Seeding failed (retries left: ${retries - 1}):`, error);
      retries--;
      if (retries > 0) {
        console.log('Retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } finally {
      try {
        await mongoose.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
  }
  console.error('❌ All seeding attempts failed. Container will continue without seeding.');
  // Don't exit - let the container continue
}
