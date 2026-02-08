
const express = require('express');
// Use global fetch (Node.js 18+)
const cors = require('cors');
const { Readable } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Helper to convert webm/mp4 audio to wav using ffmpeg
function convertToWav(buffer, inputMimeType) {
  return new Promise((resolve, reject) => {
    const inputStream = new Readable();
    inputStream.push(buffer);
    inputStream.push(null);
    const outputPath = path.join(__dirname, 'temp_' + Date.now() + '.wav');
    ffmpeg(inputStream)
      .inputFormat(inputMimeType.split('/')[1])
      .audioCodec('pcm_s16le')
      .format('wav')
      .on('end', () => {
        fs.readFile(outputPath, (err, data) => {
          fs.unlinkSync(outputPath);
          if (err) reject(err);
          else resolve(data);
        });
      })
      .on('error', reject)
      .save(outputPath);
  });
}

// ASR endpoint: tries Hugging Face, falls back to Gemini if needed
app.post('/asr', async (req, res) => {
  try {
    const { audio, audioType } = req.body;
    const audioBuffer = Buffer.from(audio, 'base64');
    let wavBuffer = audioBuffer;
    let contentType = audioType;
    if (audioType !== 'audio/wav') {
      wavBuffer = await convertToWav(audioBuffer, audioType);
      contentType = 'audio/wav';
    }
    // Try Hugging Face first
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/SalahZa/Tunisian_Automatic_Speech_Recognition', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': contentType,
        },
        body: wavBuffer,
      });
      if (!response.ok) throw new Error(`HF_ERROR_${response.status}`);
      const result = await response.json();
      if (result.text) return res.json(result);
      throw new Error('HF_NO_TEXT');
    } catch (hfError) {
      // Fallback to Gemini
      try {
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error('No Gemini API key');
        // Convert wavBuffer to base64
        const base64Audio = wavBuffer.toString('base64');
        const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + geminiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: {
              parts: [
                { text: "Transcribe the following audio which is in Tunisian Darija dialect. Return ONLY the transcription text in Arabic script. Do not add any introduction or explanation." },
                { inlineData: { mimeType: 'audio/wav', data: base64Audio } }
              ]
            }
          })
        });
        const geminiResult = await geminiRes.json();
        return res.json({ text: geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "" });
      } catch (geminiError) {
        return res.status(500).json({ error: 'ASR_FAILED_ALL_PROVIDERS', details: geminiError.message });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sign detection endpoint: tries Hugging Face, falls back to Gemini if needed
app.post('/sign-detect', async (req, res) => {
  try {
    const { image, imageType } = req.body;
    const imageBuffer = Buffer.from(image, 'base64');
    // Try Hugging Face first
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/MohamedLouayChatti/TunSL_detection', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': imageType || 'image/jpeg',
        },
        body: imageBuffer,
      });
      if (!response.ok) throw new Error(`HF_ERROR_${response.status}`);
      const result = await response.json();
      if (Array.isArray(result) && result.length > 0) {
        const validDetections = result.filter((item) => item.score > 0.55);
        if (validDetections.length > 0) {
          validDetections.sort((a, b) => b.score - a.score);
          return res.json({ label: validDetections[0].label });
        }
      }
      throw new Error('HF_NO_LABEL');
    } catch (hfError) {
      // Fallback to Gemini
      try {
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error('No Gemini API key');
        const base64Image = imageBuffer.toString('base64');
        const FALLBACK_SYSTEM_PROMPT = `Identify the Tunisian Sign Language gesture in the image.\nReturn ONLY the corresponding Arabic word from the list below.\nIf the gesture is unclear or not in the list, return \"...\".\n\nCLASSES:\n1. Hello (Hand Wave/Salute) -> \"عسلامة\"\n2. No (Index Finger Wag/Palm Push) -> \"لا\"\n3. Yes (Fist Nodding) -> \"إيه\"\n4. Sorry (Hand Rubbing Chest) -> \"سامحني\"\n5. Thank You (Hand Touching Chin) -> \"شكراً\"\n6. Me (Index Pointing to Self) -> \"أنا\"\n7. You (Index Pointing to Camera) -> \"إنت\"\n8. Love (Arms Crossed/Heart) -> \"نحب\"\n9. Tunisia (Index Touching Temple) -> \"تونس\"\n10. Money (Thumb rubbing index) -> \"فلوس\"`;
        const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=' + geminiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: {
              parts: [
                { text: FALLBACK_SYSTEM_PROMPT },
                { inlineData: { mimeType: imageType || 'image/jpeg', data: base64Image } }
              ]
            }
          })
        });
        const geminiResult = await geminiRes.json();
        return res.json({ label: geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "..." });
      } catch (geminiError) {
        return res.status(500).json({ error: 'SIGN_FAILED_ALL_PROVIDERS', details: geminiError.message });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
