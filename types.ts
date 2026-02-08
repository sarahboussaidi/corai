
export interface Euler {
  x: number;
  y: number;
  z: number;
}

export interface SignPose {
  rightUpperArm: Euler;
  rightLowerArm: Euler;
  rightHand: Euler;     
  leftUpperArm: Euler;
  leftLowerArm: Euler;
  leftHand: Euler;
  head: Euler;
  expression: 'neutral' | 'smile' | 'focus' | 'surprised' | 'sad' | 'angry';
  handState: 'flat' | 'fist' | 'point' | 'spread' | 'two' | 'three' | 'four' | 'thumb-up' | 'bent-hand' | 'c-shape' | 'o-shape';
}

export interface SignAction {
  label: string;
  pose: SignPose;
  duration: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  type?: 'speech' | 'sign';
}

export interface User {
  email: string;
  password?: string; // stored plainly for this mock demo
  name: string;
  photo?: string; // base64 data url
}
