import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, SimpleGrid, Text, VStack, HStack, Button, Input, InputGroup,
  InputLeftElement, Select, Spinner, Center, useColorModeValue, Badge,
  Flex, useToast,
} from '@chakra-ui/react';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import PlaceCard from './PlaceCard';
import { Place, Category } from '../../types';
import { fetchPlaces } from '../../utils/api';
import { STATIC_PLACES } from '../../data/places';

interface PlacesGridProps {
  onAskAI: (place: Place) => void;
  simpleMode: boolean;
  filterCategory?: string;
  title?: string;
  showSearch?: boolean;
  onDataSourceChange?: (source: 'database' | 'static') => void;
  initialPlaces?: Place[];
}

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'all', label: 'All Places', emoji: '🌍' },
  { value: 'cafe', label: 'Cafés', emoji: '☕' },
  { value: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
  { value: 'nightlife', label: 'Nightlife', emoji: '🎉' },
  { value: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { value: 'market', label: 'Markets', emoji: '🛒' },
  { value: 'landmark', label: 'Landmarks', emoji: '🏛️' },
  { value: 'art', label: 'Arts', emoji: '🎨' },
  { value: 'street-food', label: 'Street Food', emoji: '🍢' },
];

const PlacesGrid: React.FC<PlacesGridProps> = ({
  onAskAI, simpleMode, filterCategory, title, showSearch = true, onDataSourceChange, initialPlaces
}) => {
  const hasInitialPlaces = initialPlaces !== undefined;
  const [places, setPlaces] = useState<Place[]>(initialPlaces ?? []);
  const [loading, setLoading] = useState(initialPlaces === undefined);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>(
    (filterCategory as Category) || 'all'
  );
  const [locationUsed, setLocationUsed] = useState<'user' | 'default'>('default');
  const toast = useToast();
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const chipBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const chipActiveBg = useColorModeValue('brand.500', 'brand.400');

  const calculateDistanceKm = useCallback((a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal)) * 10) / 10;
  }, []);

  const filterPlaces = useCallback((source: Place[], category: string, q?: string) => {
    let filtered = source;
    if (category && category !== 'all') {
      filtered = filtered.filter(place => place.category === category);
    }
    if (q) {
      const queryLower = q.toLowerCase();
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(queryLower) ||
        place.description.toLowerCase().includes(queryLower) ||
        place.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }
    return filtered;
  }, []);

  const loadPlaces = useCallback(async (cat: string, q?: string) => {
    if (hasInitialPlaces) {
      setLoading(true);
      setPlaces(filterPlaces(initialPlaces!, cat, q));
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Loading places for category:', cat, 'search:', q);
    try {
      let userCoords: { lat: number; lon: number } | null = null;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: true,
              maximumAge: 0, // Always fresh — never serve a stale/VPN position
            });
          });
          userCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          console.log('Got user location:', userCoords);
        } catch (geoError: any) {
          console.warn('Geolocation failed:', geoError);
        }
      }

      const data = await fetchPlaces({
        category: cat === 'all' ? undefined : cat,
        lat: userCoords?.lat,
        lon: userCoords?.lon,
        search: q,
        limit: 30,
      });

      // Recalculate distances client-side so they always reflect the freshest position
      const enriched = userCoords
        ? data.places.map((p: Place) => ({
            ...p,
            distance_km: calculateDistanceKm(userCoords!, { lat: p.latitude, lon: p.longitude }),
          }))
        : data.places;

      setPlaces(enriched);
      setLocationUsed(data.locationUsed ?? (userCoords ? 'user' : 'default'));

      if (onDataSourceChange && data.dataSource) {
        onDataSourceChange(data.dataSource);
      }

      if (data.message) {
        toast({
          title: 'No places found',
          description: data.message,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Places API error:', error);
      let filtered = STATIC_PLACES;
      if (cat !== 'all') filtered = filtered.filter(p => p.category === cat);
      if (q) {
        const ql = q.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(ql) ||
          p.description.toLowerCase().includes(ql) ||
          p.tags.some(t => t.toLowerCase().includes(ql))
        );
      }
      setPlaces(filtered);
      setLocationUsed('default');

      const errorMessage = (error as any)?.response?.data?.error || (error as any)?.message || 'Unknown error';
      toast({
        title: 'Using offline data',
        description: `Could not load real-time places (${errorMessage}). Showing preset Kigali locations.`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [calculateDistanceKm, filterPlaces, hasInitialPlaces, initialPlaces, onDataSourceChange, toast]);

  useEffect(() => {
    if (!hasInitialPlaces) {
      loadPlaces(activeCategory);
    }
  }, [activeCategory, hasInitialPlaces, loadPlaces]);

  useEffect(() => {
    if (hasInitialPlaces) {
      setPlaces(filterPlaces(initialPlaces!, activeCategory, search.trim()));
    }
  }, [activeCategory, filterPlaces, hasInitialPlaces, initialPlaces, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) loadPlaces(activeCategory, search.trim());
  };

  const handleCategoryClick = (cat: Category) => {
    setActiveCategory(cat);
    setSearch('');
  };

  // Only split into "Near You" when we have a real GPS fix — never with default coords
  // Prioritize the absolute closest places, not just those within 2km
  const nearbyPlaces = locationUsed === 'user'
    ? places
        .filter(p => p.distance_km !== undefined && p.distance_km !== null)
        .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99))
        .slice(0, 5) // Show top 5 closest places
    : [];
  const popularPlaces = locationUsed === 'user'
    ? places.filter(p => !nearbyPlaces.includes(p))
    : places;

  return (
    <VStack align="stretch" spacing={6}>
      {showSearch && (
        <VStack align="stretch" spacing={4}>
          <form onSubmit={handleSearch}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray" />
              </InputLeftElement>
              <Input
                placeholder={simpleMode ? "Search places..." : "Search for cafés, restaurants, nightlife..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="2xl"
                fontSize="md"
              />
            </InputGroup>
          </form>

          {/* Category chips */}
          <Flex gap={2} overflowX="auto" pb={1}
            css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
            {CATEGORIES.map(cat => (
              <Button
                key={cat.value}
                size="sm"
                borderRadius="full"
                variant={activeCategory === cat.value ? 'solid' : 'outline'}
                colorScheme={activeCategory === cat.value ? 'brand' : 'gray'}
                onClick={() => handleCategoryClick(cat.value)}
                whiteSpace="nowrap"
                flexShrink={0}
                fontSize="sm"
              >
                {cat.emoji} {cat.label}
              </Button>
            ))}
          </Flex>
        </VStack>
      )}

      {loading ? (
        <Center py={12}>
          <VStack>
            <Spinner size="xl" color="brand.400" thickness="3px" />
            <Text color={mutedColor}>Finding places near you...</Text>
          </VStack>
        </Center>
      ) : places.length === 0 ? (
        <Center py={12}>
          <VStack spacing={3}>
            <Text fontSize="4xl">🔍</Text>
            <Text fontWeight="600" fontSize="lg">No places found</Text>
            <Text color={mutedColor} textAlign="center">Try a different search or category</Text>
            <Button colorScheme="brand" onClick={() => { setSearch(''); loadPlaces('all'); }}>
              Show all places
            </Button>
          </VStack>
        </Center>
      ) : (
        <VStack align="stretch" spacing={8}>
          {/* Near You section */}
          {nearbyPlaces.length > 0 && (
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Text fontSize="xl" fontWeight="800">📍 Near You</Text>
                <Badge colorScheme="brand" borderRadius="full">{nearbyPlaces.length}</Badge>
              </HStack>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                {nearbyPlaces.map(place => (
                  <PlaceCard key={place.id} place={place} onAskAI={onAskAI} simpleMode={simpleMode} />
                ))}
              </SimpleGrid>
            </VStack>
          )}

          {/* Popular in Kigali */}
          {popularPlaces.length > 0 && (
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Text fontSize="xl" fontWeight="800">⭐ Popular in Kigali</Text>
                <Badge colorScheme="orange" borderRadius="full">{popularPlaces.length}</Badge>
              </HStack>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                {popularPlaces.map(place => (
                  <PlaceCard key={place.id} place={place} onAskAI={onAskAI} simpleMode={simpleMode} />
                ))}
              </SimpleGrid>
            </VStack>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default PlacesGrid;
