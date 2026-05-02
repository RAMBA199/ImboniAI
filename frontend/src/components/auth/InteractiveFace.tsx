import React from 'react';
import './InteractiveFace.css';

interface InteractiveFaceProps {
  mood: 'idle' | 'typing' | 'happy' | 'concerned' | 'success';
}

const InteractiveFace: React.FC<InteractiveFaceProps> = ({ mood }) => {
  return (
    <div className={`face-card face-${mood}`} aria-hidden="true">
      <div className="face-eyes">
        <div className="face-eye left" />
        <div className="face-eye right" />
      </div>
      <div className="face-mouth" />
    </div>
  );
};

export default InteractiveFace;
