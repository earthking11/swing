import React from 'react';

type Mood = 'normal' | 'happy' | 'scared';

interface JigglypuffProps {
  mood: Mood;
  className?: string;
}

const Jigglypuff: React.FC<JigglypuffProps> = ({ mood, className = '' }) => {
  // Colors based on the classic character image
  const pinkBody = "#FDCBE1"; // Light pink
  const pinkDark = "#E0A7BD"; // Shadow
  const eyeTeal = "#3B9EBf";
  const earInner = "#4B3B4B";

  // Dynamic facial features based on mood
  const getMouthPath = () => {
    switch (mood) {
      case 'happy':
        return "M 75 115 Q 100 135 125 115"; // Big smile
      case 'scared':
        return "M 90 120 A 10 10 0 1 1 110 120 A 10 10 0 1 1 90 120"; // Open O mouth
      case 'normal':
      default:
        return "M 85 115 Q 100 125 115 115"; // Small smile
    }
  };

  const getEyeShape = (side: 'left' | 'right') => {
    // Scared eyes are slightly wider/pupils smaller
    if (mood === 'scared') {
      return (
        <g>
          <circle cx={side === 'left' ? 65 : 135} cy="90" r="22" fill="white" stroke={pinkDark} strokeWidth="2" />
          <circle cx={side === 'left' ? 68 : 132} cy="90" r="10" fill={eyeTeal} />
          <circle cx={side === 'left' ? 64 : 128} cy="86" r="4" fill="white" />
        </g>
      );
    }
    // Happy eyes are closed arcs or big shiny eyes? Let's keep them open but big for happy/normal
    // The prompt image shows big open eyes.
    return (
      <g>
        <circle cx={side === 'left' ? 60 : 140} cy="90" r="24" fill="white" stroke={pinkDark} strokeWidth="1" />
        <circle cx={side === 'left' ? 64 : 136} cy="90" r="16" fill={eyeTeal} />
        <circle cx={side === 'left' ? 58 : 130} cy="82" r="6" fill="white" opacity="0.9" />
        <circle cx={side === 'left' ? 70 : 142} cy="96" r="3" fill="white" opacity="0.6" />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-lg ${className}`}>
      {/* Left Foot */}
      <ellipse cx="60" cy="165" rx="15" ry="10" fill={pinkBody} stroke={pinkDark} strokeWidth="2" transform="rotate(-20 60 165)" />
      {/* Right Foot */}
      <ellipse cx="140" cy="165" rx="15" ry="10" fill={pinkBody} stroke={pinkDark} strokeWidth="2" transform="rotate(20 140 165)" />

      {/* Body */}
      <circle cx="100" cy="100" r="70" fill={pinkBody} stroke={pinkDark} strokeWidth="3" />

      {/* Ears */}
      <path d="M 35 45 L 65 70 L 30 85 Z" fill={pinkBody} stroke={pinkDark} strokeWidth="3" />
      <path d="M 40 55 L 55 70 L 38 78 Z" fill={earInner} />
      
      <path d="M 165 45 L 135 70 L 170 85 Z" fill={pinkBody} stroke={pinkDark} strokeWidth="3" />
      <path d="M 160 55 L 145 70 L 162 78 Z" fill={earInner} />

      {/* Signature Curl */}
      <path d="M 100 35 Q 130 30 120 60 Q 110 80 100 65 Q 90 50 100 35" fill={pinkBody} stroke={pinkDark} strokeWidth="3" />

      {/* Left Arm */}
      <ellipse cx="35" cy="110" rx="12" ry="10" fill={pinkBody} stroke={pinkDark} strokeWidth="2" transform="rotate(-45 35 110)" />
      {/* Right Arm - Raised if happy/scared */}
      <ellipse 
        cx="165" 
        cy={mood === 'normal' ? "110" : "90"} 
        rx="12" 
        ry="10" 
        fill={pinkBody} 
        stroke={pinkDark} 
        strokeWidth="2" 
        transform={mood === 'normal' ? "rotate(45 165 110)" : "rotate(-20 165 90)"} 
      />

      {/* Eyes */}
      {getEyeShape('left')}
      {getEyeShape('right')}

      {/* Mouth */}
      <path d={getMouthPath()} fill="none" stroke="#4B3B4B" strokeWidth="3" strokeLinecap="round" />

      {/* Blush */}
      <ellipse cx="45" cy="120" rx="8" ry="4" fill="#FF99AA" opacity="0.6" />
      <ellipse cx="155" cy="120" rx="8" ry="4" fill="#FF99AA" opacity="0.6" />

    </svg>
  );
};

export default Jigglypuff;
