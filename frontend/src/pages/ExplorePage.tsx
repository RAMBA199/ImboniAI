import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, VStack, HStack, Text, Button, useColorModeValue, Flex, SimpleGrid, Spinner, Center } from '@chakra-ui/react';
import PlacesGrid from '../components/places/PlacesGrid';
import PlaceCard from '../components/places/PlaceCard';
import { Place, UserPreferences } from '../types';
import { fetchPlaces, fetchHiddenGems } from '../utils/api';
import { STATIC_PLACES } from '../data/places';
import { t } from '../utils/i18n';

interface ExplorePageProps {
  preferences: UserPreferences;
  onAskAI: (place: Place) => void;
  onSuggestionClick: (query: string) => void;
  onDataSourceChange?: (source: 'database' | 'static') => void;
}

const QUICK_SUGGESTIONS = (language: 'en' | 'rw') => [
  { label: t('quickEat', language), query: 'Where can I eat good food in Kigali?' },
  { label: t('quickCoffee', language), query: 'Best coffee spots in Kigali' },
  { label: t('quickRelax', language), query: 'Where can I relax in Kigali?' },
  { label: t('quickNightlife', language), query: 'Best nightlife spots in Kigali' },
  { label: t('quickBudget', language), query: 'Budget-friendly places in Kigali' },
  { label: t('quickAccessible', language), query: 'Wheelchair accessible places in Kigali' },
];

// Map user interests to place filters and scoring
function getPreferenceFilter(interests: string[]) {
  return (place: Place) => {
    if (interests.length === 0) return true;

    return interests.some(interest => {
      switch (interest) {
        case 'food':
          return place.category === 'restaurant' || place.category === 'street-food' || place.tags.some(tag => /food|restaurant|menu/i.test(tag));
        case 'coffee':
          return place.category === 'cafe' || place.tags.some(tag => /coffee|cafe|espresso|brew/i.test(tag));
        case 'nightlife':
          return place.category === 'nightlife' || place.tags.some(tag => /bar|nightlife|dj|cocktail|lounge/i.test(tag));
        case 'relaxation':
          return place.tags.includes('relaxation') || place.category === 'outdoor' || place.category === 'cafe';
        case 'culture':
          return place.category === 'landmark' || place.category === 'art';
        case 'outdoor':
          return place.category === 'outdoor';
        case 'budget':
          return place.is_budget_friendly || place.tags.some(tag => /budget|cheap|affordable/i.test(tag));
        case 'family':
          return place.is_family_friendly || place.tags.some(tag => /family|kids|children/i.test(tag));
        default:
          return false;
      }
    });
  };
}

function scorePlaceByPreferences(place: PlaceWithDistance, interests: string[]) {
  let score = (place.rating || 3.5) * 10;

  interests.forEach(interest => {
    const category = place.category || '';
    const tags = place.tags || [];

    switch (interest) {
      case 'food':
        score += category === 'restaurant' || category === 'street-food' ? 18 : tags.some(tag => /food|restaurant|menu/i.test(tag)) ? 10 : 0;
        break;
      case 'coffee':
        score += category === 'cafe' ? 20 : tags.some(tag => /coffee|cafe|espresso|brew/i.test(tag)) ? 12 : 0;
        break;
      case 'nightlife':
        score += category === 'nightlife' ? 20 : tags.some(tag => /nightlife|bar|lounge|dj|cocktail/i.test(tag)) ? 12 : 0;
        break;
      case 'relaxation':
        score += tags.includes('relaxation') || category === 'outdoor' || category === 'cafe' ? 16 : 0;
        break;
      case 'culture':
        score += category === 'landmark' || category === 'art' ? 18 : 0;
        break;
      case 'outdoor':
        score += category === 'outdoor' ? 18 : 0;
        break;
      case 'budget':
        score += place.is_budget_friendly ? 16 : tags.some(tag => /budget|cheap|affordable/i.test(tag)) ? 10 : 0;
        break;
      case 'family':
        score += place.is_family_friendly ? 16 : tags.some(tag => /family|kids|children/i.test(tag)) ? 10 : 0;
        break;
      default:
        break;
    }
  });

  if (place.distance_km != null) {
    score += Math.max(0, 5 - Math.min(place.distance_km, 5));
  }

  return score;
}

