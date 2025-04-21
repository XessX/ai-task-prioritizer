// server/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();

// 🔐 Allow localhost + production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-task-prioritizer.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ✅ Route setup
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 🧪 Health check route
app.get('/api', (_, res) => res.send('✅ AI Task Prioritizer API is up!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
