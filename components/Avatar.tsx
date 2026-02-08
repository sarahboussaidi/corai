
import React, { useEffect, useState } from 'react';
import { SignPose, Euler } from '../types';
import { DEFAULT_POSE } from '../constants';

interface AvatarProps {
  currentPose: SignPose;
}

// --- CONFIGURATION ---
const SIZES = {
  head: { w: 100, h: 110 },
  torso: { w: 140, h: 160 },
  upperArm: { w: 32, len: 90 },
  lowerArm: { w: 28, len: 85 },
  hand: { w: 28, h: 32 },
  neck: { w: 30, h: 30 }
};

const COLORS = {
  skin: '#F3D2C1',
  skinDark: '#E0B090', // for joints/shadows
  shirt: '#4338CA', // Indigo 700
  shirtLight: '#4F46E5', // Indigo 600
  hair: '#291811',
  lips: '#C07878',
  eye: '#1E1B4B'
};

const Avatar: React.FC<AvatarProps> = ({ currentPose = DEFAULT_POSE }) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkTimer);
  }, []);

  // --- KINEMATICS HELPER ---
  const getRot = (rot: Euler) => `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`;

  // --- SUB-COMPONENTS ---

  // 1. DYNAMIC FACE SVG
  const Face = () => (
    <svg viewBox="0 0 100 110" className="w-full h-full overflow-visible">
      {/* Base Head Shape */}
      <rect x="0" y="0" width="100" height="110" rx="40" fill={COLORS.skin} />
      
      {/* Hair */}
      <path d="M0 40 C0 10 10 0 50 0 C90 0 100 10 100 40 V50 H95 V30 C95 10 85 10 50 10 C15 10 5 10 5 30 V60 H0 V40 Z" fill={COLORS.hair} />
      <path d="M0 30 C0 10 5 0 50 0 C95 0 100 10 100 30 V45 H0 V30 Z" fill={COLORS.hair} />
      
      {/* Ears (Behind) - rendered via CSS z-index usually, but here simple side ellipses */}
      <ellipse cx="-5" cy="55" rx="8" ry="12" fill={COLORS.skinDark} />
      <ellipse cx="105" cy="55" rx="8" ry="12" fill={COLORS.skinDark} />

      {/* Eyebrows */}
      <g transform={`translate(0, ${currentPose.expression === 'surprised' ? -5 : 0})`}>
        <path d="M25 45 Q35 40 45 45" stroke={COLORS.hair} strokeWidth="4" strokeLinecap="round" fill="none" 
              transform={currentPose.expression === 'angry' ? 'rotate(10, 35, 45)' : ''} />
        <path d="M55 45 Q65 40 75 45" stroke={COLORS.hair} strokeWidth="4" strokeLinecap="round" fill="none"
              transform={currentPose.expression === 'angry' ? 'rotate(-10, 65, 45)' : ''} />
      </g>

      {/* Eyes */}
      {blink ? (
        <g stroke={COLORS.eye} strokeWidth="3" strokeLinecap="round">
          <line x1="28" y1="58" x2="42" y2="58" />
          <line x1="58" y1="58" x2="72" y2="58" />
        </g>
      ) : (
        <g fill={COLORS.eye}>
          <circle cx="35" cy="58" r="5" />
          <circle cx="65" cy="58" r="5" />
          <circle cx="37" cy="56" r="1.5" fill="white" />
          <circle cx="67" cy="56" r="1.5" fill="white" />
        </g>
      )}

      {/* Nose */}
      <path d="M50 65 L48 75 L52 75 Z" fill={COLORS.skinDark} opacity="0.5" />

      {/* Mouth */}
      <g transform="translate(50, 85)">
        {currentPose.expression === 'smile' && <path d="M-12 -2 Q0 8 12 -2" fill="none" stroke={COLORS.lips} strokeWidth="3" strokeLinecap="round" />}
        {currentPose.expression === 'sad' && <path d="M-12 4 Q0 -6 12 4" fill="none" stroke={COLORS.lips} strokeWidth="3" strokeLinecap="round" />}
        {currentPose.expression === 'surprised' && <circle cx="0" cy="0" r="6" fill="none" stroke={COLORS.lips} strokeWidth="3" />}
        {(currentPose.expression === 'neutral' || currentPose.expression === 'focus') && <line x1="-8" y1="0" x2="8" y2="0" stroke={COLORS.lips} strokeWidth="3" strokeLinecap="round" />}
      </g>
    </svg>
  );

  // 2. VECTOR HAND COMPONENT
  const VectorHand = ({ state, isLeft }: { state: string, isLeft: boolean }) => {
    // We render hands as SVGs for perfect scaling and shape
    const flip = isLeft ? 'scale(-1, 1)' : '';
    
    // Hand Path Logic
    let path = ""; 
    // Flat / Default
    path = "M4 30 L4 10 Q4 0 12 0 Q20 0 20 10 L20 30 Z M20 12 L24 14 L24 26 L20 28"; 
    
    // Simple state mapping to visual shapes using React composition
    // Instead of complex paths, we build the hand from reliable primitives
    
    return (
      <div style={{ width: SIZES.hand.w, height: SIZES.hand.h, transform: flip }}>
        <div style={{ 
          width: '100%', height: '100%', 
          background: COLORS.skin, 
          borderRadius: '8px 8px 12px 12px',
          position: 'relative',
          boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.1)'
        }}>
           {/* Thumb */}
           <div style={{
             position: 'absolute', top: 12, left: -6, width: 8, height: 16,
             background: COLORS.skin, borderRadius: 4,
             transformOrigin: 'top right',
             transform: state === 'fist' ? 'rotate(-90deg) translate(-2px, -4px)' : 'rotate(-20deg)'
           }} />
           
           {/* Fingers */}
           <div style={{ position: 'absolute', top: -10, left: 2, display: 'flex', gap: '2px' }}>
              {/* Index */}
              <div style={{ 
                width: 5, height: (state === 'fist' || state === 'o-shape') ? 12 : 22, 
                background: COLORS.skin, borderRadius: 3, 
                transform: state === 'point' ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.2s'
              }} />
              {/* Middle */}
              <div style={{ 
                width: 5, height: (state === 'fist' || state === 'point' || state === 'o-shape') ? 12 : 24, 
                background: COLORS.skin, borderRadius: 3,
                transition: 'all 0.2s'
              }} />
              {/* Ring */}
              <div style={{ 
                width: 5, height: (state === 'fist' || state === 'point' || state === 'o-shape') ? 11 : 22, 
                background: COLORS.skin, borderRadius: 3,
                transition: 'all 0.2s'
              }} />
              {/* Pinky */}
              <div style={{ 
                width: 5, height: (state === 'fist' || state === 'point' || state === 'o-shape') ? 10 : 18, 
                background: COLORS.skin, borderRadius: 3,
                transition: 'all 0.2s'
              }} />
           </div>

           {/* O-Shape Hole Visualization */}
           {state === 'o-shape' && (
             <div style={{
               position: 'absolute', top: 0, left: 4, width: 14, height: 14,
               border: `2px solid ${COLORS.skinDark}`, borderRadius: '50%'
             }} />
           )}
        </div>
      </div>
    );
  };

  // 3. GENERIC BONE COMPONENT (The Secret Sauce for Non-Deformed Joints)
  // Renders a joint circle at 0,0 and the bone extending downwards
  const Bone = ({ w, len, color, children, zIndex = 1 }: any) => (
    <div style={{ 
      position: 'absolute', top: 0, left: 0, 
      width: 0, height: 0, // Pivot point container has no size
      zIndex 
    }}>
      {/* The Visual Joint (Centered at pivot) */}
      <div style={{
        position: 'absolute', top: -w/2, left: -w/2,
        width: w, height: w,
        borderRadius: '50%',
        background: color,
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' // subtle depth
      }} />
      
      {/* The Bone Shaft */}
      <div style={{
        position: 'absolute', top: 0, left: -w/2,
        width: w, height: len,
        background: color,
        borderRadius: w/2,
        // Using a gradient helps distinguish overlapping limbs of same color
        backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.05) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)'
      }} />

      {/* Connection Point for next bone */}
      <div style={{ position: 'absolute', top: len, left: 0 }}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex items-center justify-center bg-blue-50/50 rounded-[50px] overflow-hidden relative">
      {/* SCENE CONTAINER */}
      <div style={{
        perspective: '1200px', // More natural orthographic-like perspective
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: 'translateY(50px)' // Center the figure vertically
      }}>
        
        {/* ROOT: CENTER OF TORSO */}
        <div style={{
          position: 'relative', width: SIZES.torso.w, height: SIZES.torso.h,
          transformStyle: 'preserve-3d',
          background: COLORS.shirt,
          borderRadius: '30px 30px 20px 20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
        }}>
          {/* Shirt Details */}
          <div style={{ position: 'absolute', top: 0, width: '100%', height: '100%', borderRadius: '30px 30px 20px 20px', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 60, height: 20, background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 30px 30px' }} /> {/* Collar Shadow */}
             <div style={{ position: 'absolute', bottom: 0, width: '100%', height: 10, background: 'rgba(0,0,0,0.2)' }} /> {/* Hem */}
          </div>

          {/* NECK (Anchored Top Center) */}
          <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
             <div style={{ width: SIZES.neck.w, height: SIZES.neck.h, background: COLORS.skin, borderRadius: 15 }} />
             
             {/* HEAD (Child of Neck) */}
             <div style={{
               position: 'absolute', top: -SIZES.head.h + 10, left: -(SIZES.head.w - SIZES.neck.w)/2,
               width: SIZES.head.w, height: SIZES.head.h,
               transform: getRot(currentPose.head),
               transformOrigin: 'bottom center',
               transformStyle: 'preserve-3d',
               transition: 'transform 0.4s ease-out'
             }}>
                <Face />
             </div>
          </div>

          {/* RIGHT SHOULDER (Viewer's Left) */}
          <div style={{ position: 'absolute', top: 15, left: 15, zIndex: 10 }}>
            {/* Upper Arm Container - Rotates around shoulder */}
            <div style={{ transform: getRot(currentPose.rightUpperArm), transformOrigin: 'top center', transition: 'transform 0.4s ease-out', transformStyle: 'preserve-3d' }}>
              <Bone w={SIZES.upperArm.w} len={SIZES.upperArm.len} color={COLORS.shirtLight}>
                
                {/* Elbow Container - Rotates around elbow */}
                <div style={{ transform: getRot(currentPose.rightLowerArm), transformOrigin: 'top center', transition: 'transform 0.4s ease-out', transformStyle: 'preserve-3d' }}>
                  {/* Skin Transition at elbow */}
                  <div style={{ position: 'absolute', top: -10, left: -14, width: 28, height: 20, background: COLORS.skin, borderRadius: '50%', zIndex: -1 }} />
                  
                  <Bone w={SIZES.lowerArm.w} len={SIZES.lowerArm.len} color={COLORS.skin}>
                     
                     {/* Wrist/Hand */}
                     <div style={{ transform: getRot(currentPose.rightHand), transformOrigin: 'top center', transition: 'transform 0.4s ease-out' }}>
                        <div style={{ position: 'absolute', top: 0, left: -SIZES.hand.w/2 }}>
                          <VectorHand state={currentPose.handState} isLeft={false} />
                        </div>
                     </div>

                  </Bone>
                </div>

              </Bone>
            </div>
          </div>

          {/* LEFT SHOULDER (Viewer's Right) */}
          <div style={{ position: 'absolute', top: 15, right: 15, zIndex: 10 }}>
            <div style={{ transform: getRot(currentPose.leftUpperArm), transformOrigin: 'top center', transition: 'transform 0.4s ease-out', transformStyle: 'preserve-3d' }}>
              <Bone w={SIZES.upperArm.w} len={SIZES.upperArm.len} color={COLORS.shirtLight}>
                
                <div style={{ transform: getRot(currentPose.leftLowerArm), transformOrigin: 'top center', transition: 'transform 0.4s ease-out', transformStyle: 'preserve-3d' }}>
                  {/* Skin Transition */}
                  <div style={{ position: 'absolute', top: -10, left: -14, width: 28, height: 20, background: COLORS.skin, borderRadius: '50%', zIndex: -1 }} />

                  <Bone w={SIZES.lowerArm.w} len={SIZES.lowerArm.len} color={COLORS.skin}>
                     
                     <div style={{ transform: getRot(currentPose.leftHand), transformOrigin: 'top center', transition: 'transform 0.4s ease-out' }}>
                        <div style={{ position: 'absolute', top: 0, left: -SIZES.hand.w/2 }}>
                           <VectorHand state={currentPose.handState} isLeft={true} />
                        </div>
                     </div>

                  </Bone>
                </div>

              </Bone>
            </div>
          </div>

        </div>
        {/* End Torso */}

      </div>
      
      {/* Ground Shadow */}
      <div className="absolute bottom-10 w-40 h-6 bg-indigo-900/10 blur-xl rounded-full" />
    </div>
  );
};

export default Avatar;
