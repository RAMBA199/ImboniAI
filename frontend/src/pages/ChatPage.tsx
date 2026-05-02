import React, { useState } from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import ChatWindow from '../components/chat/ChatWindow';
import VoiceModal from '../components/voice/VoiceModal';
import { Place, UserPreferences } from '../types';

interface ChatPageProps {
  preferences: UserPreferences;
  initialMessage?: string;
  onClearInitialMessage?: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ preferences, initialMessage, onClearInitialMessage }) => {
  const { isOpen: isVoiceOpen, onOpen: onVoiceOpen, onClose: onVoiceClose } = useDisclosure();
  const [voiceText, setVoiceText] = useState('');

  const handleAskAI = (place: Place) => {
    // Already in chat page, handled via initialMessage
  };

  const handleTranscribed = (text: string) => {
    setVoiceText(text);
    onVoiceClose();
  };

  return (
    <Box h="calc(100vh - 120px)" p={{ base: 2, md: 4 }} maxW="900px" mx="auto">
      <ChatWindow
        preferences={preferences}
        onAskAI={handleAskAI}
        initialMessage={voiceText || initialMessage}
        onVoiceClick={onVoiceOpen}
      />
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={onVoiceClose}
        language={preferences.language}
        onTranscribed={handleTranscribed}
      />
    </Box>
  );
};

export default ChatPage;
