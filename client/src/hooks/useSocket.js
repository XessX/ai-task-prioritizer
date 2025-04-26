// src/hooks/useSocket.js

import { useEffect } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (setTasks, token, guestMode) => {
  useEffect(() => {
    if (!token || guestMode) return; // 🛡️ Guest mode: No socket connect

    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 3,
    });

    socket.on('connect', () => console.log('🟢 Connected to Socket.IO:', socket.id));
    socket.on('tasks:update', (tasks) => {
      console.log('📦 tasks:update received:', tasks);
      setTasks(tasks);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message || error);
    });

    return () => {
      socket.disconnect();
      console.log('🔴 Socket disconnected');
    };
  }, [token, guestMode, setTasks]);
};
