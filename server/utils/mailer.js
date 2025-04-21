// server/utils/mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const html = `
    <h2>🔐 Reset Your Password</h2>
    <p>Click below to reset:</p>
    <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#007BFF;color:#fff;border-radius:4px;text-decoration:none;">Reset Password</a>
    <p>This link will expire in 15 minutes.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔐 Password Reset - AI Tasker',
      html,
    });
    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};
