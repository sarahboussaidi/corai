
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/SalahZa/Tunisian_Automatic_Speech_Recognition";

// Helper to handle the proxy call to backend for ASR
const queryHuggingFace = async (audioBlob: Blob): Promise<any> => {

  // Convert audioBlob to base64 and get type
  const base64Audio = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      if(res) resolve(res.split(',')[1]);
      else reject(new Error("Blob failed"));
    };
    reader.readAsDataURL(audioBlob);
  });
  const audioType = audioBlob.type;

  const response = await fetch("http://localhost:5000/asr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ audio: base64Audio, audioType }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Proxy ASR Error:", errText);
    throw new Error(`PROXY_ERROR_${response.status}`);
  }

  return await response.json();
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const result = await queryHuggingFace(audioBlob);
    return result.text || "";
  } catch (error: any) {
    console.error("ASR Failed:", error);
    throw error;
  }
};
