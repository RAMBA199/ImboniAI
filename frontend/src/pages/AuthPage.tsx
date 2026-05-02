import React, { useMemo, useState } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, Input, Stack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { api } from '../utils/api';
import InteractiveFace from '../components/auth/InteractiveFace';
import { UserProfile } from '../types';

interface AuthPageProps {
  onLogin: (user: UserProfile) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [message, setMessage] = useState('Use a friendly avatar and start your trial with up to 5 accounts.');
  const [status, setStatus] = useState<'idle' | 'typing' | 'happy' | 'concerned' | 'success'>('idle');
  const [loading, setLoading] = useState(false);

  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.92)', 'rgba(15, 23, 42, 0.95)');
  const bg = useColorModeValue('#eef4ff', '#020817');
  const titleColor = useColorModeValue('#5b6bff', '#8ab4f8');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const inputBg = useColorModeValue('white', '#0f172a');
  const errorColor = '#dc2626';
  const faceBg = useColorModeValue('#eef5ff', '#111b2f');
  const faceTextColor = useColorModeValue('gray.700', 'gray.300');

  const handleModeChange = (target: 'login' | 'register') => {
    setMode(target);
    setMessage(target === 'login'
      ? 'Sign in to unlock your profile and preference collections.'
      : 'Create a test account; only five registrations are available during this phase.');
    setStatus('idle');
  };

  const faceMood = useMemo(() => {
    if (loading) return 'typing';
    if (status === 'success') return 'success';
    if (status === 'concerned') return 'concerned';
    if (status === 'happy') return 'happy';
    return 'idle';
  }, [loading, status]);

  const runAuth = async () => {
    setLoading(true);
    setStatus('typing');

    try {
      if (mode === 'login') {
        const { data } = await api.post('/auth/login', { email, password });
        onLogin(data.user);
      } else {
        const { data } = await api.post('/auth/register', { name, email, username, password, profilePic });
        onLogin(data.user);
      }
      setStatus('success');
      setMessage('Welcome! Your account is ready.');
    } catch (error: any) {
      const errorText = error?.response?.data?.error || 'Unable to authenticate right now.';
      setStatus('concerned');
      setMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  const formValid = useMemo(() => {
    if (mode === 'login') {
      return email.trim().length > 0 && password.trim().length > 0;
    }
    return (
      name.trim().length > 0 && username.trim().length > 0 && email.trim().length > 0 && password.trim().length >= 6
    );
  }, [mode, email, password, name, username]);

  return (
    <Flex minH="100vh" align="center" justify="center" px={4} py={8} bg={bg}>
      <Box className="auth-page-shell" maxW="980px" w="100%" p={6} bg={cardBg} borderRadius="30px" boxShadow="0 40px 90px rgba(15, 23, 42, 0.14)">
        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
          <VStack align="start" spacing={5} flex="1">
            <Text fontSize="sm" letterSpacing="0.22em" color={titleColor}>
              ACCOUNT ACCESS
            </Text>
            <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="800" lineHeight="1.05">
              {mode === 'login' ? 'Welcome back.' : 'Create your test profile.'}
            </Text>
            <Text color={textColor} maxW="lg">
              {mode === 'login'
                ? 'Sign in and personalize your trip recommendations with a simple user profile.'
                : 'Register a short-lived account so you can edit your profile, save preferences, and explore like a local.'}
            </Text>

            <Stack direction="row" spacing={3}>
              <Button
                size="lg"
                variant={mode === 'login' ? 'solid' : 'outline'}
                colorScheme="brand"
                onClick={() => handleModeChange('login')}
              >
                Sign In
              </Button>
              <Button
                size="lg"
                variant={mode === 'register' ? 'solid' : 'outline'}
                colorScheme="brand"
                onClick={() => handleModeChange('register')}
              >
                Register
              </Button>
            </Stack>

            <Stack spacing={4} w="100%">
              <FormControl display={mode === 'register' ? 'block' : 'none'}>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setStatus('typing'); }}
                  placeholder="Full name"
                  bg={inputBg}
                />
              </FormControl>

              <FormControl display={mode === 'register' ? 'block' : 'none'}>
                <FormLabel>Username</FormLabel>
                <Input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setStatus('typing'); }}
                  placeholder="Choose a username"
                  bg={inputBg}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('typing'); }}
                  placeholder="you@example.com"
                  bg={inputBg}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setStatus('typing'); }}
                  placeholder="At least 6 characters"
                  bg={inputBg}
                />
              </FormControl>

              <FormControl display={mode === 'register' ? 'block' : 'none'}>
                <FormLabel>Profile picture URL</FormLabel>
                <Input
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  placeholder="Optional image URL"
                  bg={inputBg}
                />
              </FormControl>

              <Button
                size="lg"
                colorScheme="brand"
                onClick={runAuth}
                isDisabled={!formValid || loading}
                isLoading={loading}
                loadingText={mode === 'login' ? 'Signing in' : 'Registering'}
                borderRadius="20px"
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>

              <Text color={status === 'concerned' ? errorColor : textColor}>
                {message}
              </Text>
            </Stack>
          </VStack>

          <Box flex="1" display="flex" justifyContent="center" alignItems="center">
            <Box maxW="320px" w="100%" p={6} borderRadius="32px" bg={faceBg}>
              <InteractiveFace mood={faceMood} />
              <Text mt={4} textAlign="center" color={faceTextColor}>
                {mode === 'login'
                  ? 'Let the face react as you type and sign in naturally.'
                  : 'The smile grows when your registration is ready.'}
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

export default AuthPage;
