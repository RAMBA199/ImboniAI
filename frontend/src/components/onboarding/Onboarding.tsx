import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalBody,
  VStack, HStack, Text, Button, Box, SimpleGrid,
  useColorModeValue, Badge, Progress,
} from '@chakra-ui/react';
import { UserPreferences } from '../../types';

interface OnboardingProps {
  isOpen: boolean;
  onComplete: (prefs: UserPreferences) => void;
  onStartChat: () => void;
  onStartVoice: () => void;
}

const INTERESTS = [
  { id: 'food', label: 'Food & Dining', emoji: '🍽️' },
  { id: 'coffee', label: 'Coffee & Cafés', emoji: '☕' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🎉' },
  { id: 'relaxation', label: 'Relaxation', emoji: '🌿' },
  { id: 'culture', label: 'Culture & Arts', emoji: '🎨' },
  { id: 'outdoor', label: 'Outdoors', emoji: '🌳' },
  { id: 'budget', label: 'Budget Friendly', emoji: '💰' },
  { id: 'family', label: 'Family Outings', emoji: '👨‍👩‍👧' },
];

const STEPS = 5;

const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onComplete, onStartChat, onStartVoice }) => {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [language, setLanguage] = useState<'en' | 'rw'>('en');
  const [simpleMode, setSimpleMode] = useState(false);

  const bg = useColorModeValue('white', '#1a2635');
  const cardBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const selectedBg = useColorModeValue('brand.50', 'brand.900');

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    onComplete({
      interests: selectedInterests,
      language,
      simpleMode,
    });
  };

  const handleSkip = () => {
    onComplete({ interests: [], language: 'en', simpleMode: false });
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} size="lg" isCentered closeOnOverlayClick={false}>
      <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.700" />
      <ModalContent borderRadius="3xl" bg={bg} overflow="hidden" mx={4}>
        {/* Progress bar */}
        <Progress value={(step / STEPS) * 100} colorScheme="brand" size="xs" />

        <ModalBody p={8}>
          <VStack spacing={6} align="stretch">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <VStack spacing={5} textAlign="center">
                <Text fontSize="5xl">🇷🇼</Text>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" lineHeight="1.2">
                    Welcome to Imboni
                  </Text>
                  <Text color="gray.500" fontSize="md">
                    Your AI-powered guide to discovering amazing places in Kigali
                  </Text>
                </VStack>

                <SimpleGrid columns={2} spacing={3} w="100%">
                  {[
                    { emoji: '🗣️', text: 'Ask in English or Kinyarwanda' },
                    { emoji: '🎤', text: 'Use voice or text' },
                    { emoji: '📍', text: 'Find places near you' },
                    { emoji: '⭐', text: 'Personalized for you' },
                  ].map(item => (
                    <Box key={item.text} bg={cardBg} borderRadius="xl" p={3} textAlign="center">
                      <Text fontSize="xl">{item.emoji}</Text>
                      <Text fontSize="xs" mt={1} fontWeight="500">{item.text}</Text>
                    </Box>
                  ))}
                </SimpleGrid>

                <Box bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="xl" p={4} w="100%">
                  <Text fontSize="sm" fontWeight="600" textAlign="center">
                    💡 You can search, speak, or explore places nearby
                  </Text>
                </Box>

                <Button colorScheme="brand" size="lg" w="100%" borderRadius="xl"
                  onClick={() => setStep(2)} fontWeight="700">
                  Get Started →
                </Button>
                <Button variant="link" size="sm" color="gray.500" onClick={handleSkip}>
                  Skip setup
                </Button>
              </VStack>
            )}

            {/* Step 2: Interests */}
            {step === 2 && (
              <VStack spacing={5} align="stretch">
                <VStack spacing={1}>
                  <Text fontSize="xl" fontWeight="800">What interests you?</Text>
                  <Text color="gray.500" fontSize="sm">Select all that apply — we'll personalize your experience</Text>
                </VStack>

                <SimpleGrid columns={2} spacing={3}>
                  {INTERESTS.map(interest => (
                    <Box
                      key={interest.id}
                      bg={selectedInterests.includes(interest.id) ? selectedBg : cardBg}
                      border="2px solid"
                      borderColor={selectedInterests.includes(interest.id) ? 'brand.400' : 'transparent'}
                      borderRadius="xl"
                      p={3}
                      cursor="pointer"
                      onClick={() => toggleInterest(interest.id)}
                      transition="all 0.2s"
                      _hover={{ borderColor: 'brand.400' }}
                    >
                      <HStack>
                        <Text fontSize="xl">{interest.emoji}</Text>
                        <Text fontSize="sm" fontWeight="600">{interest.label}</Text>
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>

                <HStack>
                  <Button flex={1} variant="outline" borderRadius="xl" onClick={() => setStep(1)}>Back</Button>
                  <Button flex={2} colorScheme="brand" borderRadius="xl" onClick={() => setStep(3)}>
                    Continue →
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* Step 3: Language & Accessibility */}
            {step === 3 && (
              <VStack spacing={5} align="stretch">
                <VStack spacing={1}>
                  <Text fontSize="xl" fontWeight="800">Language & Accessibility</Text>
                  <Text color="gray.500" fontSize="sm">Customize your experience</Text>
                </VStack>

                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="600" fontSize="sm">Language</Text>
                  <HStack spacing={3}>
                    <Box flex={1} bg={language === 'en' ? selectedBg : cardBg}
                      border="2px solid" borderColor={language === 'en' ? 'brand.400' : 'transparent'}
                      borderRadius="xl" p={4} cursor="pointer" onClick={() => setLanguage('en')}
                      textAlign="center" transition="all 0.2s">
                      <Text fontSize="xl">🇬🇧 EN</Text>
                      <Text fontWeight="600" fontSize="sm">English</Text>
                    </Box>
                    <Box flex={1} bg={language === 'rw' ? selectedBg : cardBg}
                      border="2px solid" borderColor={language === 'rw' ? 'brand.400' : 'transparent'}
                      borderRadius="xl" p={4} cursor="pointer" onClick={() => setLanguage('rw')}
                      textAlign="center" transition="all 0.2s" position="relative">
                      <Text fontSize="xl">🇷🇼 RW</Text>
                      <Text fontWeight="600" fontSize="sm">Kinyarwanda</Text>
                      <Badge colorScheme="purple" fontSize="9px" position="absolute" top={1} right={1} borderRadius="full">
                        Experimental
                      </Badge>
                    </Box>
                  </HStack>
                </VStack>

                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="600" fontSize="sm">Display Mode</Text>
                  <HStack spacing={3}>
                    <Box flex={1} bg={!simpleMode ? selectedBg : cardBg}
                      border="2px solid" borderColor={!simpleMode ? 'brand.400' : 'transparent'}
                      borderRadius="xl" p={4} cursor="pointer" onClick={() => setSimpleMode(false)}
                      transition="all 0.2s">
                      <Text fontWeight="600" fontSize="sm">📱 Standard</Text>
                      <Text fontSize="xs" color="gray.500" mt={1}>Full features and details</Text>
                    </Box>
                    <Box flex={1} bg={simpleMode ? selectedBg : cardBg}
                      border="2px solid" borderColor={simpleMode ? 'brand.400' : 'transparent'}
                      borderRadius="xl" p={4} cursor="pointer" onClick={() => setSimpleMode(true)}
                      transition="all 0.2s">
                      <Text fontWeight="600" fontSize="sm">✨ Simple Mode</Text>
                      <Text fontSize="xs" color="gray.500" mt={1}>Larger text, easy navigation</Text>
                    </Box>
                  </HStack>
                </VStack>

                <HStack>
                  <Button flex={1} variant="outline" borderRadius="xl" onClick={() => setStep(2)}>Back</Button>
                  <Button flex={2} colorScheme="brand" borderRadius="xl" fontWeight="700" onClick={() => setStep(4)}>
                    Continue to Tutorial →
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* Step 4: Tutorial cards */}
            {step === 4 && (
              <VStack spacing={5} align="stretch">
                <VStack spacing={1}>
                  <Text fontSize="xl" fontWeight="800">Quick tour</Text>
                  <Text color="gray.500" fontSize="sm">See the main app sections before you start.</Text>
                </VStack>

                <SimpleGrid columns={1} spacing={3}>
                  {[
                    { title: 'Explore Places', description: 'Browse curated spots and tap any card to learn more.', emoji: '📍' },
                    { title: 'Chat with AI', description: 'Ask questions, get recommendations, and plan your trip.', emoji: '💬' },
                    { title: 'Voice Input', description: 'Speak naturally and let the app understand your needs.', emoji: '🎙️' },
                  ].map(card => (
                    <Box key={card.title} bg={cardBg} borderRadius="2xl" p={4}>
                      <HStack spacing={3} align="start">
                        <Text fontSize="2xl">{card.emoji}</Text>
                        <Box>
                          <Text fontWeight="700">{card.title}</Text>
                          <Text fontSize="sm" color="gray.500" mt={1}>{card.description}</Text>
                        </Box>
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>

                <HStack>
                  <Button flex={1} variant="outline" borderRadius="xl" onClick={() => setStep(3)}>Back</Button>
                  <Button flex={2} colorScheme="brand" borderRadius="xl" fontWeight="700" onClick={() => setStep(5)}>
                    Continue to AI Prompt →
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* Step 5: First AI prompt */}
            {step === 5 && (
              <VStack spacing={5} align="stretch">
                <VStack spacing={1}>
                  <Text fontSize="xl" fontWeight="800">Ready to try AI?</Text>
                  <Text color="gray.500" fontSize="sm">Start with chat or voice and let AI generate your first personalized suggestion.</Text>
                </VStack>

                <VStack spacing={3} align="stretch">
                  <Button colorScheme="brand" size="lg" borderRadius="2xl" onClick={() => {
                    handleComplete();
                    onStartChat();
                  }}>
                    Chat with AI
                  </Button>
                  <Button variant="outline" size="lg" borderRadius="2xl" onClick={() => {
                    handleComplete();
                    onStartVoice();
                  }}>
                    Try voice AI
                  </Button>
                  <Button variant="ghost" size="md" onClick={handleComplete}>
                    Finish setup later
                  </Button>
                </VStack>

                <Button variant="link" color="gray.500" onClick={() => setStep(4)}>
                  Back to tutorial
                </Button>
              </VStack>
            )}

            {/* Step indicator */}
            <HStack justify="center" spacing={2}>
              {[1, 2, 3, 4, 5].map(s => (
                <Box key={s} w={s === step ? 6 : 2} h={2} borderRadius="full"
                  bg={s <= step ? 'brand.400' : 'gray.300'}
                  transition="all 0.3s" />
              ))}
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Onboarding;
