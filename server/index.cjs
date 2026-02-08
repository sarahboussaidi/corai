const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;


// Use robust CORS middleware for all routes
app.use(cors());

app.use(express.json());

app.post('/asr', async (req, res) => {
  try {
    const { audio, audioType } = req.body;
    const audioBuffer = Buffer.from(audio, 'base64');
    const contentType = audioType || 'audio/webm';
    const response = await fetch('https://api-inference.huggingface.co/models/SalahZa/Tunisian_Automatic_Speech_Recognition', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': contentType,
      },
      body: audioBuffer,
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
