
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { SignAction, SignPose } from "../types";
import { DEFAULT_POSE } from "../constants";

// --- TSL DATASET KINEMATICS ---
// These poses correspond strictly to the classes found in TSL datasets (Roboflow/Kaggle).
// Coordinates: X (Forward/Back), Y (Side/Side), Z (Twist/Rotation)

const POSES = {
  NEUTRAL: DEFAULT_POSE,

  // --- GREETINGS ---
  // "عسلامة" (Hello): Hand raise + Wave
  SALUTE_RAISE: { ...DEFAULT_POSE, rightUpperArm: { x: 0, y: 0, z: 130 }, rightLowerArm: { x: 90, y: 0, z: 0 }, expression: 'smile', handState: 'flat' } as SignPose,
  SALUTE_WAVE_L: { ...DEFAULT_POSE, rightUpperArm: { x: 0, y: 0, z: 130 }, rightLowerArm: { x: 90, y: 20, z: 0 }, rightHand: { x: 0, y: 0, z: -20 }, expression: 'smile', handState: 'flat' } as SignPose,
  SALUTE_WAVE_R: { ...DEFAULT_POSE, rightUpperArm: { x: 0, y: 0, z: 130 }, rightLowerArm: { x: 90, y: -20, z: 0 }, rightHand: { x: 0, y: 0, z: 20 }, expression: 'smile', handState: 'flat' } as SignPose,

  // --- BASICS ---
  // "لا" (No): Index finger wag near chest
  NO_START: { ...DEFAULT_POSE, rightUpperArm: { x: 20, y: 20, z: 20 }, rightLowerArm: { x: 120, y: 0, z: 0 }, handState: 'point', expression: 'focus' } as SignPose,
  NO_LEFT: { ...DEFAULT_POSE, rightUpperArm: { x: 20, y: 20, z: 20 }, rightLowerArm: { x: 120, y: 0, z: -20 }, handState: 'point', expression: 'focus', head: { x: 0, y: 10, z: 0 } } as SignPose,
  NO_RIGHT: { ...DEFAULT_POSE, rightUpperArm: { x: 20, y: 20, z: 20 }, rightLowerArm: { x: 120, y: 0, z: 20 }, handState: 'point', expression: 'focus', head: { x: 0, y: -10, z: 0 } } as SignPose,

  // "إيه" (Yes): Fist nodding
  YES_UP: { ...DEFAULT_POSE, rightUpperArm: { x: 40, y: 0, z: 40 }, rightLowerArm: { x: 110, y: 0, z: 0 }, handState: 'fist', expression: 'smile', head: { x: -10, y: 0, z: 0 } } as SignPose,
  YES_DOWN: { ...DEFAULT_POSE, rightUpperArm: { x: 30, y: 0, z: 40 }, rightLowerArm: { x: 90, y: 0, z: 0 }, handState: 'fist', expression: 'smile', head: { x: 10, y: 0, z: 0 } } as SignPose,

  // "نحب" (Love): Arms crossed over chest (Dataset Standard)
  LOVE_PREP: { ...DEFAULT_POSE, rightUpperArm: { x: 0, y: 0, z: 40 }, leftUpperArm: { x: 0, y: 0, z: -40 }, expression: 'smile', handState: 'flat' } as SignPose,
  LOVE_HUG: { ...DEFAULT_POSE, rightUpperArm: { x: 40, y: -40, z: 70 }, rightLowerArm: { x: 120, y: 0, z: 0 }, leftUpperArm: { x: 40, y: 40, z: -70 }, leftLowerArm: { x: 120, y: 0, z: 0 }, expression: 'smile', handState: 'fist' } as SignPose,

  // "تونس" (Tunisia): Index twisting at temple
  TUNISIA_TOUCH: { ...DEFAULT_POSE, rightUpperArm: { x: 0, y: 0, z: 120 }, rightLowerArm: { x: 130, y: 0, z: 0 }, rightHand: { x: 20, y: 0, z: 0 }, handState: 'point', head: { x: 0, y: 0, z: 5 } } as SignPose,
  TUNISIA_TWIST: { ...DEFAULT_POSE, rightUpperArm: { x: 0, y: 0, z: 120 }, rightLowerArm: { x: 130, y: 0, z: 30 }, handState: 'point', head: { x: 0, y: 0, z: 5 }, expression: 'smile' } as SignPose,

  // "أنا" (Me): Point to chest
  ME: { ...DEFAULT_POSE, rightUpperArm: { x: 30, y: 0, z: 20 }, rightLowerArm: { x: 130, y: 0, z: 0 }, rightHand: { x: -20, y: 0, z: 0 }, handState: 'point' } as SignPose,

  // "إنت" (You): Point forward
  YOU: { ...DEFAULT_POSE, rightUpperArm: { x: 70, y: 0, z: 10 }, rightLowerArm: { x: 20, y: 0, z: 0 }, handState: 'point' } as SignPose,

  // "شكراً" (Thanks): Hand flat on chin moving out
  THANKS_CHIN: { ...DEFAULT_POSE, rightUpperArm: { x: 40, y: 0, z: 40 }, rightLowerArm: { x: 140, y: 0, z: 0 }, handState: 'flat', expression: 'smile' } as SignPose,
  THANKS_OUT: { ...DEFAULT_POSE, rightUpperArm: { x: 50, y: 0, z: 20 }, rightLowerArm: { x: 40, y: 0, z: 0 }, handState: 'flat', expression: 'smile', head: { x: 10, y: 0, z: 0 } } as SignPose,

  // "سامحني" (Sorry): Rub chest circular
  SORRY_START: { ...DEFAULT_POSE, rightUpperArm: { x: 20, y: 0, z: 40 }, rightLowerArm: { x: 130, y: 20, z: 0 }, handState: 'flat', expression: 'sad' } as SignPose,
  SORRY_RUB: { ...DEFAULT_POSE, rightUpperArm: { x: 20, y: 0, z: 40 }, rightLowerArm: { x: 130, y: -20, z: 0 }, handState: 'flat', expression: 'sad' } as SignPose,

  // "فلوس" (Money): Finger rub
  MONEY_UP: { ...DEFAULT_POSE, rightUpperArm: { x: 40, y: 0, z: 30 }, rightLowerArm: { x: 110, y: 0, z: 0 }, handState: 'o-shape' } as SignPose,
  MONEY_RUB: { ...DEFAULT_POSE, rightUpperArm: { x: 40, y: 0, z: 30 }, rightLowerArm: { x: 110, y: 0, z: 0 }, handState: 'flat' } as SignPose, // Quick switch o-shape to flat mimics rubbing

  // "دار" (House): Roof shape with both hands
  HOUSE: { ...DEFAULT_POSE, rightUpperArm: {x:50,y:0,z:20}, rightLowerArm: {x:90,y:40,z:0}, leftUpperArm: {x:50,y:0,z:-20}, leftLowerArm: {x:90,y:-40,z:0}, handState: 'flat' } as SignPose,

  // "ياكل" (Eat): Hand to mouth
  EAT_UP: { ...DEFAULT_POSE, rightUpperArm: {x:40,y:0,z:30}, rightLowerArm: {x:120,y:0,z:0}, handState: 'o-shape', expression: 'smile' } as SignPose,
  EAT_DOWN: { ...DEFAULT_POSE, rightUpperArm: {x:40,y:0,z:30}, rightLowerArm: {x:100,y:0,z:0}, handState: 'o-shape', expression: 'smile' } as SignPose,

  // "يشرب" (Drink): C-shape to mouth
  DRINK: { ...DEFAULT_POSE, rightUpperArm: {x:40,y:0,z:30}, rightLowerArm: {x:110,y:0,z:20}, handState: 'c-shape' } as SignPose,
};

