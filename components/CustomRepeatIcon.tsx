import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomRepeatIconProps {
  size?: number;
  color?: string;
  style?: any;
}

export function CustomRepeatIcon({ size = 22, color = '#FFFFFF', style }: CustomRepeatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Oberer Pfeil (nach rechts) - etwas höher positioniert */}
      <Path
        d="M17 7L21 7M21 7L18 4M21 7L18 10"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 7L7 7C5.89543 7 5 7.89543 5 9L5 11"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      
      {/* Unterer Pfeil (nach links) - etwas tiefer positioniert */}
      <Path
        d="M7 17L3 17M3 17L6 20M3 17L6 14"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 17L17 17C18.1046 17 19 16.1046 19 15L19 13"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
