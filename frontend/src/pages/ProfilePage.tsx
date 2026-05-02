import React, { useMemo, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Stack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { UserProfile } from '../types';
import { api } from '../utils/api';
import InteractiveFace from '../components/auth/InteractiveFace';

interface ProfilePageProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateProfile, onLogout, onDeleteAccount }) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(user.profilePic || '');
  const [message, setMessage] = useState('Edit your profile details or logout when you’re done.');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'typing' | 'happy' | 'concerned' | 'success'>('idle');

  const cardBg = useColorModeValue('rgba(255,255,255,0.92)', 'rgba(10,18,34,0.95)');

  const faceMood = useMemo(() => {
    if (loading) return 'typing';
    if (status === 'success') return 'success';
    if (status === 'concerned') return 'concerned';
    if (status === 'happy') return 'happy';
    return 'idle';
  }, [loading, status]);

  const handleSave = async () => {
    setLoading(true);
    setStatus('typing');
    setMessage('Saving profile updates...');
    try {
      const { data } = await api.put('/auth/profile', {
        userId: user.id,
        name,
        username,
        email,
        password: password || undefined,
        profilePic,
      });
      onUpdateProfile(data.user);
      setStatus('success');
      setMessage('Profile updated successfully.');
      setPassword('');
    } catch (error: any) {
      setStatus('concerned');
      setMessage(error?.response?.data?.error || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this account? This cannot be undone and will free one registration slot.');
    if (!confirmed) return;

    setLoading(true);
    setStatus('typing');
    setMessage('Deleting account...');

    try {
      await api.delete('/auth/profile', { data: { userId: user.id } });
      setStatus('success');
      setMessage('Account deleted. Redirecting to login...');
      onDeleteAccount();
    } catch (error: any) {
      setStatus('concerned');
      setMessage(error?.response?.data?.error || 'Unable to delete account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" px={4} py={8} bg={useColorModeValue('#f8fbff', '#040a16')}>
      <Box maxW="1000px" mx="auto" bg={cardBg} borderRadius="32px" p={8} boxShadow="0 36px 90px rgba(15, 23, 42, 0.12)">
        <VStack spacing={8} align="stretch">
          <Text fontSize="3xl" fontWeight="800">Profile</Text>
          <Box display={{ base: 'block', md: 'flex' }} gap={8}>
            <Box flex="1">
              <FormControl mb={4}>
                <FormLabel>Profile picture URL</FormLabel>
                <Input
                  value={profilePic}
                  onChange={(e) => { setProfilePic(e.target.value); setStatus('typing'); }}
                  placeholder="Image URL"
                  bg={useColorModeValue('white', '#0f172a')}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setStatus('typing'); }}
                  bg={useColorModeValue('white', '#0f172a')}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Username</FormLabel>
                <Input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setStatus('typing'); }}
                  bg={useColorModeValue('white', '#0f172a')}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('typing'); }}
                  bg={useColorModeValue('white', '#0f172a')}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>New password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setStatus('typing'); }}
                  placeholder="Leave blank to keep current password"
                  bg={useColorModeValue('white', '#0f172a')}
                />
              </FormControl>
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={6}>
                <Button colorScheme="brand" size="lg" onClick={handleSave} isLoading={loading} loadingText="Saving">
                  Save profile
                </Button>
                <Button variant="outline" size="lg" onClick={onLogout}>
                  Logout
                </Button>
                <Button colorScheme="red" size="lg" variant="ghost" onClick={handleDelete} isLoading={loading}>
                  Delete account
                </Button>
              </Stack>
              <Text mt={4} color={status === 'concerned' ? '#dc2626' : useColorModeValue('gray.600', 'gray.300')}>
                {message}
              </Text>
            </Box>

            <Box flex="0 0 320px" mt={{ base: 8, md: 0 }}>
              <InteractiveFace mood={faceMood} />
              <Text mt={4} color={useColorModeValue('gray.700', 'gray.300')}>
                {profilePic ? 'Your emoji watches your profile picture too.' : 'Add an avatar URL to personalize your profile.'}
              </Text>
            </Box>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default ProfilePage;
