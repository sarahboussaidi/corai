
export interface SignPose {
  rightUpperArm: string; // Shoulder rotation
  rightLowerArm: string; // Elbow rotation
  rightHand: string;     // Wrist rotation
  leftUpperArm: string;
  leftLowerArm: string;
  leftHand: string;
  head: string;
  expression: 'neutral' | 'smile' | 'focus' | 'surprised';
  handState: 'flat' | 'fist' | 'point' | 'spread';
}

export interface SignAction {
  label: string;
  pose: SignPose;
  duration: number; // ms
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isProcessing?: boolean;
}
