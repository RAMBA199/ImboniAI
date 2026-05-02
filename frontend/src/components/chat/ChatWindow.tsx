import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, VStack, HStack, Input, IconButton, Text, Flex,
  Avatar, Spinner, useColorModeValue, Badge, Button,
  useToast, InputGroup, InputRightElement, Tooltip, SimpleGrid,
  Image,
} from '@chakra-ui/react';
import { FiSend, FiMic, FiMessageCircle } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, Place, UserPreferences, LocationLink } from '../../types';
import { sendChatMessage } from '../../utils/api';
import LocationLinkCard from './LocationLinkCard';

interface ChatWindowProps {
  preferences: UserPreferences;
  onAskAI: (place: Place) => void;
  initialMessage?: string;
  onVoiceClick: () => void;
}

const SUGGESTIONS = [
  { label: '🍽️ Places to eat', query: 'Where can I eat good food in Kigali?' },
  { label: '☕ Coffee spots', query: 'Show me the best coffee spots in Kigali' },
  { label: '🌳 Relaxing places', query: 'Where can I relax and unwind in Kigali?' },
  { label: '🎉 Nightlife', query: 'What are the best nightlife spots in Kigali?' },
  { label: '💰 Budget friendly', query: 'Show me budget-friendly places in Kigali' },
  { label: '♿ Accessible', query: 'Which places in Kigali are wheelchair accessible?' },
];

