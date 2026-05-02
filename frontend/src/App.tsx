import React, { useEffect, useState } from 'react';
import { Box, useDisclosure, IconButton, Tooltip, useColorModeValue } from '@chakra-ui/react';
import Navbar from './components/layout/Navbar';
import Onboarding from './components/onboarding/Onboarding';
import ExplorePage from './pages/ExplorePage';
import ChatPage from './pages/ChatPage';
import PricingPage from './pages/PricingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VoiceModal from './components/voice/VoiceModal';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import DictionaryPage from './pages/DictionaryPage';
import { Place, UserPreferences, UserProfile } from './types';
import { fetchUserProfile, savePreferences } from './utils/api';

const DEFAULT_PREFS: UserPreferences = {
  interests: [],
  language: 'en',
  simpleMode: false,
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<'auth' | 'explore' | 'chat' | 'pricing' | 'analytics' | 'profile' | 'dictionary'>('auth');
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hasActiveBusiness, setHasActiveBusiness] = useState(false);
  const { isOpen: isVoiceOpen, onOpen: onVoiceOpen, onClose: onVoiceClose } = useDisclosure();
  const [aiDataSource, setAiDataSource] = useState<'database' | 'static'>('static');

  const bg = useColorModeValue('#f0f4f8', '#0f1923');

  useEffect(() => {
    let userId: string | null = null;
    const storedUser = localStorage.getItem('imboni_user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserProfile;
        userId = parsedUser.id;
        setUser(parsedUser);
        setPreferences(parsedUser.preferences || DEFAULT_PREFS);
        setActivePage('explore');
        setHasActiveBusiness(Boolean(localStorage.getItem(`imboni_business_active_${parsedUser.id}`)));

        fetchUserProfile(parsedUser.id)
          .then((result) => {
            const profile = result.user;
            const updatedPrefs = profile.preferences || DEFAULT_PREFS;
            setUser(profile);
            setPreferences(updatedPrefs);
            localStorage.setItem('imboni_user', JSON.stringify(profile));
            localStorage.setItem('imboni_prefs', JSON.stringify(updatedPrefs));
          })
          .catch(() => {
            // Keep stored user if backend is unavailable
          });
      } catch {
        localStorage.removeItem('imboni_user');
      }
    }

    const seenKey = userId ? `imboni_onboarded_${userId}` : 'imboni_onboarded';
    const seen = localStorage.getItem(seenKey);
    if (!seen) {
      setShowOnboarding(true);
    }
  }, []);

  const handleLogin = (signedUser: UserProfile) => {
    setUser(signedUser);
    setPreferences(signedUser.preferences || DEFAULT_PREFS);
    setHasActiveBusiness(Boolean(localStorage.getItem(`imboni_business_active_${signedUser.id}`)));
    localStorage.setItem('imboni_user', JSON.stringify(signedUser));
    setActivePage('explore');

    const onboardingKey = `imboni_onboarded_${signedUser.id}`;
    if (!localStorage.getItem(onboardingKey)) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    if (user) {
      localStorage.removeItem(`imboni_business_active_${user.id}`);
    }
    setHasActiveBusiness(false);
    setUser(null);
    localStorage.removeItem('imboni_user');
    setActivePage('auth');
    setShowOnboarding(false);
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    const onboardingKey = `imboni_onboarded_${user.id}`;
    localStorage.removeItem(onboardingKey);
    localStorage.removeItem(`imboni_business_active_${user.id}`);
    localStorage.removeItem('imboni_user');
    localStorage.removeItem('imboni_prefs');
    setUser(null);
    setHasActiveBusiness(false);
    setPreferences(DEFAULT_PREFS);
    setActivePage('auth');
    setShowOnboarding(false);
  };

  const handleOnboardingComplete = async (prefs: UserPreferences) => {
    setPreferences(prefs);
    setShowOnboarding(false);
    localStorage.setItem('imboni_onboarded', 'true');
    localStorage.setItem('imboni_prefs', JSON.stringify(prefs));

    if (user) {
      const updatedUser = { ...user, preferences: prefs };
      setUser(updatedUser);
      localStorage.setItem('imboni_user', JSON.stringify(updatedUser));
      const onboardingKey = `imboni_onboarded_${user.id}`;
      localStorage.setItem(onboardingKey, 'true');

      try {
        await savePreferences({
          user_id: user.id,
          interests: prefs.interests,
          language: prefs.language,
          simple_mode: prefs.simpleMode,
        });
      } catch {
        // Preserve local preferences if backend fails
      }
    }
  };

  const handleUpdatePreferences = async (partial: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...partial };
    setPreferences(updated);
    localStorage.setItem('imboni_prefs', JSON.stringify(updated));

    if (user) {
      const updatedUser = { ...user, preferences: updated };
      setUser(updatedUser);
      localStorage.setItem('imboni_user', JSON.stringify(updatedUser));
      try {
        await savePreferences({
          user_id: user.id,
          interests: updated.interests,
          language: updated.language,
          simple_mode: updated.simpleMode,
        });
      } catch {
        // Silent catch: allow offline preference storage
      }
    }
  };

  const handleProfileUpdate = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const nextUser = { ...user, ...updated };
    setUser(nextUser);
    localStorage.setItem('imboni_user', JSON.stringify(nextUser));
    if (updated.preferences) {
      setPreferences(updated.preferences);
      localStorage.setItem('imboni_prefs', JSON.stringify(updated.preferences));
    }
  };

  const handleAskAI = (place: Place) => {
    setChatInitialMessage(`Tell me more about ${place.name}. What should I know before visiting?`);
    setActivePage('chat');
  };

  const handleSuggestionClick = (query: string) => {
    setChatInitialMessage(query);
    setActivePage('chat');
  };

  const handleBusinessRegistered = () => {
    if (!user) return;
    setHasActiveBusiness(true);
    localStorage.setItem(`imboni_business_active_${user.id}`, 'true');
  };

  const handleVoiceTranscribed = (text: string) => {
    setChatInitialMessage(text);
    setActivePage('chat');
    onVoiceClose();
  };

  if (!user) {
    return (
      <Box minH="100vh" bg={bg}>
        <AuthPage onLogin={handleLogin} />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Onboarding
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onStartChat={() => {
          setActivePage('chat');
          setShowOnboarding(false);
        }}
        onStartVoice={() => {
          setActivePage('chat');
          onVoiceOpen();
        }}
      />

      {!showOnboarding && (
        <>
          <Navbar
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            activePage={activePage}
            onPageChange={setActivePage}
            user={user}
            onProfileClick={() => setActivePage('profile')}
            onLogout={handleLogout}
            aiDataSource={aiDataSource}
            hasActiveBusiness={hasActiveBusiness}
          />

          <Box as="main">
            {activePage === 'explore' && (
              <ExplorePage
                preferences={preferences}
                onAskAI={handleAskAI}
                onSuggestionClick={handleSuggestionClick}
                onDataSourceChange={setAiDataSource}
              />
            )}
            {activePage === 'chat' && (
              <ChatPage
                preferences={preferences}
                initialMessage={chatInitialMessage}
                onClearInitialMessage={() => setChatInitialMessage(undefined)}
              />
            )}
            {activePage === 'pricing' && <PricingPage onBusinessRegistered={handleBusinessRegistered} />}
            {activePage === 'analytics' && <AnalyticsPage />}
            {activePage === 'profile' && (
              <ProfilePage
                user={user}
                onUpdateProfile={handleProfileUpdate}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
              />
            )}
            {activePage === 'dictionary' && <DictionaryPage isPaid={user?.isPaid || false} />}
          </Box>

          {activePage === 'explore' && (
            <Tooltip label="Voice search" placement="left">
              <IconButton
                aria-label="Voice search"
                icon={<span style={{ fontSize: '20px' }}>🎤</span>}
                colorScheme="brand"
                borderRadius="full"
                size="lg"
                position="fixed"
                bottom={6}
                right={6}
                shadow="xl"
                zIndex={50}
                onClick={onVoiceOpen}
                _hover={{ transform: 'scale(1.1)' }}
                transition="all 0.2s"
              />
            </Tooltip>
          )}

          <VoiceModal
            isOpen={isVoiceOpen}
            onClose={onVoiceClose}
            language={preferences.language}
            onTranscribed={handleVoiceTranscribed}
          />
        </>
      )}
    </Box>
  );
};

export default App;
