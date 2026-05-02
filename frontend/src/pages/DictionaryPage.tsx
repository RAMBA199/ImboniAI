import React, { useState, useMemo } from 'react';
import {
  Box, VStack, HStack, Text, Input, InputGroup, InputLeftElement,
  SimpleGrid, Badge, Button, useColorModeValue, Flex, Icon,
  Tabs, TabList, TabPanels, Tab, TabPanel, useToast,
} from '@chakra-ui/react';
import { FiSearch, FiVolume2 } from 'react-icons/fi';
import { t, Language } from '../utils/i18n';

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
  { kinyarwanda: 'Yego', english: 'Yes', pronunciation: 'Yeh-go', category: 'Greetings' },
  { kinyarwanda: 'Oya', english: 'No', pronunciation: 'Oh-yah', category: 'Greetings' },

  // Food & Drink
  { kinyarwanda: 'Ibiryo', english: 'Food', pronunciation: 'Ee-bee-ryo', category: 'Food & Drink' },
  { kinyarwanda: 'Amazi', english: 'Water', pronunciation: 'Ah-mah-zee', category: 'Food & Drink' },
  { kinyarwanda: 'Ikawa', english: 'Coffee', pronunciation: 'Ee-kah-wah', category: 'Food & Drink' },
  { kinyarwanda: 'Inyama', english: 'Meat', pronunciation: 'Ee-nyah-mah', category: 'Food & Drink' },
  { kinyarwanda: 'Imboga', english: 'Vegetables', pronunciation: 'Eem-boh-gah', category: 'Food & Drink' },
  { kinyarwanda: 'Isombe', english: 'Cassava leaves', pronunciation: 'Ee-sohm-beh', category: 'Food & Drink' },
  { kinyarwanda: 'Ubugari', english: 'Cassava bread', pronunciation: 'Oo-boo-gah-ree', category: 'Food & Drink' },
  { kinyarwanda: 'Umugati', english: 'Bread', pronunciation: 'Oo-moo-gah-tee', category: 'Food & Drink' },

  // Places
  { kinyarwanda: 'Aho', english: 'Where', pronunciation: 'Ah-ho', category: 'Places' },
  { kinyarwanda: 'Hano', english: 'Here', pronunciation: 'Hah-no', category: 'Places' },
  { kinyarwanda: 'Hari', english: 'There', pronunciation: 'Hah-ree', category: 'Places' },
  { kinyarwanda: 'Inzu', english: 'House', pronunciation: 'Een-zoo', category: 'Places' },
  { kinyarwanda: 'Isoko', english: 'Market', pronunciation: 'Ee-soh-ko', category: 'Places' },
  { kinyarwanda: 'Resitora', english: 'Restaurant', pronunciation: 'Reh-see-toh-rah', category: 'Places' },
  { kinyarwanda: 'Terefoni', english: 'Telephone', pronunciation: 'Teh-reh-foh-nee', category: 'Places' },

  // Numbers
  { kinyarwanda: 'Rimwe', english: 'One', pronunciation: 'Reem-weh', category: 'Numbers' },
  { kinyarwanda: 'Kabiri', english: 'Two', pronunciation: 'Kah-bee-ree', category: 'Numbers' },
  { kinyarwanda: 'Gatatu', english: 'Three', pronunciation: 'Gah-tah-too', category: 'Numbers' },
  { kinyarwanda: 'Kane', english: 'Four', pronunciation: 'Kah-neh', category: 'Numbers' },
  { kinyarwanda: 'Gatanu', english: 'Five', pronunciation: 'Gah-tah-noo', category: 'Numbers' },
  { kinyarwanda: 'Cumi', english: 'Ten', pronunciation: 'Koo-mee', category: 'Numbers' },

  // Common Phrases
  { kinyarwanda: 'Ni byiza', english: 'It is good', pronunciation: 'Nee bee-yee-zah', category: 'Common Phrases' },
  { kinyarwanda: 'Ndagenda', english: 'I am going', pronunciation: 'N-dah-gehn-dah', category: 'Common Phrases' },
  { kinyarwanda: 'Ngiye', english: 'I am coming', pronunciation: 'N-gee-yeh', category: 'Common Phrases' },
  { kinyarwanda: 'Ese', english: 'Please', pronunciation: 'Eh-seh', category: 'Common Phrases' },
  { kinyarwanda: 'Ndabizi', english: 'I know', pronunciation: 'N-dah-bee-zee', category: 'Common Phrases' },
  { kinyarwanda: 'Mbabarira', english: 'Excuse me / Sorry', pronunciation: 'Mbah-bah-ree-rah', category: 'Common Phrases' },
  { kinyarwanda: 'Ndashaka', english: 'I want', pronunciation: 'N-dah-shah-kah', category: 'Common Phrases' },

  // Travel & Shopping
  { kinyarwanda: 'Imodoka', english: 'Car', pronunciation: 'Ee-moh-doh-kah', category: 'Travel' },
  { kinyarwanda: 'Itike', english: 'Ticket', pronunciation: 'Ee-tee-keh', category: 'Travel' },
  { kinyarwanda: 'Amafaranga', english: 'Money', pronunciation: 'Ah-mah-fah-rahng-ah', category: 'Shopping' },
  { kinyarwanda: 'Igitabo', english: 'Book', pronunciation: 'Ee-gee-tah-boh', category: 'Shopping' },
  { kinyarwanda: 'Ubukode', english: 'Rent', pronunciation: 'Oo-boo-koh-deh', category: 'Travel' },

  // Emergency
  { kinyarwanda: 'Ubufasha', english: 'Help', pronunciation: 'Oo-boo-fah-shah', category: 'Emergency' },
  { kinyarwanda: 'Ubuzima', english: 'Health', pronunciation: 'Oo-bee-zoo-mah', category: 'Emergency' },
  { kinyarwanda: 'Polisi', english: 'Police', pronunciation: 'Poh-lee-see', category: 'Emergency' },
  { kinyarwanda: 'Ambulance', english: 'Ambulance', pronunciation: 'Ahm-boo-lahnce', category: 'Emergency' },
];