// --- DICTIONARY MAPPING ---
// Maps both Arabic (Standard/Darija) and Latin (Arabizi) to TSL sequences.
const BASE_DICTIONARY: Record<string, SignAction[]> = {
  // GREETINGS
  "asslema": [{ label: "Hello", duration: 1000, pose: POSES.SALUTE_WAVE_R }],
  "عسلامة": [{ label: "Hello", duration: 1000, pose: POSES.SALUTE_WAVE_R }],
  "salam": [{ label: "Hello", duration: 1000, pose: POSES.SALUTE_WAVE_R }],
  "bye": [{ label: "Bye", duration: 1000, pose: POSES.SALUTE_WAVE_L }],
  "beslema": [{ label: "Bye", duration: 1000, pose: POSES.SALUTE_WAVE_L }],
  "بسلامة": [{ label: "Bye", duration: 1000, pose: POSES.SALUTE_WAVE_L }],

  // YES/NO
  "le": [{ label: "No", duration: 800, pose: POSES.NO_LEFT }],
  "la": [{ label: "No", duration: 800, pose: POSES.NO_LEFT }],
  "لا": [{ label: "No", duration: 800, pose: POSES.NO_LEFT }],
  "ey": [{ label: "Yes", duration: 800, pose: POSES.YES_UP }],
  "na3am": [{ label: "Yes", duration: 800, pose: POSES.YES_UP }],
  "إيه": [{ label: "Yes", duration: 800, pose: POSES.YES_UP }],
  "نعم": [{ label: "Yes", duration: 800, pose: POSES.YES_UP }],

  // PRONOUNS
  "ena": [{ label: "Me", duration: 800, pose: POSES.ME }],
  "ana": [{ label: "Me", duration: 800, pose: POSES.ME }],
  "أنا": [{ label: "Me", duration: 800, pose: POSES.ME }],
  "inti": [{ label: "You", duration: 800, pose: POSES.YOU }],
  "enti": [{ label: "You", duration: 800, pose: POSES.YOU }],
  "إنت": [{ label: "You", duration: 800, pose: POSES.YOU }],

  // KEYWORDS
  "nheb": [{ label: "Love", duration: 1500, pose: POSES.LOVE_HUG }],
  "nhabek": [{ label: "Love", duration: 1500, pose: POSES.LOVE_HUG }],
  "نحب": [{ label: "Love", duration: 1500, pose: POSES.LOVE_HUG }],
  "love": [{ label: "Love", duration: 1500, pose: POSES.LOVE_HUG }],
  
  "tounes": [{ label: "Tunisia", duration: 1200, pose: POSES.TUNISIA_TWIST }],
  "tunisie": [{ label: "Tunisia", duration: 1200, pose: POSES.TUNISIA_TWIST }],
  "تونس": [{ label: "Tunisia", duration: 1200, pose: POSES.TUNISIA_TWIST }],

  "chokran": [{ label: "Thanks", duration: 1000, pose: POSES.THANKS_OUT }],
  "merci": [{ label: "Thanks", duration: 1000, pose: POSES.THANKS_OUT }],
  "y3aychek": [{ label: "Thanks", duration: 1000, pose: POSES.THANKS_OUT }],
  "يعيشك": [{ label: "Thanks", duration: 1000, pose: POSES.THANKS_OUT }],
  "شكراً": [{ label: "Thanks", duration: 1000, pose: POSES.THANKS_OUT }],

  "samahni": [{ label: "Sorry", duration: 1200, pose: POSES.SORRY_RUB }],
  "sorry": [{ label: "Sorry", duration: 1200, pose: POSES.SORRY_RUB }],
  "سامحني": [{ label: "Sorry", duration: 1200, pose: POSES.SORRY_RUB }],

  "flous": [{ label: "Money", duration: 800, pose: POSES.MONEY_UP }],
  "money": [{ label: "Money", duration: 800, pose: POSES.MONEY_UP }],
  "فلوس": [{ label: "Money", duration: 800, pose: POSES.MONEY_UP }],

  "dar": [{ label: "House", duration: 1000, pose: POSES.HOUSE }],
  "dyar": [{ label: "House", duration: 1000, pose: POSES.HOUSE }],
  "دار": [{ label: "House", duration: 1000, pose: POSES.HOUSE }],

  "mekla": [{ label: "Eat", duration: 1000, pose: POSES.EAT_UP }],
  "nekel": [{ label: "Eat", duration: 1000, pose: POSES.EAT_UP }],
  "ياكل": [{ label: "Eat", duration: 1000, pose: POSES.EAT_UP }],
  "ma": [{ label: "Drink", duration: 1000, pose: POSES.DRINK }],
  "nochrob": [{ label: "Drink", duration: 1000, pose: POSES.DRINK }],
  "يشرب": [{ label: "Drink", duration: 1000, pose: POSES.DRINK }],
};

