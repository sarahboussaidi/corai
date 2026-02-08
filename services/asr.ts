

// Use backend proxy for ASR
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
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

  const response = await fetch("http://localhost:5050/asr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ audio: base64Audio, audioType }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ASR Proxy Error: ${errText}`);
  }

  const result = await response.json();
  return result.text || "";
};
