// server/controllers/authController.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/mailer.js';

const prisma = new PrismaClient();

// 🟢 REGISTER
export const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Failed to register' });
  }
};

// 🟢 LOGIN
export const login = async (req, res) => {
    try {
      console.log('Login request received:', req.body); // 👈 LOG THIS
  
      const { email, password } = req.body;
  
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
  
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
  
      res.json({ token });
    } catch (err) {
      console.error('❌ Login error:', err); // 👈 MUST LOG ERROR
      res.status(500).json({ error: 'Login failed' });
    }
  };
  

// 🟢 FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, a reset link will be sent.' });
    }

    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    await sendPasswordResetEmail(email, token);

    res.json({ message: 'Reset link sent to email.' });
  } catch (err) {
    console.error('❌ Forgot password error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

// 🟢 RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    res.status(500).json({ error: 'Reset failed' });
  }
};
