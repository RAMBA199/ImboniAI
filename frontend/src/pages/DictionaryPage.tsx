import React, { useState, useMemo } from 'react';
import {
  Box, VStack, HStack, Text, Input, InputGroup, InputLeftElement,
  SimpleGrid, Badge, Button, useColorModeValue, Flex, Icon,
  Tabs, TabList, TabPanels, Tab, TabPanel, useToast,
} from '@chakra-ui/react';
import { FiSearch, FiVolume2 } from 'react-icons/fi';

interface DictionaryWord {
  kinyarwanda: string;
  english: string;
  pronunciation: string;
  category: string;
}

const DICTIONARY_WORDS: DictionaryWord[] = [
  // Greetings
  { kinyarwanda: 'Muraho', english: 'Hello', pronunciation: 'Moo-rah-ho', category: 'Greetings' },
  { kinyarwanda: 'Amakuru?', english: 'How are you?', pronunciation: 'Ah-mah-koo-roo', category: 'Greetings' },
  { kinyarwanda: 'Ni meza', english: 'I am fine', pronunciation: 'Nee meh-zah', category: 'Greetings' },
  { kinyarwanda: 'Murakoze', english: 'Thank you', pronunciation: 'Moo-rah-koh-zeh', category: 'Greetings' },
  { kinyarwanda: 'Irahire', english: 'Goodbye', pronunciation: 'Ee-rah-hee-reh', category: 'Greetings' },

  // Food & Drink
  { kinyarwanda: 'Ibiryo', english: 'Food', pronunciation: 'Ee-bee-ryo', category: 'Food & Drink' },
  { kinyarwanda: 'Amazi', english: 'Water', pronunciation: 'Ah-mah-zee', category: 'Food & Drink' },
  { kinyarwanda: 'Ikawa', english: 'Coffee', pronunciation: 'Ee-kah-wah', category: 'Food & Drink' },
  { kinyarwanda: 'Inyama', english: 'Meat', pronunciation: 'Ee-nyah-mah', category: 'Food & Drink' },
  { kinyarwanda: 'Imboga', english: 'Vegetables', pronunciation: 'Eem-boh-gah', category: 'Food & Drink' },
  { kinyarwanda: 'Isombe', english: 'Cassava leaves', pronunciation: 'Ee-sohm-beh', category: 'Food & Drink' },
  { kinyarwanda: 'Ubugari', english: 'Cassava bread', pronunciation: 'Oo-boo-gah-ree', category: 'Food & Drink' },

  // Places
  { kinyarwanda: 'Aho', english: 'Where', pronunciation: 'Ah-ho', category: 'Places' },
  { kinyarwanda: 'Hano', english: 'Here', pronunciation: 'Hah-no', category: 'Places' },
  { kinyarwanda: 'Hari', english: 'There', pronunciation: 'Hah-ree', category: 'Places' },
  { kinyarwanda: 'Inzu', english: 'House', pronunciation: 'Een-zoo', category: 'Places' },
  { kinyarwanda: 'Isoko', english: 'Market', pronunciation: 'Ee-soh-ko', category: 'Places' },
  { kinyarwanda: 'Resitora', english: 'Restaurant', pronunciation: 'Reh-see-toh-rah', category: 'Places' },

  // Numbers
  { kinyarwanda: 'Rimwe', english: 'One', pronunciation: 'Reem-weh', category: 'Numbers' },
  { kinyarwanda: 'Kabiri', english: 'Two', pronunciation: 'Kah-bee-ree', category: 'Numbers' },
  { kinyarwanda: 'Gatatu', english: 'Three', pronunciation: 'Gah-tah-too', category: 'Numbers' },
  { kinyarwanda: 'Kane', english: 'Four', pronunciation: 'Kah-neh', category: 'Numbers' },
  { kinyarwanda: 'Gatanu', english: 'Five', pronunciation: 'Gah-tah-noo', category: 'Numbers' },

  // Common Phrases
  { kinyarwanda: 'Ni byiza', english: 'It is good', pronunciation: 'Nee bee-yee-zah', category: 'Common Phrases' },
  { kinyarwanda: 'Ndagenda', english: 'I am going', pronunciation: 'N-dah-gehn-dah', category: 'Common Phrases' },
  { kinyarwanda: 'Ngiye', english: 'I am coming', pronunciation: 'N-gee-yeh', category: 'Common Phrases' },
  { kinyarwanda: 'Ese', english: 'Please', pronunciation: 'Eh-seh', category: 'Common Phrases' },
];

