import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, Button, Image, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure,
  useColorModeValue, Badge, Flex, Icon,
} from '@chakra-ui/react';
import { FiMapPin, FiLock, FiExternalLink } from 'react-icons/fi';
import { LocationLink } from '../../types';

interface LocationLinkCardProps {
  link: LocationLink;
}

const LocationLinkCard: React.FC<LocationLinkCardProps> = ({ link }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isPaid, setIsPaid] = useState(false);
  const cardBg = useColorModeValue('white', '#1e2d40');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const handleUnlock = () => {
    // Mock payment - in real app, this would integrate with payment provider
    setIsPaid(true);
    setTimeout(() => {
      window.open(link.mapsUrl, '_blank');
    }, 500);
  };

  const handleFreeAccess = () => {
    window.open(link.mapsUrl, '_blank');
  };

  return (
    <>
      <Box
        bg={cardBg}
        borderRadius="xl"
        overflow="hidden"
        border="1px solid"
        borderColor={borderColor}
        shadow="sm"
        transition="all 0.2s"
        _hover={{ shadow: 'md' }}
      >
        {/* Image with overlay */}
        <Box position="relative" h="180px" overflow="hidden">
          <Image
            src={link.image_url}
            alt={link.placeName}
            w="100%"
            h="100%"
            objectFit="cover"
          />
          {!isPaid && link.requiresPayment && (
            <Flex
              position="absolute"
              inset={0}
              bg="blackAlpha.600"
              align="center"
              justify="center"
              backdropFilter="blur(2px)"
            >
              <VStack spacing={2} textAlign="center">
                <Icon as={FiLock} boxSize={8} color="white" />
                <Text color="white" fontSize="sm" fontWeight="600">
                  Navigate Link Locked
                </Text>
              </VStack>
            </Flex>
          )}
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme="brand"
            borderRadius="lg"
            px={2}
            py={1}
          >
            🗺️ Navigate
          </Badge>
        </Box>

        {/* Content */}
        <VStack align="stretch" p={3} spacing={2}>
          <VStack align="start" spacing={0}>
            <Text fontWeight="700" fontSize="sm" noOfLines={1}>
              {link.placeName}
            </Text>
            <HStack spacing={1} color={mutedColor} fontSize="xs">
              <Icon as={FiMapPin} boxSize={3} />
              <Text noOfLines={1}>{link.address}</Text>
            </HStack>
          </VStack>

          {/* Action Button */}
          {isPaid ? (
            <Button
              size="sm"
              colorScheme="green"
              w="100%"
              leftIcon={<FiExternalLink />}
              onClick={handleFreeAccess}
              borderRadius="lg"
            >
              Open in Maps
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                colorScheme="brand"
                w="100%"
                leftIcon={<FiLock />}
                onClick={onOpen}
                borderRadius="lg"
              >
                Unlock (500 RWF)
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="brand"
                w="100%"
                onClick={handleFreeAccess}
                borderRadius="lg"
                fontSize="xs"
              >
                Preview Location
              </Button>
            </>
          )}
        </VStack>
      </Box>

      {/* Payment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Unlock Navigate Link</ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box
                w="100%"
                h="120px"
                borderRadius="lg"
                overflow="hidden"
              >
                <Image
                  src={link.image_url}
                  alt={link.placeName}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              </Box>

              <VStack align="start" textAlign="start" w="100%">
                <Text fontWeight="700" fontSize="md">
                  {link.placeName}
                </Text>
                <HStack spacing={1} color={mutedColor}>
                  <Icon as={FiMapPin} />
                  <Text fontSize="sm">{link.address}</Text>
                </HStack>
              </VStack>

              <Box
                w="100%"
                bg={useColorModeValue('gray.50', '#0f1923')}
                p={3}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
              >
                <HStack justify="space-between">
                  <Text fontSize="sm" color={mutedColor}>
                    Unlock Fee:
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {link.price_rwf ?? 2000} RWF
                  </Text>
                </HStack>
                {link.payment_note && (
                  <Text fontSize="xs" color={mutedColor} mt={2}>
                    {link.payment_note}
                  </Text>
                )}
              </Box>

              <Text fontSize="xs" color={mutedColor} textAlign="center">
                This is a demo interface. Navigation opens directly, and the bike rider fee is only shown as a placeholder.
              </Text>

              <HStack w="100%" spacing={2}>
                <Button
                  variant="outline"
                  flex={1}
                  borderRadius="lg"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="brand"
                  flex={1}
                  borderRadius="lg"
                  onClick={handleUnlock}
                >
                  Pay & Unlock
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LocationLinkCard;
