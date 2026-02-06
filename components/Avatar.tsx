
import React from 'react';
import { SignPose } from '../types';
import { DEFAULT_POSE } from '../constants';

interface AvatarProps {
  currentPose: SignPose;
}

const Avatar: React.FC<AvatarProps> = ({ currentPose = DEFAULT_POSE }) => {
  
  const renderHand = (state: string, color: string, isLeft: boolean) => {
    const sideMult = isLeft ? 1 : -1;
    switch(state) {
      case 'fist':
        return (
          <g>
            <circle r="9" fill={color} />
            <path d="M-5 -5 Q0 -10 5 -5" stroke="rgba(0,0,0,0.15)" fill="none" strokeWidth="1" />
          </g>
        );
      case 'point':
        return (
          <g>
            <circle r="8" fill={color} />
            {/* The index finger is vital for TSL "Tounes" or pointing */}
            <rect x="-2" y="-18" width="4.5" height="15" rx="2.5" fill={color} />
            {/* Thumb tucked variant */}
            <path d={`M${sideMult * 5} 0 Q${sideMult * 10} 5 ${sideMult * 5} 10`} stroke="rgba(0,0,0,0.15)" fill="none" strokeWidth="1.5" />
          </g>
        );
      case 'spread':
        return (
          <g>
            <circle r="8" fill={color} />
            {[...Array(5)].map((_, i) => (
              <rect 
                key={i} 
                x="-1.5" 
                y="-17" 
                width="3.5" 
                height="14" 
                rx="1.5" 
                fill={color} 
                style={{ 
                  transform: `rotate(${(i-2)*24}deg)`, 
                  transformOrigin: 'bottom center',
                  transition: 'transform 0.2s ease-out'
                }} 
              />
            ))}
          </g>
        );
      default: // flat (Palm)
        return (
          <g>
            <rect x="-8" y="-12" width="16" height="22" rx="6" fill={color} />
            <line x1="-3" y1="-9" x2="-3" y2="5" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
            <line x1="1" y1="-10" x2="1" y2="6" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
            <line x1="5" y1="-9" x2="5" y2="5" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
          </g>
        );
    }
  };

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center bg-white rounded-3xl shadow-inner border border-indigo-100 overflow-hidden bg-gradient-to-b from-indigo-50/30 to-white">
      {/* Visual background grid for orientation */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4338ca" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <svg viewBox="0 0 200 240" className="w-full h-full relative z-10 drop-shadow-xl p-4">
        {/* Torso */}
        <path d="M55 145 Q100 130 145 145 L160 235 Q100 250 40 235 Z" fill="#2d2a7a" />
        
        {/* Neck */}
        <rect x="85" y="120" width="30" height="30" rx="4" fill="#ffdbac" />

        {/* Head Group */}
        <g style={{ transform: currentPose.head, transformOrigin: '100px 110px', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          {/* Face */}
          <path d="M70 75 Q70 40 100 40 Q130 40 130 75 Q130 115 100 115 Q70 115 70 75" fill="#ffdbac" />
          
          {/* Facial Expressions */}
          <g transform="translate(100, 85)">
            {currentPose.expression === 'smile' && (
               <path d="M-12 12 Q0 26 12 12" stroke="#4a3728" fill="none" strokeWidth="3" strokeLinecap="round" />
            )}
            {currentPose.expression === 'neutral' && (
               <path d="M-8 16 L8 16" stroke="#4a3728" fill="none" strokeWidth="2.5" strokeLinecap="round" />
            )}
            {currentPose.expression === 'focus' && (
               <g>
                 <path d="M-8 14 Q0 12 8 14" stroke="#4a3728" fill="none" strokeWidth="2.5" strokeLinecap="round" />
                 <path d="M-15 -18 L-5 -16" stroke="#4a3728" fill="none" strokeWidth="2" strokeLinecap="round" />
                 <path d="M15 -18 L5 -16" stroke="#4a3728" fill="none" strokeWidth="2" strokeLinecap="round" />
               </g>
            )}
            {currentPose.expression === 'surprised' && (
               <circle r="7" cy="14" stroke="#4a3728" fill="none" strokeWidth="2.5" />
            )}
            
            {/* Eyes */}
            <g transform="translate(-15, -10)">
              <ellipse rx="4" ry="5" fill="#1e1b4b" />
              <circle cx="-1" cy="-2" r="1.2" fill="white" />
            </g>
            <g transform="translate(15, -10)">
              <ellipse rx="4" ry="5" fill="#1e1b4b" />
              <circle cx="-1" cy="-2" r="1.2" fill="white" />
            </g>
          </g>
          
          {/* Hair Styling */}
          <path d="M70 70 Q70 30 100 30 Q130 30 130 70 Q130 50 115 45 Q100 40 85 45 Q70 50 70 70" fill="#1e1b4b" />
        </g>

        {/* SKELETAL SYSTEM - Viewer's Right (Avatar's Left) */}
        <g transform="translate(145, 150)">
          <g style={{ transform: currentPose.leftUpperArm, transformOrigin: '0 0', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <rect x="-8" y="0" width="16" height="45" rx="8" fill="#3f37c9" />
            <g transform="translate(0, 45)">
              <g style={{ transform: currentPose.leftLowerArm, transformOrigin: '0 0', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <rect x="-7" y="0" width="14" height="40" rx="7" fill="#ffdbac" />
                <g transform="translate(0, 40)">
                  <g style={{ transform: currentPose.leftHand, transformOrigin: '0 0', transition: 'all 0.4s ease-out' }}>
                    {renderHand(currentPose.handState, '#ffdbac', true)}
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>

        {/* SKELETAL SYSTEM - Viewer's Left (Avatar's Right) */}
        <g transform="translate(55, 150)">
          <g style={{ transform: currentPose.rightUpperArm, transformOrigin: '0 0', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <rect x="-8" y="0" width="16" height="45" rx="8" fill="#3f37c9" />
            <g transform="translate(0, 45)">
              <g style={{ transform: currentPose.rightLowerArm, transformOrigin: '0 0', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <rect x="-7" y="0" width="14" height="40" rx="7" fill="#ffdbac" />
                <g transform="translate(0, 40)">
                  <g style={{ transform: currentPose.rightHand, transformOrigin: '0 0', transition: 'all 0.4s ease-out' }}>
                    {renderHand(currentPose.handState, '#ffdbac', false)}
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
      
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-[10px] font-bold text-indigo-300 tracking-wider">TSL LIVE RENDER</span>
      </div>
    </div>
  );
};

export default Avatar;
