import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Box, Image, Text, Badge, HStack, VStack, Button, Icon,
  Divider, useColorModeValue, SimpleGrid, Flex,
} from '@chakra-ui/react';
import { FaStar, FaMapMarkerAlt, FaWheelchair, FaShare } from 'react-icons/fa';
import { MdFamilyRestroom, MdAttachMoney, MdCategory } from 'react-icons/md';
import { Place } from '../../types';

interface PlaceDetailModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  onAskAI: (place: Place) => void;
}

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, isOpen, onClose, onAskAI }) => {
  const bg = useColorModeValue('white', '#1a2635');
  const textMuted = useColorModeValue('gray.600', 'gray.400');
  const tagBg = useColorModeValue('gray.100', 'whiteAlpha.100');

  if (!place) return null;

  const handleAskAI = () => {
    onClose();
    onAskAI(place);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
      <ModalContent bg={bg} borderRadius="2xl" mx={4} overflow="hidden">
        <ModalCloseButton zIndex={10} color="white" bg="blackAlpha.500" borderRadius="full" m={2} />

        {/* Hero Image */}
        <Box h="240px" overflow="hidden" position="relative">
          <Image
            src={place.image_url}
            alt={place.name}
            w="100%"
            h="100%"
            objectFit="cover"
            fallback={
              <Box w="100%" h="100%" bg="gray.700" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="5xl">🏙️</Text>
              </Box>
            }
          />
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            h="100px"
            bgGradient="linear(to-t, blackAlpha.800, transparent)"
          />
          <VStack position="absolute" bottom={4} left={6} align="start" spacing={1}>
            <Badge
              colorScheme="brand"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="sm"
              bg="brand.500"
              color="white"
            >
              {place.category.replace('-', ' ')}
            </Badge>
          </VStack>
          <HStack position="absolute" bottom={4} right={6} spacing={2}>
            <HStack bg="blackAlpha.700" borderRadius="full" px={3} py={1} spacing={1}>
              <Icon as={FaStar} color="yellow.400" />
              <Text color="white" fontWeight="700">{place.rating.toFixed(1)}</Text>
            </HStack>
          </HStack>
        </Box>

        <ModalBody p={6}>
          <VStack align="stretch" spacing={5}>
            {/* Name and Address */}
            <VStack align="start" spacing={2}>
              <Text fontSize="2xl" fontWeight="800" lineHeight="1.2">{place.name}</Text>
              <HStack color={textMuted} spacing={2}>
                <Icon as={FaMapMarkerAlt} color="brand.400" />
                <Text fontSize="sm">{place.address}</Text>
              </HStack>
              {place.distance_km !== undefined && (
                <Badge colorScheme="brand" variant="subtle" borderRadius="full" px={3}>
                  📍 {place.distance_km < 1 ? `${Math.round(place.distance_km * 1000)}m` : `${place.distance_km.toFixed(1)} km`} from you
                </Badge>
              )}
            </VStack>

            <Divider />

            {/* Description */}
            <Text fontSize="md" color={textMuted} lineHeight="1.7">{place.description}</Text>

            {/* Info Grid */}
            <SimpleGrid columns={2} spacing={3}>
              <Box bg={tagBg} borderRadius="xl" p={3}>
                <Text fontSize="xs" color={textMuted} mb={1}>Price Range</Text>
                <Text fontWeight="700" fontSize="lg">{place.price_range}</Text>
              </Box>
              <Box bg={tagBg} borderRadius="xl" p={3}>
                <Text fontSize="xs" color={textMuted} mb={1}>Rating</Text>
                <HStack>
                  <Icon as={FaStar} color="yellow.400" />
                  <Text fontWeight="700" fontSize="lg">{place.rating.toFixed(1)}</Text>
                </HStack>
              </Box>
            </SimpleGrid>

            {/* Accessibility Features */}
            <Box>
              <Text fontSize="sm" fontWeight="600" mb={2} color={textMuted}>Features</Text>
              <HStack spacing={2} flexWrap="wrap">
                {place.is_wheelchair_accessible && (
                  <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                    <HStack spacing={1}><Icon as={FaWheelchair} /><Text>Wheelchair Accessible</Text></HStack>
                  </Badge>
                )}
                {place.is_budget_friendly && (
                  <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                    <HStack spacing={1}><Icon as={MdAttachMoney} /><Text>Budget Friendly</Text></HStack>
                  </Badge>
                )}
                {place.is_family_friendly && (
                  <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                    <HStack spacing={1}><Icon as={MdFamilyRestroom} /><Text>Family Friendly</Text></HStack>
                  </Badge>
                )}
              </HStack>
            </Box>

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="600" mb={2} color={textMuted}>Tags</Text>
                <HStack spacing={2} flexWrap="wrap">
                  {place.tags.map((tag) => (
                    <Badge key={tag} variant="outline" colorScheme="brand" borderRadius="full" px={2}>
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            <Divider />

            {/* Action Buttons */}
            <Flex gap={3}>
              <Button
                colorScheme="brand"
                size="lg"
                flex={1}
                borderRadius="xl"
                onClick={handleAskAI}
                leftIcon={<Text>✨</Text>}
              >
                Ask AI About This
              </Button>
              <Button
                variant="outline"
                size="lg"
                borderRadius="xl"
                px={4}
                onClick={() => {
                  navigator.share?.({
                    title: place.name,
                    text: place.description,
                  }).catch(() => {});
                }}
              >
                <Icon as={FaShare} />
              </Button>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PlaceDetailModal;
