
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/SalahZa/Tunisian_Automatic_Speech_Recognition";

// Helper to handle the HF API call with specific error checks
const queryHuggingFace = async (audioBlob: Blob, apiKey: string): Promise<any> => {
  const headers: Record<string, string> = { 
    "Content-Type": audioBlob.type 
  };
  
  // Only attach header if it looks like a Hugging Face key
  if (apiKey.startsWith("hf_")) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(HF_MODEL_URL, {
    method: "POST",
    headers,
    body: audioBlob,
  });

  if (response.status === 503) {
    const errorData = await response.json();
    const estimatedTime = errorData.estimated_time || 5;
    console.log(`Model loading... estimated wait: ${estimatedTime}s`);
    throw new Error(`MODEL_LOADING:${estimatedTime}`);
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error("HF API Error:", errText);
    throw new Error(`HF_ERROR_${response.status}`);
  }

  return await response.json();
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const apiKey = process.env.API_KEY || "";
  const MAX_RETRIES = 10; // Allow sufficient attempts for cold boot
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const result = await queryHuggingFace(audioBlob, apiKey);
      return result.text || "";
    } catch (error: any) {
      if (typeof error.message === 'string' && error.message.startsWith("MODEL_LOADING")) {
        attempt++;
        const waitTime = parseFloat(error.message.split(':')[1]) || 3;
        // Wait based on estimation or default 3s, capped at 10s to be responsive
        await new Promise(r => setTimeout(r, Math.min(waitTime * 1000, 10000)));
        continue;
      }
      
      // If it's a permanent error or we ran out of retries
      console.error("ASR Failed:", error);
      throw error;
    }
  }
  
  throw new Error("ASR_TIMEOUT");
};
