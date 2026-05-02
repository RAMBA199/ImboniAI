import React, { useState } from 'react';
import {
  Box, HStack, Text, IconButton, Button, useColorMode, useColorModeValue,
  Menu, MenuButton, MenuList, MenuItem, Badge, Avatar, Flex, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  VStack, useDisclosure, Divider,
} from '@chakra-ui/react';
import { t } from '../../utils/i18n';
import { FiSun, FiMoon, FiBell, FiHelpCircle, FiUser, FiCircle, FiSettings } from 'react-icons/fi';
import { UserPreferences, UserProfile } from '../../types';

type AuthPageKey = 'auth' | 'explore' | 'chat' | 'pricing' | 'analytics' | 'profile' | 'dictionary';

interface NavbarProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  activePage: AuthPageKey;
  onPageChange: (page: AuthPageKey) => void;
  user?: UserProfile;
  onProfileClick: () => void;
  onLogout: () => void;
  aiDataSource?: 'database' | 'static';
  hasActiveBusiness?: boolean;
}

const MOCK_NOTIFICATIONS = [
  { id: '1', text: 'New café opened in Kimihurura!', time: '2m ago', read: false },
  { id: '2', text: 'Kigali Arena has events this weekend', time: '1h ago', read: false },
  { id: '3', text: 'Bourbon Coffee has a new seasonal menu', time: '3h ago', read: true },
  { id: '4', text: 'Your area has 3 new highly-rated places', time: '1d ago', read: true },
];

