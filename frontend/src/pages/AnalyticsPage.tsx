import React, { useState, useEffect } from 'react';
import {
  Box, SimpleGrid, Text, VStack, HStack, useColorModeValue,
  Flex, Badge, Progress, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Tabs, TabList, TabPanels, Tab, TabPanel, Button, List, ListItem, ListIcon,
} from '@chakra-ui/react';
import { FiUsers, FiMapPin, FiMessageCircle, FiTrendingUp, FiCheck, FiClock } from 'react-icons/fi';

const USER_STATS = [
  { label: 'Places Explored', value: '24', change: '+3', up: true, icon: FiMapPin, color: 'green' },
  { label: 'AI Conversations', value: '47', change: '+12', up: true, icon: FiMessageCircle, color: 'purple' },
  { label: 'Dictionary Words Learned', value: '8', change: '+2', up: true, icon: FiTrendingUp, color: 'orange' },
  { label: 'Time Saved (hrs)', value: '5.2', change: '+1.8', up: true, icon: FiClock, color: 'blue' },
];

const RECENT_ACTIVITY = [
  { time: '2h ago', action: 'Asked AI about coffee spots in Kacyiru', type: 'chat' },
  { time: '1d ago', action: 'Explored Bourbon Coffee details', type: 'place' },
  { time: '2d ago', action: 'Learned "Muraho" in Dictionary', type: 'dictionary' },
  { time: '3d ago', action: 'Searched for restaurants near me', type: 'search' },
  { time: '4d ago', action: 'Viewed Inzora Rooftop location', type: 'place' },
];

const FAVORITE_PLACES = [
  { name: 'Bourbon Coffee', visits: 5, rating: 4.8 },
  { name: 'Heaven Restaurant', visits: 3, rating: 4.6 },
  { name: 'Inzora Rooftop', visits: 2, rating: 4.7 },
];

const LEARNED_WORDS = [
  { word: 'Muraho', english: 'Hello', learned: '2024-04-25' },
  { word: 'Murakoze', english: 'Thank you', learned: '2024-04-24' },
  { word: 'Amakuru?', english: 'How are you?', learned: '2024-04-23' },
];

