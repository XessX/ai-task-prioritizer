// server/utils/mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Or use a custom SMTP service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a password reset email
 * @param {string} to - Email recipient
 * @param {string} resetToken - Unique token for password reset
 */
export const sendResetEmail = async (to, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"TaskAI Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 Password Reset Instructions',
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click below to proceed:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to: ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
    throw err;
  }
};
