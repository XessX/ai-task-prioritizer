import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendResetEmail } from './utils/mailer.js';
import { classifyTask } from './services/aiClassifier.js';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

// Allow both local and production frontend URLs for development and deployment
const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-task-prioritizer.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized - No token provided' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid Token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashedPassword } });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const token = crypto.randomUUID();
  const expiry = new Date(Date.now() + 3600000);

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  await sendResetEmail(email, token);
  res.json({ message: 'Reset email sent.' });
});

// Task Routes
app.get('/api/tasks', verifyToken, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tasks);
});

app.post('/api/tasks', verifyToken, async (req, res) => {
  const { title, description, dueDate } = req.body;
  const { priority, status } = await classifyTask(title, description);

  const task = await prisma.task.create({
    data: { title, description, priority, status, dueDate: dueDate ? new Date(dueDate) : null, userId: req.user.userId },
  });

  io.to(req.user.userId).emit('tasks:update', await prisma.task.findMany({ where: { userId: req.user.userId } }));
  res.status(201).json(task);
});

app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  const task = await prisma.task.update({ where: { id: req.params.id }, data: req.body });
  io.to(req.user.userId).emit('tasks:update', await prisma.task.findMany({ where: { userId: req.user.userId } }));
  res.json(task);
});

app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  io.to(req.user.userId).emit('tasks:update', await prisma.task.findMany({ where: { userId: req.user.userId } }));
  res.status(204).send();
});

// Socket.IO setup with authentication
const io = new Server(server, {
  cors: { origin: allowedOrigins },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.join(socket.userId);
    next();
  } catch {
    next(new Error('Invalid Token'));
  }
});

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id} (User ID: ${socket.userId})`);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
