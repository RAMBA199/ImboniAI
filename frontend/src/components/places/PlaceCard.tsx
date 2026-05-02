import React, { useState } from 'react';
import {
  Box, Image, Text, Badge, HStack, VStack, Button,
  useColorModeValue, Tooltip, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Flex,
} from '@chakra-ui/react';
import { FiMapPin, FiStar, FiMessageCircle, FiInfo, FiDollarSign, FiMap } from 'react-icons/fi';
import { Place } from '../../types';

function generateGoogleMapsUrl(place: Place): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(place.name)}+${encodeURIComponent(place.address)}&ll=${place.latitude},${place.longitude}&z=15`;
}

interface PlaceCardProps {
  place: Place;
  onAskAI: (place: Place) => void;
  simpleMode?: boolean;
}

const categoryColors: Record<string, string> = {
  cafe: 'orange', restaurant: 'green', nightlife: 'purple', outdoor: 'teal',
  market: 'yellow', landmark: 'blue', art: 'pink', entertainment: 'cyan',
  'street-food': 'red', education: 'linkedin',
};

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onAskAI, simpleMode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [imgError, setImgError] = useState(false);
  const cardBg = useColorModeValue('white', '#1e2d40');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const fallbackImg = `https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&auto=format`;

  return (
    <>
      <Box
        bg={cardBg} borderRadius="2xl" overflow="hidden"
        border="1px solid" borderColor={borderColor}
        transition="all 0.25s ease"
        _hover={{ transform: 'translateY(-4px)', shadow: 'xl', borderColor: 'brand.400' }}
        cursor="pointer" onClick={onOpen} h="100%" display="flex" flexDirection="column"
      >
        <Box position="relative" h="180px" flexShrink={0}>
          <Image src={imgError ? fallbackImg : place.image_url} alt={place.name}
            w="100%" h="100%" objectFit="cover" onError={() => setImgError(true)} />
          <Box position="absolute" top={0} left={0} right={0} bottom={0}
            bgGradient="linear(to-t, blackAlpha.600, transparent)" />
          <Badge position="absolute" top={3} left={3}
            colorScheme={categoryColors[place.category] || 'gray'}
            variant="solid" borderRadius="full" px={2} py={0.5} fontSize="xs" textTransform="capitalize">
            {place.category}
          </Badge>
          <Badge position="absolute" top={3} right={3} bg="blackAlpha.700" color="white"
            variant="solid" borderRadius="full" px={2} py={0.5} fontSize="xs">
            {place.price_range}
          </Badge>
          <HStack position="absolute" bottom={3} right={3} bg="blackAlpha.800"
            borderRadius="full" px={2} py={1} spacing={1}>
            <FiStar color="#f5a623" size={12} />
            <Text color="white" fontSize="xs" fontWeight="700">{place.rating}</Text>
          </HStack>
        </Box>

        <VStack align="stretch" p={4} spacing={2} flex={1}>
          <Text fontWeight="700" fontSize="md" noOfLines={1}>{place.name}</Text>
          <HStack spacing={1}>
            <Box color={mutedColor}><FiMapPin size={12} /></Box>
            <Text fontSize="xs" color={mutedColor} noOfLines={1}>{place.address}</Text>
          </HStack>
          {place.distance_km !== undefined && (
            <Text fontSize="xs" color="brand.400" fontWeight="600">
              📍 {place.distance_km} km away
            </Text>
          )}
          <Text fontSize="sm" color={mutedColor} noOfLines={2} lineHeight="1.5">
            {place.description}
          </Text>
          <HStack spacing={1} flexWrap="wrap" mt={1}>
            {place.is_wheelchair_accessible && (
              <Tooltip label="Wheelchair Accessible">
                <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2} fontSize="xs">
                  ♿ Accessible
                </Badge>
              </Tooltip>
            )}
            {place.is_budget_friendly && (
              <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2} fontSize="xs">
                💰 Budget
              </Badge>
            )}
            {place.is_family_friendly && (
              <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2} fontSize="xs">
                👨‍👩‍👧 Family
              </Badge>
            )}
          </HStack>
          {!simpleMode && place.tags?.length > 0 && (
            <HStack spacing={1} flexWrap="wrap">
              {place.tags.slice(0, 3).map(tag => (
                <Badge key={tag} colorScheme="gray" variant="outline" borderRadius="full" px={2} fontSize="xs">
                  {tag}
                </Badge>
              ))}
            </HStack>
          )}
          <HStack spacing={2} mt="auto" pt={2} flexDirection={{ base: 'column', sm: 'row' }}>
            <Tooltip label="Open in Google Maps">
              <Button size="sm" variant="outline" colorScheme="green" leftIcon={<FiMap size={14} />}
                borderRadius="xl" flex={1} fontSize="xs"
                as="a" href={generateGoogleMapsUrl(place)} target="_blank" rel="noreferrer"
                onClick={(e) => { e.stopPropagation(); }}>
                Maps
              </Button>
            </Tooltip>
            <Button size="sm" variant="outline" colorScheme="brand" leftIcon={<FiInfo size={14} />}
              borderRadius="xl" flex={1} fontSize="xs"
              onClick={(e) => { e.stopPropagation(); onOpen(); }}>
              {simpleMode ? 'See more' : 'Details'}
            </Button>
            <Button size="sm" colorScheme="brand" leftIcon={<FiMessageCircle size={14} />}
              borderRadius="xl" flex={1} fontSize="xs"
              onClick={(e) => { e.stopPropagation(); onAskAI(place); }}>
              Ask AI
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box position="relative" h="250px">
            <Image src={imgError ? fallbackImg : place.image_url} alt={place.name}
              w="100%" h="100%" objectFit="cover" onError={() => setImgError(true)} />
            <Box position="absolute" top={0} left={0} right={0} bottom={0}
              bgGradient="linear(to-t, blackAlpha.800, transparent)" />
            <ModalCloseButton color="white" top={4} right={4} bg="blackAlpha.600" borderRadius="full" />
          </Box>
          <ModalHeader pb={2}>
            <Text fontWeight="800" fontSize="xl">{place.name}</Text>
            <HStack mt={1}>
              <Badge colorScheme={categoryColors[place.category] || 'gray'} borderRadius="full" textTransform="capitalize">
                {place.category}
              </Badge>
              <HStack spacing={1}>
                <FiStar color="#f5a623" size={12} />
                <Text fontSize="sm" fontWeight="600">{place.rating}</Text>
              </HStack>
              <Text fontSize="sm" color="gray.500">{place.price_range}</Text>
            </HStack>
          </ModalHeader>
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={3}>
              <HStack>
                <FiMapPin />
                <Text fontSize="sm">{place.address}</Text>
                {place.distance_km && (
                  <Badge colorScheme="brand" borderRadius="full">{place.distance_km} km away</Badge>
                )}
              </HStack>
              <Text fontSize="sm" lineHeight="1.7">{place.description}</Text>
              <HStack spacing={2} flexWrap="wrap">
                {place.is_wheelchair_accessible && <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1}>♿ Wheelchair Accessible</Badge>}
                {place.is_budget_friendly && <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3} py={1}>💰 Budget Friendly</Badge>}
                {place.is_family_friendly && <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={3} py={1}>👨‍👩‍👧 Family Friendly</Badge>}
              </HStack>
              <Flex wrap="wrap" gap={2}>
                {place.tags?.map(tag => (
                  <Badge key={tag} colorScheme="gray" variant="outline" borderRadius="full" px={3} py={1} fontSize="xs">#{tag}</Badge>
                ))}
              </Flex>
              <Button colorScheme="brand" leftIcon={<FiMessageCircle />} borderRadius="xl"
                onClick={() => { onClose(); onAskAI(place); }}>
                Ask AI about this place
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PlaceCard;
