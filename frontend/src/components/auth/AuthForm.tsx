import React, { useMemo, useState } from 'react';
import { Box, Button, Heading, HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import AnimatedButton from './AnimatedButton';
import AnimatedInput from './AnimatedInput';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState('');

  const emailValid = EMAIL_REGEX.test(email.trim());
  const passwordValid = password.trim().length >= 6;
  const isValid = emailValid && passwordValid;

  const helperMessage = useMemo(() => {
    if (!emailValid && email.length > 0) {
      return 'Please use a valid email address.';
    }
    if (!passwordValid && password.length > 0) {
      return 'Password should be at least 6 characters.';
    }
    return 'A friendly form that nods and shakes as you interact.';
  }, [email, emailValid, password, passwordValid]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) / 20;
    const y = (event.clientY - bounds.top - bounds.height / 2) / 24;
    setCursorOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setCursorOffset({ x: 0, y: 0 });
  };

  const handleHoverSubmit = () => {
    if (!isValid) {
      setIsShaking(true);
    }
  };

  const handleAnimationEnd = () => {
    setIsShaking(false);
  };

  const handleSubmit = () => {
    if (!isValid) {
      setIsShaking(true);
      setMessage('Almost there! Fill in both fields to unlock the sign in.');
      return;
    }

    setMessage('Welcome back! Your credentials look great.');
  };

  const handleRegister = () => {
    if (!isValid) {
      setMessage('Enter a valid email and password to register first.');
      setIsShaking(true);
      return;
    }

    setMessage('Registration ready! Your form is complete and calm.');
  };

  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.88)', 'rgba(18, 25, 36, 0.96)');
  const accent = useColorModeValue('#5b6bff', '#8ab4f8');

  return (
    <Box
      className="auth-form-shell"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Box
        className="auth-form-card"
        style={{ transform: `translate3d(${cursorOffset.x}px, ${cursorOffset.y}px, 0)` }}
        bg={cardBg}
        border="1px solid"
        borderColor={useColorModeValue('rgba(90, 100, 255, 0.12)', 'rgba(255, 255, 255, 0.08)')}
      >
        <VStack spacing={5} align="stretch">
          <Box>
            <Text fontSize="sm" letterSpacing="0.18em" color={accent} textTransform="uppercase" mb={2}>
              Friendly sign in
            </Text>
            <Heading size="lg" mb={2}>
              Talk to the form like a character.
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Hover to see a gentle denial shake, focus to get a little nod, and feel the form respond to your cursor.
            </Text>
          </Box>

          <AnimatedInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            isFocused={focusedField === 'email'}
            hint={focusedField === 'email' ? 'The email field is listening.' : undefined}
          />

          <AnimatedInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            isFocused={focusedField === 'password'}
            hint={focusedField === 'password' ? 'A gentle nod for a strong password.' : undefined}
          />

          <HStack spacing={3} align="center" flexWrap="wrap">
            <AnimatedButton
              label="Sign In"
              onClick={handleSubmit}
              isValid={isValid}
              isShaking={isShaking}
              onHover={handleHoverSubmit}
              onAnimationEnd={handleAnimationEnd}
            />
            <Button
              variant="outline"
              size="lg"
              onClick={handleRegister}
              className="auth-secondary-button"
            >
              Register
            </Button>
          </HStack>

          <Text className="auth-message">{message || helperMessage}</Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default AuthForm;