const CATEGORIES = ['All', ...Array.from(new Set(DICTIONARY_WORDS.map(w => w.category)))];

interface DictionaryPageProps {
  isPaid?: boolean;
  language?: Language;
}

const DictionaryPage: React.FC<DictionaryPageProps> = ({ isPaid = false, language = 'en' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [direction, setDirection] = useState<'rw-to-en' | 'en-to-rw'>('rw-to-en');
  const toast = useToast();

  const cardBg = useColorModeValue('white', '#1e2d40');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  const filteredWords = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return DICTIONARY_WORDS.filter(word => {
      const matchesSearch = search.length === 0
        ? true
        : word.kinyarwanda.toLowerCase().includes(search) || word.english.toLowerCase().includes(search);
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
        title: t('dictionaryHeader', language),
        description: `${word.kinyarwanda} (${word.pronunciation})`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box px={{ base: 4, md: 8 }} py={8} maxW="1400px" mx="auto">
      <VStack align="stretch" spacing={6}>
        <VStack align="start" spacing={2}>
          <HStack>
            <Text fontSize="2xl" fontWeight="800">{t('dictionaryHeader', language)}</Text>
            <Badge colorScheme="green" borderRadius="full">{t('dictionaryUnblockedLabel', language) || 'Unlocked'}</Badge>
          </HStack>
          <Text color={mutedColor}>
            {t('dictionarySubtitle', language)}
          </Text>
          {!isPaid && (
            <Box bg={useColorModeValue('blue.50', 'whiteAlpha.100')} p={4} borderRadius="2xl" border="1px solid" borderColor={useColorModeValue('blue.200', 'whiteAlpha.200')}
              w="100%">
              <Text fontSize="sm" color={useColorModeValue('blue.800', 'blue.100')}>
                {t('dictionaryTestingNotice', language)}
              </Text>
            </Box>
          )}
        </VStack>

        <HStack spacing={3} flexWrap="wrap">
          <InputGroup size="lg" flex={1} minW="250px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray" />
            </InputLeftElement>
            <Input
              placeholder={t('dictionarySearchPlaceholder', language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="2xl"
            />
          </InputGroup>
          <Button
            size="md"
            variant={direction === 'rw-to-en' ? 'solid' : 'outline'}
            colorScheme="brand"
            borderRadius="2xl"
            onClick={() => setDirection('rw-to-en')}
          >
            RW → EN
          </Button>
          <Button
            size="md"
            variant={direction === 'en-to-rw' ? 'solid' : 'outline'}
            colorScheme="brand"
            borderRadius="2xl"
            onClick={() => setDirection('en-to-rw')}
          >
            EN → RW
          </Button>
        </HStack>

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
                                {direction === 'rw-to-en' ? word.kinyarwanda : word.english}
                              </Text>
                              <Text fontSize="sm" color={mutedColor}>
                                {direction === 'rw-to-en' ? word.english : word.kinyarwanda}
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
                              {t('dictionaryPronounce', language)}: {word.pronunciation}
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
                    <Text color={mutedColor}>{t('dictionaryNoWords', language)}</Text>
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