const ChatWindow: React.FC<ChatWindowProps> = ({
  preferences, onAskAI, initialMessage, onVoiceClick
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: preferences.simpleMode
        ? 'Hello! I can help you find places in Kigali. What are you looking for?'
        : "Hello! I'm Imboni, your AI guide to Kigali 🇷🇼 RW. Ask me anything — from the best coffee spots to hidden gems, nightlife, local food, or accessible places. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const locationRef = useRef<{ lat: number; lon: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Acquire and continuously watch location for accurate "near me" queries
  useEffect(() => {
    if (!navigator.geolocation) return;

    // Get an immediate fresh fix (maximumAge: 0 forces a new reading, busts VPN cache)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        locationRef.current = loc;
        setUserLocation(loc);
      },
      () => { /* silently fall back to no location */ },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Keep it fresh during the session
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        locationRef.current = loc;
        setUserLocation(loc);
      },
      () => { /* silent */ },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const bgColor = useColorModeValue('gray.50', '#0f1923');
  const userBubbleBg = 'brand.500';
  const aiBubbleBg = useColorModeValue('white', '#1e2d40');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
      inputRef.current?.focus();
    }
  }, [initialMessage]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: text.trim(),
        session_id: sessionId,
        language: preferences.language,
        user_preferences: preferences.interests,
        simple_mode: preferences.simpleMode,
        user_lat: locationRef.current?.lat,
        user_lon: locationRef.current?.lon,
      });

      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
        places: response.places,
        locationLinks: response.locationLinks,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show warning if AI service had issues
      if (response.warning) {
        toast({
          title: 'AI Service Warning',
          description: 'Using fallback responses. Some features may be limited.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "I'm having trouble connecting right now. Please try again.";
      
      toast({
        title: 'AI Error',
        description: 'Could not get AI response. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });

      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, sessionId, preferences, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (query: string) => {
    sendMessage(query);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageContent = (content: string, places: Place[] = []) => {
    if (!places.length) return content;

    let formattedContent = content;
    places.forEach(place => {
      const placeNameRegex = new RegExp(`\\b${place.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      formattedContent = formattedContent.replace(placeNameRegex, (match) => {
        const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(place.name)}+${encodeURIComponent(place.address)}&ll=${place.latitude},${place.longitude}&z=15`;
        return `<a href="${mapsUrl}" target="_blank" style="color: #3182ce; text-decoration: underline;">${match}</a>`;
      });
    });
    return formattedContent;
  };

  return (
    <Flex direction="column" h="100%" bg={bgColor} borderRadius="2xl" overflow="hidden">
      {/* Chat Header */}
      <HStack p={4} borderBottom="1px solid" borderColor={borderColor}
        bg={useColorModeValue('white', '#1e2d40')} spacing={3}>
        <Avatar size="sm" bg="brand.500" icon={<FiMessageCircle size={16} />} />
        <VStack align="start" spacing={0} flex={1}>
          <Text fontWeight="700" fontSize="sm">Imboni AI</Text>
          <HStack spacing={1}>
            <Box w={2} h={2} bg="green.400" borderRadius="full" />
            <Text fontSize="xs" color="gray.500">
              {userLocation ? `📍 Location active · Kigali Expert` : 'Online · Kigali Expert'}
            </Text>
          </HStack>
        </VStack>
        {preferences.language === 'rw' && (
          <Badge colorScheme="purple" variant="subtle" borderRadius="full" fontSize="xs">
            🇷🇼 Kinyarwanda
          </Badge>
        )}
      </HStack>

      {/* Messages */}
      <Box flex={1} overflowY="auto" p={4}>
        <VStack align="stretch" spacing={4}>
          {messages.map((msg) => (
            <Box key={msg.id} className="message-enter">
              <Flex
                justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                align="flex-end"
                gap={2}
              >
                {msg.role === 'assistant' && (
                  <Avatar size="xs" bg="brand.500" icon={<FiMessageCircle size={10} />} flexShrink={0} />
                )}
                <VStack align={msg.role === 'user' ? 'flex-end' : 'flex-start'} spacing={1} maxW="80%">
                  <Box
                    bg={msg.role === 'user' ? userBubbleBg : aiBubbleBg}
                    color={msg.role === 'user' ? 'white' : 'inherit'}
                    borderRadius={msg.role === 'user' ? '2xl 2xl 4px 2xl' : '2xl 2xl 2xl 4px'}
                    px={4} py={3}
                    border="1px solid"
                    borderColor={msg.role === 'user' ? 'transparent' : borderColor}
                    shadow="sm"
                  >
                    <Text fontSize="sm" lineHeight="1.6" whiteSpace="pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content, msg.places) }} />
                  </Box>
                  <Text fontSize="xs" color="gray.500">{formatTime(msg.timestamp)}</Text>

                  {/* Related places */}
                  {msg.places && msg.places.length > 0 && (
                    <Box w="100%" maxW="420px" mt={2}>
                      <Text fontSize="xs" color="gray.500" mb={2} fontWeight="600">
                        📍 Recommended places with preview images:
                      </Text>
                      <VStack align="stretch" spacing={3}>
                        {msg.places.slice(0, 3).map(place => (
                          <HStack
                            key={place.id}
                            bg={aiBubbleBg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="2xl"
                            overflow="hidden"
                            spacing={0}
                          >
                            <Image
                              src={place.image_url}
                              alt={place.name}
                              boxSize="80px"
                              objectFit="cover"
                              flexShrink={0}
                            />
                            <Box flex={1} p={3}>
                              <Text fontWeight="700" fontSize="sm" noOfLines={1}>{place.name}</Text>
                              <Text fontSize="xs" color="gray.500" noOfLines={2}>{place.address}</Text>
                              {place.distance_km && (
                                <Text fontSize="xs" color="brand.400" mt={1}>{place.distance_km} km away</Text>
                              )}
                              <Button
                                size="xs"
                                colorScheme="brand"
                                variant="outline"
                                borderRadius="lg"
                                mt={2}
                                onClick={() => onAskAI(place)}
                              >
                                Ask AI
                              </Button>
                            </Box>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Navigation Links */}
                  {msg.locationLinks && msg.locationLinks.length > 0 && (
                    <Box w="100%" maxW="420px" mt={3}>
                      <Text fontSize="xs" color="gray.500" mb={2} fontWeight="600">
                        🗺️ Navigate to locations:
                      </Text>
                      <SimpleGrid columns={msg.locationLinks.length === 1 ? 1 : 2} spacing={2}>
                        {msg.locationLinks.map(link => (
                          <LocationLinkCard key={link.placeId} link={link} />
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                </VStack>
              </Flex>
            </Box>
          ))}

          {/* Loading */}
          {loading && (
            <Flex align="flex-end" gap={2}>
              <Avatar size="xs" bg="brand.500" icon={<FiMessageCircle size={10} />} />
              <Box bg={aiBubbleBg} borderRadius="2xl 2xl 2xl 4px" px={4} py={3}
                border="1px solid" borderColor={borderColor}>
                <HStack spacing={1}>
                  <Box as="span" w={2} h={2} bg="gray.400" borderRadius="full"
                    sx={{ animation: 'bounce 1s infinite', animationDelay: '0ms' }} />
                  <Box as="span" w={2} h={2} bg="gray.400" borderRadius="full"
                    sx={{ animation: 'bounce 1s infinite', animationDelay: '200ms' }} />
                  <Box as="span" w={2} h={2} bg="gray.400" borderRadius="full"
                    sx={{ animation: 'bounce 1s infinite', animationDelay: '400ms' }} />
                </HStack>
              </Box>
            </Flex>
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Suggestion chips */}
      {messages.length <= 1 && (
        <Box px={4} py={2} borderTop="1px solid" borderColor={borderColor}>
          <Text fontSize="xs" color="gray.500" mb={2} fontWeight="600">Try asking:</Text>
          <Flex gap={2} flexWrap="wrap">
            {SUGGESTIONS.map(s => (
              <Button key={s.label} size="xs" variant="outline" colorScheme="brand"
                borderRadius="full" onClick={() => handleSuggestion(s.query)}
                fontSize="xs" whiteSpace="nowrap">
                {s.label}
              </Button>
            ))}
          </Flex>
        </Box>
      )}

      {/* Input */}
      <Box p={4} borderTop="1px solid" borderColor={borderColor}
        bg={useColorModeValue('white', '#1e2d40')}>
        <form onSubmit={handleSubmit}>
          <HStack spacing={2}>
            <Tooltip label="Voice input (simulated)">
              <IconButton
                aria-label="Voice"
                icon={<FiMic />}
                variant="ghost"
                colorScheme="brand"
                borderRadius="xl"
                onClick={onVoiceClick}
              />
            </Tooltip>
            <InputGroup flex={1}>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={preferences.simpleMode ? "Ask something..." : "Ask about places in Kigali..."}
                borderRadius="2xl"
                fontSize="sm"
                pr={12}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
            </InputGroup>
            <IconButton
              aria-label="Send"
              icon={loading ? <Spinner size="sm" /> : <FiSend />}
              colorScheme="brand"
              borderRadius="xl"
              type="submit"
              isDisabled={!input.trim() || loading}
            />
          </HStack>
        </form>
      </Box>
    </Flex>
  );
};

export default ChatWindow;
