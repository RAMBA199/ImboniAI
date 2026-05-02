import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  VStack, HStack, Text, Button, Box, Badge, Textarea, useColorModeValue,
  Progress, Alert, AlertIcon, useToast,
} from '@chakra-ui/react';
import { FiMic, FiMicOff, FiCheck, FiEdit2, FiRefreshCw } from 'react-icons/fi';
import { transcribeVoice } from '../../utils/api';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'rw';
  onTranscribed: (text: string) => void;
}

type VoiceState = 'idle' | 'recording' | 'processing' | 'confirm' | 'editing';
const MAX_RECORDING_SECONDS = 10;
const MAX_AUDIO_BYTES = 4 * 1024 * 1024; // 4 MB

const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose, language, onTranscribed }) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcription, setTranscription] = useState('');
  const [editedText, setEditedText] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const toast = useToast();
  const bgColor = useColorModeValue('white', '#1a2635');

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const clearMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
  };

  const blobToBase64 = async (blob: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (typeof base64 === 'string') {
          resolve(base64);
        } else {
          reject(new Error('Failed to convert audio to base64.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read audio blob.'));
      reader.readAsDataURL(blob);
    });
  };

  const processRecording = useCallback(async (blob: Blob) => {
    if (!blob || blob.size === 0) {
      setErrorMessage('No audio was recorded. Please try again.');
      setState('idle');
      clearMedia();
      return;
    }

    if (blob.size > MAX_AUDIO_BYTES) {
      setErrorMessage('Recording is too large. Please record a shorter clip.');
      setState('idle');
      clearMedia();
      return;
    }

    try {
      const base64 = await blobToBase64(blob);
      const result = await transcribeVoice(base64, blob.type || 'audio/webm', language);
      setTranscription(result.transcription);
      setEditedText(result.transcription);

      // Auto-confirm English transcriptions, require confirmation for Kinyarwanda
      if (language === 'en') {
        // Auto-send English transcription
        onTranscribed(result.transcription);
        onClose();
        resetState();
      } else {
        // Require confirmation for Kinyarwanda (may be inaccurate)
        setState('confirm');
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Voice transcription failed.';
      setErrorMessage(message);
      toast({
        title: 'Voice transcription error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setState('idle');
    } finally {
      clearMedia();
    }
  }, [language, toast, onTranscribed, onClose]);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Microphone access is not supported by this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const options: MediaRecorderOptions = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : MediaRecorder.isTypeSupported('audio/webm')
          ? { mimeType: 'audio/webm' }
          : {};

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        await processRecording(blob);
      };

      recorder.start();
      setState('recording');
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= MAX_RECORDING_SECONDS - 1) {
            stopRecording();
            return s + 1;
          }
          return s + 1;
        });
      }, 1000);
    } catch (error: any) {
      setErrorMessage('Unable to access microphone. Please allow permission and try again.');
      console.error('Voice recording error:', error);
    }
  }, [processRecording]);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setState('processing');
      mediaRecorderRef.current.stop();
    } else {
      setState('idle');
      clearMedia();
    }
  }, []);

  const handleConfirm = () => {
    onTranscribed(transcription);
    onClose();
    resetState();
  };

  const handleEditConfirm = () => {
    onTranscribed(editedText);
    onClose();
    resetState();
  };

  const handleRetry = () => {
    resetState();
  };

  const resetState = () => {
    setState('idle');
    setTranscription('');
    setEditedText('');
    setRecordingSeconds(0);
    setErrorMessage(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    clearMedia();
  };

  const handleClose = () => {
    if (state === 'recording') {
      stopRecording();
    }
    resetState();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent borderRadius="2xl" bg={bgColor}>
        <ModalHeader>
          <HStack>
            <Text>🎤 Voice Input</Text>
            {language === 'rw' && (
              <Badge colorScheme="purple" variant="subtle" borderRadius="full" fontSize="xs">
                🇷🇼 Kinyarwanda (Experimental)
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton borderRadius="full" />
        <ModalBody pb={6}>
          <VStack spacing={6}>
            {errorMessage && (
              <Alert status="error" borderRadius="xl">
                <AlertIcon />
                {errorMessage}
              </Alert>
            )}

            {state === 'idle' && (
              <VStack spacing={4} w="100%">
                <Box
                  w={24} h={24} borderRadius="full" bg="brand.500"
                  display="flex" alignItems="center" justifyContent="center"
                  cursor="pointer" onClick={startRecording}
                  _hover={{ bg: 'brand.400', transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                  shadow="lg"
                >
                  <FiMic size={36} color="white" />
                </Box>
                <Text fontWeight="600" textAlign="center">Tap to start speaking</Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Speak clearly in {language === 'rw' ? 'Kinyarwanda' : 'English'} and ask about places in Kigali
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  {language === 'en'
                    ? 'English transcriptions are sent automatically for faster experience.'
                    : 'If not English, Whisper will detect it as Kinyarwanda. Please review before sending.'
                  }
                </Text>
                <Text fontSize="xs" color="gray.500">Recording limited to {MAX_RECORDING_SECONDS} seconds to protect credits.</Text>
                {language === 'rw' && (
                  <Alert status="warning" borderRadius="xl" fontSize="sm">
                    <AlertIcon />
                    Kinyarwanda voice is experimental and may not be fully accurate
                  </Alert>
                )}
              </VStack>
            )}

            {state === 'recording' && (
              <VStack spacing={4} w="100%">
                <Box
                  w={24} h={24} borderRadius="full" bg="red.500"
                  display="flex" alignItems="center" justifyContent="center"
                  cursor="pointer" onClick={stopRecording}
                  className="recording-pulse"
                  shadow="lg"
                >
                  <FiMicOff size={36} color="white" />
                </Box>
                <Text fontWeight="700" color="red.400">Recording... {recordingSeconds}s</Text>
                <Progress value={(recordingSeconds / MAX_RECORDING_SECONDS) * 100} colorScheme="red"
                  w="100%" borderRadius="full" size="sm" />
                <Text fontSize="sm" color="gray.500">Tap to stop recording</Text>
                <Button variant="ghost" colorScheme="red" size="sm" onClick={stopRecording}>
                  Stop Recording
                </Button>
              </VStack>
            )}

            {state === 'processing' && (
              <VStack spacing={4} py={4}>
                <Box w={16} h={16} borderRadius="full" bg="brand.500" opacity={0.7}
                  display="flex" alignItems="center" justifyContent="center">
                  <FiMic size={28} color="white" />
                </Box>
                <Text fontWeight="600">Processing your voice...</Text>
                <Progress isIndeterminate colorScheme="brand" w="80%" borderRadius="full" size="sm" />
                <Text fontSize="xs" color="gray.500">Transcribing with Whisper</Text>
              </VStack>
            )}

            {state === 'confirm' && (
              <VStack spacing={4} w="100%">
                <Text fontWeight="600" fontSize="sm" color="gray.500">Did you say:</Text>
                <Box w="100%" bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
                  borderRadius="xl" p={4} border="2px solid" borderColor="brand.400">
                  <Text fontSize="md" fontWeight="500" textAlign="center">
                    "{transcription}"
                  </Text>
                </Box>
                <VStack w="100%" spacing={2}>
                  <Button w="100%" colorScheme="brand" leftIcon={<FiCheck />}
                    borderRadius="xl" onClick={handleConfirm}>
                    Yes, send this
                  </Button>
                  <Button w="100%" variant="outline" leftIcon={<FiEdit2 />}
                    borderRadius="xl" onClick={() => setState('editing')}>
                    Edit before sending
                  </Button>
                  <Button w="100%" variant="ghost" leftIcon={<FiRefreshCw />}
                    borderRadius="xl" onClick={handleRetry}>
                    Try again
                  </Button>
                </VStack>
              </VStack>
            )}

            {state === 'editing' && (
              <VStack spacing={4} w="100%">
                <Text fontWeight="600" fontSize="sm" color="gray.500">Edit your message:</Text>
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  borderRadius="xl"
                  rows={3}
                  autoFocus
                />
                <HStack w="100%">
                  <Button flex={1} variant="outline" borderRadius="xl" onClick={() => setState('confirm')}>
                    Back
                  </Button>
                  <Button flex={1} colorScheme="brand" borderRadius="xl"
                    leftIcon={<FiCheck />} onClick={handleEditConfirm}
                    isDisabled={!editedText.trim()}>
                    Send
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VoiceModal;
