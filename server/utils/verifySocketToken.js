// server/utils/verifySocketToken.js
import jwt from 'jsonwebtoken';

export const verifyTokenSocket = (token) => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error('❌ Socket token invalid:', err.message);
    return null;
  }
};