interface PlaceWithDistance extends Place {
  distance_km?: number;
}

const ExplorePage: React.FC<ExplorePageProps> = ({ preferences, onAskAI, onSuggestionClick, onDataSourceChange }) => {
  const [allPlaces, setAllPlaces] = useState<PlaceWithDistance[]>([]);
  const [hiddenGems, setHiddenGems] = useState<PlaceWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationUsed, setLocationUsed] = useState<'user' | 'default'>('default');
  const [dataSource, setDataSource] = useState<'database' | 'static'>('static');

  const heroBg = useColorModeValue('brand.50', '#1a2635');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const sectionBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const sectionTitleColor = useColorModeValue('gray.900', 'white');

  const calculateDistanceKm = useCallback((a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aVal = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
  }, []);

  const loadPlaces = useCallback(async (location?: { lat: number; lon: number }) => {
    setLoading(true);
    console.log('Loading places for Explore page...');
    try {
      let currentLocation = location ?? null;
      if (!currentLocation && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: true,
              maximumAge: 0, // Always get a fresh fix — never serve a cached/VPN position
            });
          });
          currentLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(currentLocation);
          console.log('Got user location:', currentLocation);
        } catch (geoError: any) {
          console.warn('Geolocation failed:', geoError);
        }
      }

      console.log('Making API call to fetchPlaces...');
      const data = await fetchPlaces({
        lat: currentLocation?.lat,
        lon: currentLocation?.lon,
        limit: 50,
      });
      console.log('API response:', data);

      // Recalculate distances client-side using the freshest location we have
      // This ensures distances are always accurate regardless of what the server computed
      const freshLocation = currentLocation ?? userLocation;
      const placesWithFreshDistances = freshLocation
        ? data.places.map((p: any) => ({
            ...p,
            distance_km: Math.round(calculateDistanceKm(freshLocation, { lat: p.latitude, lon: p.longitude }) * 10) / 10,
          }))
        : data.places;

      setAllPlaces(placesWithFreshDistances);
      setDataSource(data.dataSource || 'static');
      setLocationUsed(data.locationUsed ?? (currentLocation ? 'user' : 'default'));
      if (onDataSourceChange && data.dataSource) {
        onDataSourceChange(data.dataSource);
      }

      try {
        const hiddenResponse = await fetchHiddenGems({
          lat: currentLocation?.lat,
          lon: currentLocation?.lon,
          limit: 6,
        });
        setHiddenGems((hiddenResponse.businesses || []).map((item: any) => ({
          ...item,
          distance_km: item.distance_km !== undefined ? item.distance_km : undefined,
        })));
      } catch (hiddenError) {
        console.warn('Hidden Gems fetch failed:', hiddenError);
        setHiddenGems([]);
      }

      if (currentLocation) {
        setUserLocation(currentLocation);
      }

      if (data.message) {
        console.log('Places API message:', data.message);
      }
    } catch (error) {
      console.error('Places API error:', error);
      // Use static data as fallback — still apply fresh distances if we have location
      const freshLocation = location ?? userLocation;
      const fallbackPlaces = freshLocation
        ? STATIC_PLACES.map(p => ({
            ...p,
            distance_km: Math.round(calculateDistanceKm(freshLocation, { lat: p.latitude, lon: p.longitude }) * 10) / 10,
          }))
        : STATIC_PLACES;
      setAllPlaces(fallbackPlaces);
      setDataSource('static');
      setLocationUsed(freshLocation ? 'user' : 'default');
      try {
        const hiddenResponse = await fetchHiddenGems({
          lat: freshLocation?.lat,
          lon: freshLocation?.lon,
          limit: 6,
        });
        setHiddenGems((hiddenResponse.businesses || []).map((item: any) => ({
          ...item,
          distance_km: item.distance_km !== undefined ? item.distance_km : undefined,
        })));
      } catch (hiddenError) {
        console.warn('Hidden Gems fetch failed:', hiddenError);
        setHiddenGems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [onDataSourceChange]);

  const latestLocationRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      loadPlaces();
      return;
    }

    const getInitialLocation = async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: 0, // Force fresh reading — busts browser/VPN cached position
          });
        });

        const location = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        latestLocationRef.current = location;
        setUserLocation(location);
      } catch (geoError: any) {
        console.warn('Geolocation failed:', geoError);
        loadPlaces();
      }
    };

    getInitialLocation();
  }, [loadPlaces]);

  useEffect(() => {
    if (userLocation) {
      loadPlaces(userLocation);
    } else if (!navigator.geolocation) {
      loadPlaces();
    }
  }, [loadPlaces, userLocation]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const location = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const previousLocation = latestLocationRef.current;

        if (!previousLocation || calculateDistanceKm(previousLocation, location) > 0.2) {
          latestLocationRef.current = location;
          setUserLocation(location);
        }
      },
      (error) => {
        console.warn('Geolocation watch failed:', error);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 5000, // Allow 5s cached reading for watchPosition (saves battery, still fresh)
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [calculateDistanceKm]);

  // Filter sections
  const forYouPlaces = (() => {
    const combined = [...hiddenGems, ...allPlaces];
    const uniquePlaces = Array.from(new Map(combined.map(place => [place.id, place])).values());

    if (preferences.interests.length === 0) {
      return uniquePlaces
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);
    }

    const scored = uniquePlaces
      .map(place => ({ place, score: scorePlaceByPreferences(place, preferences.interests) }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.place);

    return scored.slice(0, 6);
  })();

  const popularPlaces = [...allPlaces]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  // Only show "Near You" when we have the user's real GPS — never when using default coords
  const nearbyPlaces = locationUsed === 'user'
    ? allPlaces
        .filter(p => p.distance_km !== undefined && p.distance_km !== null)
        .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0))
        .slice(0, 5)
    : [];

  const SectionTitle = ({ children, emoji }: { children: React.ReactNode; emoji: string }) => (
    <HStack spacing={2} mb={4}>
      <Text fontSize="2xl">{emoji}</Text>
      <Text fontSize="xl" fontWeight="700" color={sectionTitleColor}>
        {children}
      </Text>
    </HStack>
  );

  const PlaceGridRow = ({ places: items }: { places: Place[] }) => (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 3 }} spacing={4}>
      {items.map(place => (
        <PlaceCard key={place.id} place={place} onAskAI={onAskAI} simpleMode={preferences.simpleMode} />
      ))}
    </SimpleGrid>
  );

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="brand.400" thickness="3px" />
      </Center>
    );
  }

  return (
    <VStack align="stretch" spacing={0}>
      {/* Hero Banner */}
      <Box bg={heroBg} px={{ base: 4, md: 8 }} py={8} borderBottom="1px solid"
        borderColor={useColorModeValue('brand.100', 'whiteAlpha.100')}>
        <Box maxW="1400px" mx="auto">
          <VStack align="start" spacing={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" lineHeight="1.2">
                {preferences.simpleMode
                  ? t('exploreHeroSimple', preferences.language)
                  : `🌍 ${preferences.interests.length > 0 ? t('exploreHeroPersonalized', preferences.language) : t('exploreHeroDefault', preferences.language)}`}
              </Text>
              <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                {preferences.simpleMode
                  ? t('exploreHeroSimpleDesc', preferences.language)
                  : preferences.interests.length > 0
                    ? `${t('exploreHeroInterests', preferences.language)}: ${preferences.interests.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ')}`
                    : t('exploreHeroDefaultDesc', preferences.language)}
              </Text>
            </VStack>

            {/* Quick suggestion chips */}
            <Flex gap={2} flexWrap="wrap">
              {QUICK_SUGGESTIONS(preferences.language).map(s => (
                <Button
                  key={s.label}
                  size={{ base: 'sm', md: 'md' }}
                  variant="solid"
                  colorScheme="brand"
                  borderRadius="full"
                  onClick={() => onSuggestionClick(s.query)}
                  fontWeight="600"
                  _hover={{ transform: 'scale(1.03)' }}
                  transition="all 0.2s"
                >
                  {s.label}
                </Button>
              ))}
            </Flex>
          </VStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box px={{ base: 4, md: 8 }} py={12} maxW="1400px" mx="auto" w="100%">
        <VStack align="stretch" spacing={12}>
          {/* Near You Section — only when real GPS is available */}
          {nearbyPlaces.length > 0 && (
            <Box bg={sectionBg} p={6} borderRadius="2xl">
              <HStack mb={1}>
                <SectionTitle emoji="📍">{t('exploreNearYouTitle', preferences.language)}</SectionTitle>
              </HStack>
              <Text color={mutedColor} mb={4} fontSize="sm">
                {t('exploreNearYouSubtitle', preferences.language)}
              </Text>
              <PlaceGridRow places={nearbyPlaces} />
            </Box>
          )}

          {/* Location permission nudge — shown only when location is unavailable */}
          {locationUsed === 'default' && (
            <Box
              bg={useColorModeValue('blue.50', 'whiteAlpha.50')}
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'whiteAlpha.200')}
              p={4}
              borderRadius="2xl"
            >
              <HStack spacing={3}>
                <Text fontSize="2xl">📍</Text>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="700" fontSize="sm">{t('exploreEnableLocationTitle', preferences.language)}</Text>
                  <Text fontSize="xs" color={mutedColor}>
                    {t('exploreEnableLocationSubtitle', preferences.language)}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}
          {/* For You Section */}
          {preferences.interests.length > 0 && forYouPlaces.length > 0 && (
            <Box bg={sectionBg} p={6} borderRadius="2xl">
              <SectionTitle emoji="👤">{t('exploreForYouTitle', preferences.language)}</SectionTitle>
              <Text color={mutedColor} mb={4} fontSize="sm">
                {t('exploreForYouSubtitle', preferences.language)}
                {dataSource === 'static' && (
                  <Text as="span" color="orange.500" ml={2} fontSize="xs">
                    (Demo data)
                  </Text>
                )}
              </Text>
              <PlaceGridRow places={forYouPlaces} />
            </Box>
          )}

          {/* Full Places Section */}
          <Box>
            <SectionTitle emoji="🌐">{t('exploreAllPlacesTitle', preferences.language)}</SectionTitle>
            <PlacesGrid
              onAskAI={onAskAI}
              simpleMode={preferences.simpleMode}
              showSearch={true}
              onDataSourceChange={onDataSourceChange}
              initialPlaces={allPlaces}
            />
          </Box>

          {/* Hidden Gems Section */}
          <Box bg={sectionBg} p={6} borderRadius="2xl">
            <SectionTitle emoji="💎">{t('exploreHiddenGemsTitle', preferences.language)}</SectionTitle>
            <Text color={mutedColor} mb={4} fontSize="sm">
              {t('exploreHiddenGemsDesc', preferences.language)}
            </Text>
            {hiddenGems.length > 0 ? (
              <PlaceGridRow places={hiddenGems} />
            ) : (
              <Box p={6} borderRadius="xl" bg={useColorModeValue('white', '#0f1923')} border="1px dashed" borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}>
                <Text color={mutedColor} textAlign="center">
                  {t('exploreNoHiddenGems', preferences.language)}
                </Text>
              </Box>
            )}
          </Box>
        </VStack>
      </Box>
    </VStack>
  );
};

export default ExplorePage;