const Navbar: React.FC<NavbarProps> = ({ preferences, onUpdatePreferences, activePage, onPageChange, user, onProfileClick, onLogout, aiDataSource, hasActiveBusiness }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen: isHelpOpen, onOpen: onHelpOpen, onClose: onHelpClose } = useDisclosure();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const bg = useColorModeValue('white', '#1a2635');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const unreadCount = notifications.filter(n => !n.read).length;

  const NAV_PAGES: Array<{ id: AuthPageKey; label: string; emoji: string }> = [
    { id: 'explore', label: t('navExplore', preferences.language), emoji: '🌍' },
    { id: 'chat', label: t('navAIChat', preferences.language), emoji: '💬' },
    { id: 'dictionary', label: t('navDictionary', preferences.language), emoji: '🇷🇼' },
    { id: 'pricing', label: t('navPricing', preferences.language), emoji: '💎' },
    { id: 'analytics', label: t('navAnalytics', preferences.language), emoji: '📊' },
  ];

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      <Box
        as="nav"
        bg={bg}
        borderBottom="1px solid"
        borderColor={borderColor}
        px={{ base: 4, md: 6 }}
        py={3}
        position="sticky"
        top={0}
        zIndex={100}
        shadow="sm"
      >
        <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
          {/* Logo */}
          <HStack spacing={2} cursor="pointer" onClick={() => onPageChange('explore')}>
            <Text fontSize="xl">🌍</Text>
            <Text fontWeight="800" fontSize="xl" bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text">
              Imboni
            </Text>
            <Badge colorScheme="green" variant="subtle" borderRadius="full" fontSize="xs">
              Kigali
            </Badge>
          </HStack>

          {/* Desktop nav */}
          <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
            {NAV_PAGES.map(page => (
              <Button
                key={page.id}
                variant={activePage === page.id ? 'solid' : 'ghost'}
                colorScheme={activePage === page.id ? 'brand' : 'gray'}
                size="sm"
                borderRadius="xl"
                onClick={() => onPageChange(page.id)}
                fontWeight={activePage === page.id ? '700' : '500'}
              >
                {page.emoji} {page.label}
              </Button>
            ))}
          </HStack>

          {/* Right actions */}
          <HStack spacing={2}>
            {/* Language indicator */}
            <Badge
              colorScheme={preferences.language === 'rw' ? 'purple' : 'blue'}
              variant="subtle"
              borderRadius="full"
              px={2}
              fontSize="xs"
            >
              {preferences.language === 'rw' ? '🇷🇼 RW' : '🇬🇧 EN'}
            </Badge>

            {/* AI Data Status */}
            <Tooltip label={aiDataSource === 'database' ? 'AI data available' : 'Using demo data'}>
              <IconButton
                aria-label="AI data status"
                icon={<FiCircle />}
                colorScheme={aiDataSource === 'database' ? 'green' : 'red'}
                variant="ghost"
                borderRadius="full"
                size="sm"
                display={{ base: 'none', sm: 'inline-flex' }}
              />
            </Tooltip>
            <Tooltip label={aiDataSource === 'database' ? 'AI data available' : 'Using demo data'}>
              <Badge
                colorScheme={aiDataSource === 'database' ? 'green' : 'red'}
                variant="subtle"
                borderRadius="full"
                px={2}
                fontSize="xs"
                display={{ base: 'none', sm: 'flex' }}
                cursor="pointer"
              >
                {aiDataSource === 'database' ? '🤖 AI' : '📋 Demo'}
              </Badge>
            </Tooltip>
            {hasActiveBusiness && (
              <Tooltip label="Your business is in action" placement="bottom">
                <Badge colorScheme="cyan" variant="solid" borderRadius="full" px={3} fontSize="xs">
                  In Action
                </Badge>
              </Tooltip>
            )}

            {/* Notifications */}
            <Menu>
              <MenuButton as={Box} position="relative" cursor="pointer">
                <IconButton aria-label="Notifications" icon={<FiBell />} variant="ghost"
                  borderRadius="xl" size="sm" />
                {unreadCount > 0 && (
                  <Badge position="absolute" top="-2px" right="-2px" colorScheme="red"
                    borderRadius="full" fontSize="9px" minW={4} h={4}
                    display="flex" alignItems="center" justifyContent="center">
                    {unreadCount}
                  </Badge>
                )}
              </MenuButton>
              <MenuList borderRadius="2xl" shadow="xl" minW="300px">
                <HStack px={4} py={3} justify="space-between">
                  <Text fontWeight="700" fontSize="sm">Notifications</Text>
                  <Button variant="link" size="xs" onClick={markAllRead}>Mark all read</Button>
                </HStack>
                <Divider />
                {notifications.map(n => (
                  <MenuItem key={n.id} borderRadius="xl" mx={2}
                    bg={n.read ? 'transparent' : useColorModeValue('blue.50', 'blue.900')}
                    onClick={() => setNotifications(prev => prev.map(notif =>
                      notif.id === n.id ? { ...notif, read: true } : notif
                    ))}>
                    <HStack w="100%">
                      <Box w={2} h={2} borderRadius="full" bg={n.read ? 'transparent' : 'blue.400'} flexShrink={0} />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm">{n.text}</Text>
                        <Text fontSize="xs" color="gray.500">{n.time}</Text>
                      </VStack>
                    </HStack>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            {/* Help */}
            <Tooltip label={t('navHowToUse', preferences.language)}>
              <IconButton aria-label={t('navHowToUse', preferences.language)} icon={<FiHelpCircle />} variant="ghost"
                borderRadius="xl" size="sm" onClick={onHelpOpen} />
            </Tooltip>

            {/* Settings */}
            <Menu>
              <MenuButton as={IconButton}
                aria-label="Settings"
                icon={<FiSettings />}
                variant="ghost"
                borderRadius="xl"
                size="sm"
              />
              <MenuList borderRadius="2xl" shadow="xl">
                <MenuItem onClick={() => onUpdatePreferences({ language: 'en' })}>
                  🇬🇧 English
                </MenuItem>
                <MenuItem onClick={() => onUpdatePreferences({ language: 'rw' })}>
                  🇷🇼 Kinyarwanda
                </MenuItem>
              </MenuList>
            </Menu>

            {/* Profile menu */}
            {user && (
              <Menu>
                <MenuButton as={IconButton}
                  aria-label="Profile menu"
                  icon={<Avatar size="sm" name={user.name} src={user.profilePic || undefined} />}
                  variant="ghost"
                  borderRadius="xl"
                  size="sm"
                />
                <MenuList borderRadius="2xl" shadow="xl">
                  <MenuItem icon={<FiUser />} onClick={onProfileClick}>Edit profile</MenuItem>
                  <MenuItem onClick={onLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            )}

            {/* Dark mode */}
            <Tooltip label={colorMode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'dark' ? <FiSun /> : <FiMoon />}
                variant="ghost"
                borderRadius="xl"
                size="sm"
                onClick={toggleColorMode}
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Mobile nav */}
        <Flex mt={2} gap={1} display={{ base: 'flex', md: 'none' }} overflowX="auto"
          css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
          {NAV_PAGES.map(page => (
            <Button
              key={page.id}
              variant={activePage === page.id ? 'solid' : 'ghost'}
              colorScheme={activePage === page.id ? 'brand' : 'gray'}
              size="xs"
              borderRadius="xl"
              onClick={() => onPageChange(page.id)}
              whiteSpace="nowrap"
              flexShrink={0}
            >
              {page.emoji} {page.label}
            </Button>
          ))}
        </Flex>
      </Box>

      {/* Help Modal */}
      <Modal isOpen={isHelpOpen} onClose={onHelpClose} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>{t('navHowToUse', preferences.language)}</ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              {[
                { emoji: '🗺️', title: t('navExplore', preferences.language), desc: t('helpExploreDesc', preferences.language) },
                { emoji: '💬', title: t('navAIChat', preferences.language), desc: t('helpAIChatDesc', preferences.language) },
                { emoji: '🎤', title: t('voiceTitle', preferences.language), desc: t('helpVoiceInputDesc', preferences.language) },
                { emoji: '🔍', title: t('helpSearchDesc', preferences.language).split('.')[0], desc: t('helpSearchDesc', preferences.language) },
                { emoji: '✨', title: 'Simple Mode', desc: t('helpSimpleModeDesc', preferences.language) },
                { emoji: '📍', title: t('helpNearYouDesc', preferences.language).split('.')[0], desc: t('helpNearYouDesc', preferences.language) },
              ].map(item => (
                <HStack key={item.title} align="start" spacing={3}>
                  <Text fontSize="xl" flexShrink={0}>{item.emoji}</Text>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="700" fontSize="sm">{item.title}</Text>
                    <Text fontSize="sm" color="gray.500">{item.desc}</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

    </>
  );
};

export default Navbar;
