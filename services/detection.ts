
import { GoogleGenAI } from "@google/genai";

const HF_MODEL_URL = "https://api-inference.huggingface.co/models/MohamedLouayChatti/TunSL_detection";

// STRICT Classification Prompt
const FALLBACK_SYSTEM_PROMPT = `
Identify the Tunisian Sign Language gesture in the image.
Return ONLY the corresponding Arabic word from the list below.
If the gesture is unclear or not in the list, return "...".

CLASSES:
1. Hello (Hand Wave/Salute) -> "عسلامة"
2. No (Index Finger Wag/Palm Push) -> "لا"
3. Yes (Fist Nodding) -> "إيه"
4. Sorry (Hand Rubbing Chest) -> "سامحني"
5. Thank You (Hand Touching Chin) -> "شكراً"
6. Me (Index Pointing to Self) -> "أنا"
7. You (Index Pointing to Camera) -> "إنت"
8. Love (Arms Crossed/Heart) -> "نحب"
9. Tunisia (Index Touching Temple) -> "تونس"
10. Money (Thumb rubbing index) -> "فلوس"
`;

// --- SMOOTHING BUFFER ---
const PREDICTION_BUFFER_SIZE = 4;
let predictionBuffer: string[] = [];

const getSmoothedPrediction = (newPrediction: string): string => {
  if (newPrediction === "QUOTA_HIT") return newPrediction;
  
  const vote = (newPrediction === "" || newPrediction === "...") ? "SILENCE" : newPrediction;
  
  predictionBuffer.push(vote);
  if (predictionBuffer.length > PREDICTION_BUFFER_SIZE) {
    predictionBuffer.shift();
  }

  // Voting mechanism
  const counts: Record<string, number> = {};
  let maxCount = 0;
  let winner = "SILENCE";

  for (const p of predictionBuffer) {
    counts[p] = (counts[p] || 0) + 1;
    if (counts[p] > maxCount) {
      maxCount = counts[p];
      winner = p;
    }
  }

  // Majority threshold: Requires at least 2 frames of agreement
  if (winner !== "SILENCE" && maxCount >= 2) {
    return winner;
  }
  
  return "";
};

const recognizeWithGemini = async (imageBlob: Blob): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        if(res) resolve(res.split(',')[1]);
        else reject(new Error("Blob failed"));
      };
      reader.readAsDataURL(imageBlob);
    });

    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest", 
      contents: {
        parts: [
          { text: FALLBACK_SYSTEM_PROMPT },
          { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ]
      }
    });

    const text = response.text?.trim() || "";
    // Sanity check: ensure result is Arabic or "..."
    if (text !== "..." && !/[\u0600-\u06FF]/.test(text)) {
        return "...";
    }
    return text;
  } catch (error: any) {
    if (error.status === 429 || error.code === 429 || error.message?.includes('quota') || error.message?.includes('429')) {
        return "QUOTA_HIT";
    }
    console.error("Gemini Vision Error:", error);
    return "";
  }
};

export const detectSign = async (imageBlob: Blob): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const isHuggingFaceKey = apiKey.startsWith("hf_");
  
  let rawResult = "";

  if (!isHuggingFaceKey) {
     rawResult = await recognizeWithGemini(imageBlob);
     return getSmoothedPrediction(rawResult);
  }

  const headers: Record<string, string> = {
    "Content-Type": imageBlob.type,
    "Authorization": `Bearer ${apiKey}`
  };

  try {
    const response = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers,
      body: imageBlob,
    });

    if (!response.ok) {
      // 503 (Model loading) or 429 (Rate limit) -> Fallback
      rawResult = await recognizeWithGemini(imageBlob);
    } else {
      const result = await response.json();
      
      if (Array.isArray(result) && result.length > 0) {
        const validDetections = result.filter((item: any) => item.score > 0.55);
        if (validDetections.length > 0) {
          validDetections.sort((a: any, b: any) => b.score - a.score);
          rawResult = validDetections[0].label;
        }
      }
    }
  } catch (error) {
    rawResult = await recognizeWithGemini(imageBlob);
  }
  
  return getSmoothedPrediction(rawResult);
};
