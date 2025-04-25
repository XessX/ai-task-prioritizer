// server/index.js

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

const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-task-prioritizer.vercel.app'
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.send('🚀 AI Task Prioritizer Backend running');
});

// Middleware to verify token
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

// ➡️ Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, password: hashedPassword } });

    res.status(201).json({ message: 'Registered successfully. Please login.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ➡️ Password Reset Flow
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry }
    });

    await sendResetEmail(email, token);
    res.json({ message: 'Reset email sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Reset process failed' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Missing token or password' });

  try {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gte: new Date() } }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
    });

    res.json({ message: 'Password reset successful. Please login.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Reset failed' });
  }
});

app.post('/api/auth/validate-token', async (req, res) => {
  const { token } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gte: new Date() } }
    });
    res.json({ valid: !!user });
  } catch {
    res.status(500).json({ valid: false });
  }
});

// ➡️ Task Routes
app.get('/api/tasks', verifyToken, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(tasks);
});

app.post('/api/tasks', verifyToken, async (req, res) => {
  const { title, description, startDate, endDate } = req.body;
  const { priority, status } = await classifyTask(title, description, startDate, endDate);

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority,
        status,
        userId: req.user.userId
      }
    });

    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    io.to(req.user.userId).emit('tasks:update', tasks);

    res.status(201).json(task);
  } catch (err) {
    console.error('Task creation error:', err);
    res.status(500).json({ error: 'Task creation failed' });
  }
});

app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  const { title, description, startDate, endDate, status, priority } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        priority
      }
    });

    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    io.to(req.user.userId).emit('tasks:update', tasks);

    res.json(task);
  } catch (err) {
    console.error('Task update error:', err);
    res.status(500).json({ error: 'Task update failed' });
  }
});

app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });

    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    io.to(req.user.userId).emit('tasks:update', tasks);

    res.status(204).send();
  } catch (err) {
    console.error('Task deletion error:', err);
    res.status(500).json({ error: 'Task deletion failed' });
  }
});

// ➡️ Setup WebSocket
const io = new Server(server, { cors: { origin: allowedOrigins } });

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Invalid token'));
    socket.userId = decoded.userId;
    socket.join(socket.userId);
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id} (User ID: ${socket.userId})`);
});

// ➡️ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
