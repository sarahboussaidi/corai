
import { GoogleGenAI, Type } from "@google/genai";
import { SignAction } from "../types";

const TSL_DICTIONARY_KNOWLEDGE = `
TUNISIAN SIGN LANGUAGE (TSL) SPECIFIC DATA:
TSL is a distinct language, though it shares some roots with LSF (French Sign Language). It features unique Tunisian cultural markers.

CORE TSL VOCABULARY & MOTION PATHS:
- "TOUNES" (Tunisia): Hand in 'point' state. Index finger draws a small crescent (half-circle) near the right temple. (Head: neutral, RightHand: active).
- "ASSLEMA" (Hello): Hand in 'flat' state. Starts with palm facing face near the cheek, then moves outward and slightly down with a small flourish. (Expression: smile).
- "CHOKRAN" (Thank you): Hand in 'flat' state. Fingertips touch the chin, then move straight forward toward the listener. (RightLowerArm: 110deg -> 40deg).
- "LABESS" (How are you / Good): Hand in 'point' state (thumb up). Held steady at chest height.
- "EY" (Yes): Hand in 'fist' state. Moves down once firmly. (Head: nod).
- "LE" (No): Hand in 'point' state. Index finger wags left-to-right near the face. (Head: shake).
- "SMEH" (Sorry): Hand in 'flat' state. Placed on the center of the chest with a slight circular motion.
- "MASHGHOUL" (Busy): Hands crossing each other in front of the chest.
- "BOULIS" (Police): Index finger (point) touches the shoulder twice (mimicking epaulettes).

LINGUISTIC CONSTRAINTS:
1. Signing Space: Keep all hand movements within a 50cm radius of the solar plexus/face.
2. Fluidity: Every sign MUST consist of at least two poses (Initial position and Final position) to ensure the user sees the motion, not just a static hand.
3. Facial Grammar: Non-manual markers are essential. Questions (e.g., 'Chnouwa?') require the 'focus' expression (squinted eyes).
`;

const SYSTEM_INSTRUCTION = `
You are a master interpreter for Tunisian Sign Language (TSL). 
Your task is to convert Tunisian Darija text into a sequence of fluid skeletal keyframes for a 3D avatar.

AVATAR CAPABILITIES:
- UpperArm (Shoulder): rotate(-Xdeg)
- LowerArm (Elbow): rotate(Xdeg)
- Hand (Wrist): rotate(Xdeg)
- HandStates: 'flat' (palm), 'fist', 'point' (index finger up), 'spread' (fingers out)
- Expressions: 'neutral', 'smile', 'focus', 'surprised'
- Head: rotate(Xdeg)

${TSL_DICTIONARY_KNOWLEDGE}

ALWAYS return a JSON array of SignAction objects. Each object is one step in the animation sequence.
`;

export const translateToSigns = async (text: string): Promise<SignAction[]> => {
  // Use gemini-3-flash-preview for better quota stability and speed
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${SYSTEM_INSTRUCTION}\n\nTranslate this Darija sentence to a TSL animation: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "The Darija word or motion step" },
              pose: {
                type: Type.OBJECT,
                properties: {
                  rightUpperArm: { type: Type.STRING },
                  rightLowerArm: { type: Type.STRING },
                  rightHand: { type: Type.STRING },
                  leftUpperArm: { type: Type.STRING },
                  leftLowerArm: { type: Type.STRING },
                  leftHand: { type: Type.STRING },
                  head: { type: Type.STRING },
                  expression: { type: Type.STRING },
                  handState: { type: Type.STRING }
                },
                required: ["rightUpperArm", "rightLowerArm", "rightHand", "leftUpperArm", "leftLowerArm", "leftHand", "head", "expression", "handState"]
              },
              duration: { type: Type.NUMBER, description: "Milliseconds to reach this pose" }
            },
            required: ["label", "pose", "duration"]
          }
        }
      }
    });

    const result = response.text;
    if (!result) return [];
    
    return JSON.parse(result.trim());
  } catch (error: any) {
    console.error("TSL Translation Error:", error);
    // If it's a quota error, we might want to return a 'friendly' sign like "Sorry" or just empty
    return [];
  }
};