const SYSTEM_INSTRUCTION_ANIM = `
You are a Tunisian Sign Language (TSL) Expert.
Your task is to translate Tunisian Darija text into a sequence of TSL signs.

RULES:
1.  OUTPUT MUST BE STRICTLY VALID TSL. Do not invent random gestures.
2.  If a word matches a standard TSL sign (like Hello, Love, Tunisia, Money, Eat, House), use a pose that matches its visual description.
3.  Format your output as a JSON array of animation frames.
4.  For the "pose" object, use 3D Euler angles {x, y, z}.
    - Right Arm: x=Forward, y=Side, z=Twist.
    - Hand State: 'flat', 'fist', 'point', 'o-shape', 'c-shape'.
5.  If a word is abstract and has no sign, you may omit it or use a "neutral" pause.

CONTEXT:
- "Tunisia" = Index touching temple twisting.
- "Love" = Arms crossed on chest.
- "Money" = Rubbing fingers (o-shape).
- "Eat" = Hand to mouth (o-shape).
`;

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      label: { type: Type.STRING },
      duration: { type: Type.NUMBER },
      pose: {
        type: Type.OBJECT,
        properties: {
          rightUpperArm: { type: Type.OBJECT, properties: { x: {type:Type.NUMBER}, y: {type:Type.NUMBER}, z: {type:Type.NUMBER} } },
          rightLowerArm: { type: Type.OBJECT, properties: { x: {type:Type.NUMBER}, y: {type:Type.NUMBER}, z: {type:Type.NUMBER} } },
          rightHand: { type: Type.OBJECT, properties: { x: {type:Type.NUMBER}, y: {type:Type.NUMBER}, z: {type:Type.NUMBER} } },
          leftUpperArm: { type: Type.OBJECT, properties: { x: {type:Type.NUMBER}, y: {type:Type.NUMBER}, z: {type:Type.NUMBER} } },
          leftLowerArm: { type: Type.OBJECT, properties: { x: {type:Type.NUMBER}, y: {type:Type.NUMBER}, z: {type:Type.NUMBER} } },
          leftHand: { type: Type.OBJECT, properties: { x: {type:Type.NUMBER}, y: {type:Type.NUMBER}, z: {type:Type.NUMBER} } },
          head: { type: Type.OBJECT, properties: { x: {type:Type.NUMBER}, y: {type:Type.NUMBER}, z: {type:Type.NUMBER} } },
          expression: { type: Type.STRING, enum: ['neutral', 'smile', 'focus', 'surprised', 'sad', 'angry'] },
          handState: { type: Type.STRING, enum: ['flat', 'fist', 'point', 'spread', 'two', 'three', 'four', 'thumb-up', 'bent-hand', 'c-shape', 'o-shape'] }
        },
        required: ["rightUpperArm", "rightLowerArm", "rightHand", "leftUpperArm", "leftLowerArm", "leftHand", "head", "expression", "handState"]
      }
    },
    required: ["label", "pose", "duration"]
  }
};

