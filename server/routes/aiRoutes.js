// 📄 server/routes/aiRoutes.js

import express from 'express';
import { classifyTask } from '../services/aiClassifier.js';

const router = express.Router();

// 🌟 POST /ai/classify
router.post('/classify', async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const result = await classifyTask(title, description, startDate, endDate);

    return res.json(result); // { priority: "...", status: "..." }
  } catch (error) {
    console.error('❌ AI Route error:', error.message);
    res.status(500).json({ error: 'Internal Server Error in AI classification' });
  }
});

export default router;
