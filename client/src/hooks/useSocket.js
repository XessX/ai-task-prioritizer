// 📄 src/hooks/useSocket.js

import { useEffect } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (setTasks, token, guestMode) => {
  useEffect(() => {
    if (!token || guestMode) return; // 🛡️ Don't connect if guest or no token

    // ✨ Build correct Socket URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    let baseSocketUrl = apiBaseUrl.replace('/api', '');

    // Fix for production (vercel + railway)
    if (baseSocketUrl.startsWith('https://')) {
      baseSocketUrl = baseSocketUrl.replace('https://', 'wss://');
    } else if (baseSocketUrl.startsWith('http://')) {
      baseSocketUrl = baseSocketUrl.replace('http://', 'ws://');
    }

    const socket = io(baseSocketUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('🟢 Connected to Socket.IO:', socket.id);
    });

    socket.on('tasks:update', (tasks) => {
      console.log('📦 tasks:update received:', tasks);
      setTasks(tasks);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Socket.IO connection error:', error.message || error);
    });

    socket.on('disconnect', (reason) => {
      console.warn('🔴 Socket disconnected:', reason);
    });

    return () => {
      socket.disconnect();
      console.log('🔴 Socket manually disconnected');
    };
  }, [token, guestMode, setTasks]);
};
