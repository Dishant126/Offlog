import React from 'react';

export default function WavePattern({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
          <stop offset="30%" stopColor="#3B82F6" stopOpacity="0.04" />
          <stop offset="70%" stopColor="#6366F1" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.20" />
        </linearGradient>
        <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0" />
          <stop offset="40%" stopColor="#60A5FA" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      {/* Back layer wave - organic curve starting smoothly at x=350 */}
      <path
        d="M350,200 C500,80 650,140 1000,40 L1000,200 Z"
        fill="url(#waveGrad2)"
      />

      {/* Front layer wave - elegant top-right accent starting at x=450 */}
      <path
        d="M450,0 C600,130 750,30 1000,90 L1000,200 L1000,0 Z"
        fill="url(#waveGrad1)"
      />
    </svg>
  );
}
