import React, { useState } from 'react';
import { registerBusiness } from '../utils/api';
import {
  Box, VStack, HStack, Text, Button, SimpleGrid, Badge, List, ListItem,
  ListIcon, useColorModeValue, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Divider,
  Image, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, Flex,
  FormControl, FormLabel, Input, Select, Textarea, useToast,
} from '@chakra-ui/react';
import { FiCheck, FiZap, FiMapPin, FiTrendingUp, FiUsers } from 'react-icons/fi';

interface PricingPageProps {
  onBusinessRegistered?: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBusinessRegistered }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [businessFeel, setBusinessFeel] = useState('Friendly, authentic, and welcoming');
  const [menus, setMenus] = useState('Example menu highlights or signature dishes');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const toast = useToast();
  const cardBg = useColorModeValue('white', '#1e2d40');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const accentBg = useColorModeValue('brand.50', 'rgba(59, 130, 246, 0.1)');

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    setRegistrationSuccess(false);
    onOpen();
  };

  const handleSubmitRegistration = async () => {
    if (!businessName || !address || !businessFeel || !menus || !businessType) {
      toast({
        title: 'Incomplete form',
        description: 'Please complete every business field before submitting.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await registerBusiness({
        name: businessName,
        address,
        businessType,
        businessFeel,
        menus,
        plan: selectedPlan || 'Starter',
      });

      setRegistrationSuccess(true);
      onBusinessRegistered?.();
      toast({
        title: 'Business registered',
        description: 'Your business registration is submitted and ready to be featured.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error?.response?.data?.error || error?.message || 'Unable to register your business.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 4, md: 8 }} py={8} maxW="1200px" mx="auto">
      <VStack spacing={10}>
        {/* Header */}
        <VStack spacing={3} textAlign="center">
          <Text fontSize="3xl" fontWeight="800">Simple, Transparent Pricing</Text>
          <Text color={mutedColor} fontSize="lg">
            Free for users. Affordable for businesses.
          </Text>
        </VStack>

        {/* Tabs Section */}
        <Tabs w="100%" colorScheme="brand" defaultIndex={0}>
          <TabList mb={6} gap={2}>
            <Tab borderRadius="lg" pb={2}>
              <Icon as={FiUsers} mr={2} />
              Users
            </Tab>
            <Tab borderRadius="lg" pb={2}>
              <Icon as={FiTrendingUp} mr={2} />
              Businesses
            </Tab>
          </TabList>

          <TabPanels>
            {/* USER PRICING */}
            <TabPanel>
              <VStack spacing={6}>
                <VStack spacing={2} textAlign="center" w="100%">
                  <Text fontSize="2xl" fontWeight="700">
                    Explore Kigali for Free
                  </Text>
                  <Text color={mutedColor}>
                    Discover places, get AI recommendations, and navigate with ease.
                  </Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
                  {/* Free Plan */}
                  <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={6}
                    border="2px solid"
                    borderColor="brand.400"
                    position="relative"
                  >
                    <Badge
                      colorScheme="brand"
                      position="absolute"
                      top={-3}
                      left="50%"
                      transform="translateX(-50%)"
                      borderRadius="full"
                      px={4}
                      py={1}
                      fontSize="xs"
                    >
                      ⭐ Most Users
                    </Badge>
                    <VStack align="stretch" spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="800" fontSize="lg">Forever Free</Text>
                        <Text color={mutedColor} fontSize="sm">
                          Everything you need to explore Kigali
                        </Text>
                      </VStack>
                      <HStack align="baseline">
                        <Text fontSize="3xl" fontWeight="800">0</Text>
                        <Text fontSize="sm" color={mutedColor}>RWF/month</Text>
                      </HStack>
                      <List spacing={2}>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Unlimited AI chat messages
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Browse all places in Kigali
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Advanced search & filters
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Save favorite places
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Personalized recommendations
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Kinyarwanda & English support
                        </ListItem>
                      </List>
                      <Button
                        colorScheme="brand"
                        variant="outline"
                        borderRadius="xl"
                        isDisabled
                        w="100%"
                      >
                        Your Plan
                      </Button>
                    </VStack>
                  </Box>

                  {/* Kinyarwanda Dictionary */}
                  <Box
                    bg={accentBg}
                    borderRadius="2xl"
                    p={6}
                    border="2px solid"
                    borderColor={borderColor}
                  >
                    <VStack align="stretch" spacing={4}>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={FiMapPin} color="brand.400" boxSize={5} />
                          <Text fontWeight="800" fontSize="lg">Kinyarwanda Dictionary</Text>
                        </HStack>
                        <Text color={mutedColor} fontSize="sm">
                          Learn pronunciation & local phrases
                        </Text>
                      </VStack>
                      <HStack align="baseline">
                        <Text fontSize="3xl" fontWeight="800">500</Text>
                        <Text fontSize="sm" color={mutedColor}>RWF/month</Text>
                      </HStack>
                      <Box bg={useColorModeValue('white', '#0f1923')} p={3} borderRadius="lg">
                        <Text fontSize="sm" color={mutedColor}>
                          <strong>What's included:</strong>
                        </Text>
                        <List spacing={2} mt={2}>
                          <ListItem fontSize="sm">
                            <ListIcon as={FiCheck} color="brand.400" />
                            Organized by categories
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FiCheck} color="brand.400" />
                            Pronunciation guide
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FiCheck} color="brand.400" />
                            Common phrases
                          </ListItem>
                          <ListItem fontSize="sm">
                            <ListIcon as={FiCheck} color="brand.400" />
                            Connect better with locals
                          </ListItem>
                        </List>
                      </Box>
                      <Text fontSize="xs" color={mutedColor} textAlign="center">
                        Learn Kinyarwanda to enhance your experience
                      </Text>
                    </VStack>
                  </Box>
                </SimpleGrid>

                <Box
                  bg={useColorModeValue('blue.50', 'rgba(59, 130, 246, 0.1)')}
                  p={4}
                  borderRadius="lg"
                  borderLeft="4px"
                  borderColor="brand.400"
                  w="100%"
                >
                  <Text fontSize="sm" color={mutedColor}>
                    💡 <strong>Pro Tip:</strong> Basic AI recommendations are free. Unlock the Kinyarwanda Dictionary for 500 RWF/month to learn how to connect with locals through language!
                  </Text>
                </Box>
              </VStack>
            </TabPanel>

            {/* BUSINESS PRICING */}
            <TabPanel>
              <VStack spacing={6}>
                <VStack spacing={2} textAlign="center" w="100%">
                  <Text fontSize="2xl" fontWeight="700">
                    Grow Your Business
                  </Text>
                  <Text color={mutedColor}>
                    Get discovered by locals and tourists exploring Kigali
                  </Text>
                </VStack>

                {/* Business Model Explanation */}
                <Box
                  bg={accentBg}
                  borderRadius="xl"
                  p={6}
                  border="1px solid"
                  borderColor={borderColor}
                  w="100%"
                >
                  <VStack align="start" spacing={4}>
                    <Text fontWeight="700" fontSize="lg">How Business Subscriptions Work</Text>

                    <VStack align="start" spacing={3} w="100%">
                      <Box>
                        <HStack mb={2}>
                          <Badge colorScheme="brand" borderRadius="lg">Step 1</Badge>
                          <Text fontWeight="600">Base Price (Updated Every 6 Months)</Text>
                        </HStack>
                        <Box bg={useColorModeValue('white', '#0f1923')} p={3} borderRadius="lg" ml={4}>
                          <Text fontSize="sm" mb={2}>
                            <strong>Current Base: 10,000 RWF/month</strong>
                          </Text>
                          <Text fontSize="xs" color={mutedColor}>
                            The base price is recalculated every 6 months based on total platform users. More users = higher demand = higher base price to ensure quality placement.
                          </Text>
                        </Box>
                      </Box>

                      <Box>
                        <HStack mb={2}>
                          <Badge colorScheme="brand" borderRadius="lg">Step 2</Badge>
                          <Text fontWeight="600">Performance Bonus (Per 100 Appearances)</Text>
                        </HStack>
                        <Box bg={useColorModeValue('white', '#0f1923')} p={3} borderRadius="lg" ml={4}>
                          <Text fontSize="sm" mb={2}>
                            <strong>+ 5,000 RWF for every 100 page views</strong>
                          </Text>
                          <Text fontSize="xs" color={mutedColor}>
                            When your business is shown to 100 users (within your monthly cycle), you pay an additional 5,000 RWF on top of the base price. More visibility = more revenue share with us.
                          </Text>
                        </Box>
                      </Box>

                      <Box>
                        <HStack mb={2}>
                          <Badge colorScheme="brand" borderRadius="lg">Example</Badge>
                          <Text fontWeight="600">Monthly Cost Calculation</Text>
                        </HStack>
                        <Box bg={useColorModeValue('white', '#0f1923')} p={4} borderRadius="lg" ml={4}>
                          <Table variant="simple">
                            <tbody>
                              <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                                <td style={{ padding: '8px 0' }}>Base price</td>
                                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>10,000 RWF</td>
                              </tr>
                              <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                                <td style={{ padding: '8px 0' }}>Appearances: 350 views</td>
                                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>3 × 5,000 RWF</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '12px 0', fontWeight: 'bold' }}>Total for month</td>
                                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#3b82f6' }}>25,000 RWF</td>
                              </tr>
                            </tbody>
                          </Table>
                        </Box>
                      </Box>
                    </VStack>
                  </VStack>
                </Box>

                {/* Business Tiers */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="100%">
                  {/* Starter */}
                  <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={6}
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <VStack align="stretch" spacing={4}>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={FiTrendingUp} color="brand.400" boxSize={5} />
                          <Text fontWeight="800" fontSize="lg">Starter</Text>
                        </HStack>
                        <Text color={mutedColor} fontSize="sm">
                          For new businesses
                        </Text>
                      </VStack>
                      <Box bg={accentBg} p={3} borderRadius="lg">
                        <Text fontSize="xs" color={mutedColor} mb={1}>Starting at</Text>
                        <HStack align="baseline">
                          <Text fontSize="2xl" fontWeight="800">10,000</Text>
                          <Text fontSize="sm" color={mutedColor}>RWF/month</Text>
                        </HStack>
                      </Box>
                      <List spacing={2}>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          List your business
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Photos & description
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Basic analytics
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Pay-per-view model
                        </ListItem>
                      </List>
                      <Button
                        colorScheme="brand"
                        variant="outline"
                        borderRadius="xl"
                        onClick={() => handleSelectPlan('Starter')}
                      >
                        Get Started
                      </Button>
                    </VStack>
                  </Box>

                  {/* Professional */}
                  <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={6}
                    border="2px solid"
                    borderColor="brand.400"
                    position="relative"
                  >
                    <Badge
                      colorScheme="brand"
                      position="absolute"
                      top={-3}
                      left="50%"
                      transform="translateX(-50%)"
                      borderRadius="full"
                      px={4}
                      py={1}
                      fontSize="xs"
                    >
                      ⭐ Most Popular
                    </Badge>
                    <VStack align="stretch" spacing={4}>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={FiZap} color="brand.400" boxSize={5} />
                          <Text fontWeight="800" fontSize="lg">Professional</Text>
                        </HStack>
                        <Text color={mutedColor} fontSize="sm">
                          For growing businesses
                        </Text>
                      </VStack>
                      <Box bg={accentBg} p={3} borderRadius="lg">
                        <Text fontSize="xs" color={mutedColor} mb={1}>Starting at</Text>
                        <HStack align="baseline">
                          <Text fontSize="2xl" fontWeight="800">10,000</Text>
                          <Text fontSize="sm" color={mutedColor}>RWF/month</Text>
                        </HStack>
                      </Box>
                      <List spacing={2}>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Everything in Starter
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Featured placement
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Advanced analytics
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Profile customization
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Promotion campaigns
                        </ListItem>
                      </List>
                      <Button
                        colorScheme="brand"
                        borderRadius="xl"
                        onClick={() => handleSelectPlan('Professional')}
                        leftIcon={<FiZap />}
                      >
                        Get Started
                      </Button>
                    </VStack>
                  </Box>

                  {/* Enterprise */}
                  <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={6}
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <VStack align="stretch" spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="800" fontSize="lg">Enterprise</Text>
                        <Text color={mutedColor} fontSize="sm">
                          For large chains & brands
                        </Text>
                      </VStack>
                      <Box bg={accentBg} p={3} borderRadius="lg">
                        <Text fontSize="sm" color={mutedColor}>Custom pricing</Text>
                        <Text fontSize="xs" color={mutedColor} mt={1}>
                          Based on location count & visibility goals
                        </Text>
                      </Box>
                      <List spacing={2}>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Everything in Professional
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Multi-location management
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          Priority support
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          API access
                        </ListItem>
                        <ListItem fontSize="sm">
                          <ListIcon as={FiCheck} color="brand.400" />
                          White-label options
                        </ListItem>
                      </List>
                      <Button
                        colorScheme="brand"
                        variant="outline"
                        borderRadius="xl"
                        onClick={() => handleSelectPlan('Enterprise')}
                      >
                        Contact Sales
                      </Button>
                    </VStack>
                  </Box>
                </SimpleGrid>

                {/* FAQ */}
                <Box w="100%" bg={useColorModeValue('gray.50', '#0f1923')} p={6} borderRadius="xl">
                  <Text fontWeight="700" fontSize="lg" mb={4}>Frequently Asked Questions</Text>
                  <VStack align="start" spacing={3}>
                    <Box>
                      <Text fontSize="sm" fontWeight="600">What are "appearances"?</Text>
                      <Text fontSize="sm" color={mutedColor}>
                        An appearance is when your business is shown on a user's page. If 350 users see your business card in a month, that's 350 appearances.
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" fontWeight="600">Does the price change?</Text>
                      <Text fontSize="sm" color={mutedColor}>
                        Yes, the base price (currently 10,000 RWF) updates every 6 months based on platform growth. More users = higher visibility demand = price adjustment.
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" fontWeight="600">What if I don't get many views?</Text>
                      <Text fontSize="sm" color={mutedColor}>
                        You only pay the base price. There's no additional fee if views are below 100. You pay extra only for success.
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" fontWeight="600">Can I cancel anytime?</Text>
                      <Text fontSize="sm" color={mutedColor}>
                        Yes! Cancel your subscription at any time. No long-term commitments.
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Mock payment modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Register Your Business</ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color={mutedColor} textAlign="center">
                You selected the <strong>{selectedPlan || 'Business'}</strong> plan.
              </Text>

              {registrationSuccess ? (
                <Box
                  w="100%"
                  bg={useColorModeValue('green.50', 'rgba(16, 185, 129, 0.12)')}
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={useColorModeValue('green.200', 'rgba(16, 185, 129, 0.24)')}
                >
                  <Text fontSize="sm" color={useColorModeValue('green.800', 'green.200')} textAlign="center" mb={2}>
                    Thank you! Your business was registered successfully.
                  </Text>
                  <Text fontSize="sm" color={mutedColor} textAlign="center">
                    Hidden Gems listings and AI recommendations will now include your business when it matches user interests.
                  </Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  <FormControl id="business-name" isRequired>
                    <FormLabel>Business name</FormLabel>
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Enter your business name"
                      borderRadius="xl"
                    />
                  </FormControl>

                  <FormControl id="business-type" isRequired>
                    <FormLabel>Business type</FormLabel>
                    <Select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      borderRadius="xl"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="cafe">Cafe</option>
                      <option value="nightlife">Nightlife</option>
                      <option value="street-food">Street Food</option>
                      <option value="market">Market</option>
                      <option value="outdoor">Outdoor</option>
                      <option value="art">Art & Culture</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>

                  <FormControl id="business-feel" isRequired>
                    <FormLabel>Business feel</FormLabel>
                    <Textarea
                      value={businessFeel}
                      onChange={(e) => setBusinessFeel(e.target.value)}
                      placeholder="Describe the atmosphere, style, and guest experience"
                      borderRadius="xl"
                    />
                  </FormControl>

                  <FormControl id="menus" isRequired>
                    <FormLabel>Menus / Highlights</FormLabel>
                    <Textarea
                      value={menus}
                      onChange={(e) => setMenus(e.target.value)}
                      placeholder="List the menu highlights or signature offerings"
                      borderRadius="xl"
                    />
                  </FormControl>

                  <FormControl id="business-address" isRequired>
                    <FormLabel>Location / Address</FormLabel>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your business address or location"
                      borderRadius="xl"
                    />
                  </FormControl>

                  <Button
                    colorScheme="brand"
                    w="100%"
                    borderRadius="xl"
                    onClick={handleSubmitRegistration}
                    isLoading={isSubmitting}
                  >
                    Submit Business
                  </Button>
                </VStack>
              )}

              <Button
                colorScheme="gray"
                variant="outline"
                w="100%"
                borderRadius="lg"
                onClick={() => {
                  if (registrationSuccess) {
                    setBusinessName('');
                    setBusinessType('restaurant');
                    setBusinessFeel('Friendly, authentic, and welcoming');
                    setMenus('Example menu highlights or signature dishes');
                    setAddress('');
                    setRegistrationSuccess(false);
                  }
                  onClose();
                }}
              >
                {registrationSuccess ? 'Done' : 'Close'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Simple Table component
const Table: React.FC<{ children: React.ReactNode; variant?: string }> = ({ children }) => (
  <div style={{ width: '100%' }}>
    {children}
  </div>
);

export default PricingPage;
