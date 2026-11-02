import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/status', (req, res) => {
  const hasKey = Boolean(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'your_api_key_here');
  res.json({
    status: 'online',
    nvidiaKeyConfigured: hasKey,
    model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
    timestamp: new Date().toISOString()
  });
});

router.post('/verify-key', async (req, res) => {
  const { apiKey } = req.body;
  const keyToTest = apiKey || process.env.NVIDIA_API_KEY;

  if (!keyToTest || keyToTest === 'your_api_key_here') {
    return res.status(400).json({ valid: false, error: 'No API key provided.' });
  }

  try {
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
        messages: [{ role: 'user', content: 'Say hello in 1 word.' }],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${keyToTest.trim()}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    res.json({
      valid: true,
      message: 'NVIDIA API key verified successfully!',
      sampleReply: response.data?.choices?.[0]?.message?.content?.trim()
    });
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    res.status(400).json({
      valid: false,
      error: `Verification failed: ${errorMsg}`
    });
  }
});

export default router;
