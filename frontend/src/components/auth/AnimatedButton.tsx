import React from 'react';
import { Button } from '@chakra-ui/react';

interface AnimatedButtonProps {
  label: string;
  onClick: () => void;
  isValid: boolean;
  isShaking: boolean;
  onHover: () => void;
  onAnimationEnd: () => void;
  variant?: 'solid' | 'outline';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  label,
  onClick,
  isValid,
  isShaking,
  onHover,
  onAnimationEnd,
  variant = 'solid',
}) => {
  return (
    <Button
      className={`auth-action-button ${isShaking ? 'shake' : ''} ${isValid ? 'button-valid' : 'button-reactive'}`}
      onClick={onClick}
      onMouseEnter={onHover}
      onAnimationEnd={onAnimationEnd}
      variant={variant}
      size="lg"
      type="button"
      aria-disabled={!isValid}
      sx={{
        pointerEvents: 'auto',
      }}
    >
      {label}
    </Button>
  );
};

export default AnimatedButton;
