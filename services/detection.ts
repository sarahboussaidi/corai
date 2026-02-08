

// Use backend proxy for sign detection
export const detectSign = async (imageBlob: Blob): Promise<string> => {
  // Convert imageBlob to base64 and get type
  const base64Image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      if(res) resolve(res.split(',')[1]);
      else reject(new Error("Blob failed"));
    };
    reader.readAsDataURL(imageBlob);
  });
  const imageType = imageBlob.type;

  const response = await fetch("http://localhost:5050/sign-detect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: base64Image, imageType }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Sign Proxy Error: ${errText}`);
  }

  const result = await response.json();
  return result.label || "...";
};