const CATEGORIES = ['All', ...Array.from(new Set(DICTIONARY_WORDS.map(w => w.category)))];

interface DictionaryPageProps {
  isPaid?: boolean;
}

const DictionaryPage: React.FC<DictionaryPageProps> = ({ isPaid = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const toast = useToast();

  const cardBg = useColorModeValue('white', '#1e2d40');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  const filteredWords = useMemo(() => {
    return DICTIONARY_WORDS.filter(word => {
      const matchesSearch = word.kinyarwanda.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           word.english.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || word.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const playPronunciation = (word: DictionaryWord) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${word.kinyarwanda}. Pronounced: ${word.pronunciation}`);
      utterance.lang = 'rw-RW'; // Kinyarwanda
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);

      toast({
        title: 'Pronouncing',
        description: `${word.kinyarwanda} (${word.pronunciation})`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  if (!isPaid) {
    return (
      <Box px={{ base: 4, md: 8 }} py={8} maxW="1200px" mx="auto">
        <VStack spacing={8} align="center" justify="center" minH="60vh">
          <Text fontSize="2xl" fontWeight="800">🇷🇼 Kinyarwanda Dictionary</Text>
          <Text color={mutedColor} textAlign="center" maxW="md">
            Unlock the Kinyarwanda Dictionary to learn pronunciation of common words used in Kigali restaurants and daily life.
          </Text>
          <Button colorScheme="brand" size="lg">
            Unlock for 500 RWF
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box px={{ base: 4, md: 8 }} py={8} maxW="1400px" mx="auto">
      <VStack align="stretch" spacing={6}>
        <VStack align="start" spacing={2}>
          <HStack>
            <Text fontSize="2xl" fontWeight="800">🇷🇼 Kinyarwanda Dictionary</Text>
            <Badge colorScheme="green" borderRadius="full">Unlocked</Badge>
          </HStack>
          <Text color={mutedColor}>
            Learn common Kinyarwanda words and phrases. Click the speaker icon to hear pronunciation!
          </Text>
        </VStack>

        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Search words in English or Kinyarwanda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="2xl"
          />
        </InputGroup>

        <Tabs variant="soft-rounded" colorScheme="brand" index={CATEGORIES.indexOf(selectedCategory)} onChange={(index) => setSelectedCategory(CATEGORIES[index])}>
          <TabList gap={2}>
            {CATEGORIES.map(category => (
              <Tab key={category} borderRadius="lg" pb={2}>
                {category}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {CATEGORIES.map(category => (
              <TabPanel key={category} px={0}>
                {filteredWords.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {filteredWords.map((word, index) => (
                      <Box
                        key={index}
                        bg={cardBg}
                        borderRadius="2xl"
                        p={4}
                        border="1px solid"
                        borderColor={borderColor}
                        shadow="sm"
                        transition="all 0.2s"
                        _hover={{ shadow: 'md' }}
                      >
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={0}>
                              <Text fontSize="lg" fontWeight="700" color="brand.500">
                                {word.kinyarwanda}
                              </Text>
                              <Text fontSize="sm" color={mutedColor}>
                                {word.english}
                              </Text>
                            </VStack>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="brand"
                              borderRadius="full"
                              onClick={() => playPronunciation(word)}
                              _hover={{ bg: 'brand.50' }}
                            >
                              <Icon as={FiVolume2} />
                            </Button>
                          </HStack>

                          <Box
                            bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
                            p={2}
                            borderRadius="lg"
                          >
                            <Text fontSize="xs" color={mutedColor} fontStyle="italic">
                              Pronunciation: {word.pronunciation}
                            </Text>
                          </Box>

                          <Badge
                            alignSelf="start"
                            colorScheme="purple"
                            variant="subtle"
                            borderRadius="full"
                            fontSize="xs"
                          >
                            {word.category}
                          </Badge>
                        </VStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color={mutedColor}>No words found matching your search.</Text>
                  </Box>
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>

        <Box
          bg={useColorModeValue('blue.50', 'rgba(59, 130, 246, 0.1)')}
          borderRadius="2xl"
          p={4}
          textAlign="center"
        >
          <Text fontSize="sm" color={mutedColor}>
            💡 Click the speaker icon to hear pronunciation. Learn phrases to connect better with locals!
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default DictionaryPage;