const AnalyticsPage: React.FC = () => {
  const cardBg = useColorModeValue('white', '#1e2d40');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  return (
    <Box px={{ base: 4, md: 8 }} py={6} maxW="1200px" mx="auto">
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={0}>
            <Text fontSize="2xl" fontWeight="800">Your Analytics</Text>
            <Text color={mutedColor} fontSize="sm">Your Imboni activity and progress</Text>
          </VStack>
          <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
            🟢 Active User
          </Badge>
        </HStack>

        {/* Personal KPI Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          {USER_STATS.map(stat => (
            <Box key={stat.label} bg={cardBg} borderRadius="2xl" p={5}
              border="1px solid" borderColor={borderColor}>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <StatLabel fontSize="xs" color={mutedColor}>{stat.label}</StatLabel>
                  <Box color={`${stat.color}.400`}><stat.icon size={18} /></Box>
                </HStack>
                <StatNumber fontSize="2xl" fontWeight="800">{stat.value}</StatNumber>
                <StatHelpText mb={0}>
                  <StatArrow type={stat.up ? 'increase' : 'decrease'} />
                  {stat.change} this week
                </StatHelpText>
              </Stat>
            </Box>
          ))}
        </SimpleGrid>

        <Tabs colorScheme="brand" defaultIndex={0}>
          <TabList mb={6} gap={2}>
            <Tab borderRadius="lg" pb={2}>Activity</Tab>
            <Tab borderRadius="lg" pb={2}>Favorites</Tab>
            <Tab borderRadius="lg" pb={2}>Learning</Tab>
          </TabList>

          <TabPanels>
            {/* Activity Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Recent Activity */}
                <Box bg={cardBg} borderRadius="2xl" p={5} border="1px solid" borderColor={borderColor}>
                  <Text fontWeight="700" mb={4}>🕒 Recent Activity</Text>
                  <VStack align="stretch" spacing={3}>
                    {RECENT_ACTIVITY.map((item, i) => (
                      <HStack key={i} spacing={3} p={3} borderRadius="lg" bg={useColorModeValue('gray.50', 'whiteAlpha.100')}>
                        <Box w={2} h={2} borderRadius="full" flexShrink={0}
                          bg={item.type === 'chat' ? 'blue.400' : item.type === 'place' ? 'green.400' : item.type === 'dictionary' ? 'purple.400' : 'orange.400'} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="sm">{item.action}</Text>
                          <Text fontSize="xs" color={mutedColor}>{item.time}</Text>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                {/* Usage Summary */}
                <Box bg={cardBg} borderRadius="2xl" p={5} border="1px solid" borderColor={borderColor}>
                  <Text fontWeight="700" mb={4}>📊 Usage Summary</Text>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="600">Places viewed this week</Text>
                        <Text fontSize="sm" color={mutedColor}>12</Text>
                      </HStack>
                      <Progress value={60} size="sm" colorScheme="brand" borderRadius="full" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="600">AI chats this week</Text>
                        <Text fontSize="sm" color={mutedColor}>8</Text>
                      </HStack>
                      <Progress value={40} size="sm" colorScheme="purple" borderRadius="full" />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="600">Dictionary progress</Text>
                        <Text fontSize="sm" color={mutedColor}>8/50 words</Text>
                      </HStack>
                      <Progress value={16} size="sm" colorScheme="green" borderRadius="full" />
                    </Box>
                  </VStack>
                </Box>
              </SimpleGrid>
            </TabPanel>

            {/* Favorites Tab */}
            <TabPanel px={0}>
              <Box bg={cardBg} borderRadius="2xl" p={5} border="1px solid" borderColor={borderColor}>
                <Text fontWeight="700" mb={4}>❤️ Your Favorite Places</Text>
                <VStack align="stretch" spacing={3}>
                  {FAVORITE_PLACES.map((place, i) => (
                    <HStack key={place.name} justify="space-between" p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="600">{place.name}</Text>
                        <HStack spacing={1}>
                          <Text fontSize="xs" color={mutedColor}>{place.visits} visits</Text>
                          <Text fontSize="xs" color="yellow.500">★ {place.rating}</Text>
                        </HStack>
                      </VStack>
                      <Button size="sm" colorScheme="brand" variant="outline" borderRadius="lg">
                        View
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </TabPanel>

            {/* Learning Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Learned Words */}
                <Box bg={cardBg} borderRadius="2xl" p={5} border="1px solid" borderColor={borderColor}>
                  <Text fontWeight="700" mb={4}>📚 Words Learned</Text>
                  <VStack align="stretch" spacing={3}>
                    {LEARNED_WORDS.map((word, i) => (
                      <HStack key={word.word} justify="space-between" p={3} borderRadius="lg" bg={useColorModeValue('gray.50', 'whiteAlpha.100')}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="600">{word.word}</Text>
                          <Text fontSize="xs" color={mutedColor}>{word.english}</Text>
                        </VStack>
                        <Text fontSize="xs" color={mutedColor}>{word.learned}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                {/* Learning Goals */}
                <Box bg={cardBg} borderRadius="2xl" p={5} border="1px solid" borderColor={borderColor}>
                  <Text fontWeight="700" mb={4}>🎯 Learning Goals</Text>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="600">Basic greetings</Text>
                        <Text fontSize="sm" color="green.500">Completed</Text>
                      </HStack>
                      <List spacing={1}>
                        <ListItem fontSize="xs" color={mutedColor}>
                          <ListIcon as={FiCheck} color="green.400" />
                          Muraho (Hello)
                        </ListItem>
                        <ListItem fontSize="xs" color={mutedColor}>
                          <ListIcon as={FiCheck} color="green.400" />
                          Murakoze (Thank you)
                        </ListItem>
                      </List>
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="600">Food vocabulary</Text>
                        <Text fontSize="sm" color="orange.500">In Progress</Text>
                      </HStack>
                      <Text fontSize="xs" color={mutedColor}>Next: Learn "Ibiryo" (Food)</Text>
                    </Box>
                  </VStack>
                </Box>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default AnalyticsPage;