export const translateToSigns = async (text: string): Promise<SignAction[]> => {
  const normalized = text.toLowerCase().trim().replace(/[^\w\s\u0600-\u06FF]/gi, '');
  const words = normalized.split(/\s+/);
  
  let combinedActions: SignAction[] = [];
  let unknownWords: string[] = [];

  for (const word of words) {
    if (BASE_DICTIONARY[word]) {
      // Add a small return-to-neutral between distinct signs for clarity
      if (combinedActions.length > 0) {
        combinedActions.push({ label: "transition", duration: 300, pose: DEFAULT_POSE });
      }
      combinedActions = [...combinedActions, ...BASE_DICTIONARY[word]];
    } else {
      unknownWords.push(word);
    }
  }

  // If we found everything in the dictionary, return immediately (Fast & Accurate)
  if (unknownWords.length === 0) {
    combinedActions.push({ label: "Rest", duration: 500, pose: POSES.NEUTRAL });
    return combinedActions;
  }

  // Fallback to AI only for unknown words, strictly enforcing TSL rules
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest", 
      contents: `${SYSTEM_INSTRUCTION_ANIM}\n\nTranslate these specific words to TSL Animation: "${unknownWords.join(' ')}"`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const txt = response.text || "[]";
    const generated = JSON.parse(txt);
    
    // Add generated signs to the sequence
    if (combinedActions.length > 0 && generated.length > 0) {
         combinedActions.push({ label: "transition", duration: 300, pose: DEFAULT_POSE });
    }
    
    const finalSequence = [...combinedActions, ...generated];
    finalSequence.push({ label: "Rest", duration: 500, pose: POSES.NEUTRAL });
    
    return finalSequence;
  } catch (error: any) {
    if (error.status === 429 || error.code === 429 || error.message?.includes('quota')) {
        throw new Error("QUOTA_EXHAUSTED");
    }
    console.error("TSL Animation Error:", error);
    // If AI fails, return what we have from the dictionary
    return combinedActions.length > 0 ? combinedActions : [];
  }
};

// --- TTS IMPLEMENTATION (Gemini 2.5 Flash TTS) ---

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let ttsAudioContext: AudioContext | null = null;
let currentTtsSource: AudioBufferSourceNode | null = null;

export const playTunisianTTS = async (text: string) => {
  if (!ttsAudioContext) {
    ttsAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  if (ttsAudioContext.state === 'suspended') {
    await ttsAudioContext.resume();
  }

  // Stop previous utterance if any
  if (currentTtsSource) {
    try { currentTtsSource.stop(); } catch(e) {}
    currentTtsSource = null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prompt engineering to encourage dialect
  const prompt = `Say in Tunisian Arabic: ${text}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio returned from API");

  const audioBytes = decodeBase64(base64Audio);
  const audioBuffer = await decodeAudioData(audioBytes, ttsAudioContext);
  
  const source = ttsAudioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ttsAudioContext.destination);
  
  currentTtsSource = source;
  source.onended = () => { if (currentTtsSource === source) currentTtsSource = null; };
  
  source.start();
};
