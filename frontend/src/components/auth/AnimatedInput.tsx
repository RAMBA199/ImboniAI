import React from 'react';
import { FormControl, FormLabel, Input, Text } from '@chakra-ui/react';

interface AnimatedInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  hint?: string;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  type,
  value,
  onChange,
  onFocus,
  onBlur,
  isFocused,
  hint,
}) => {
  return (
    <FormControl>
      <FormLabel className="auth-input-label">{label}</FormLabel>
      <div className={`auth-input-wrapper ${isFocused ? 'input-focused' : ''}`}>
        <Input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className="auth-input"
          placeholder={`Enter your ${label.toLowerCase()}`}
          autoComplete={type === 'email' ? 'email' : 'current-password'}
          _placeholder={{ color: 'gray.400' }}
        />
        <div className="auth-input-nod" aria-hidden="true" />
      </div>
      {hint ? <Text className="auth-input-hint">{hint}</Text> : null}
    </FormControl>
  );
};

export default AnimatedInput;
