// src/hooks/useSocket.js
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (setTasks, token, guestMode) => {
  useEffect(() => {
    if (!token || guestMode) return; // 🛡️ Skip socket for guests

    // Build correct socket URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    let socketBaseUrl = apiBaseUrl.replace('/api', '');

    // For production - use WebSocket (wss://)
    if (socketBaseUrl.startsWith('https://')) {
      socketBaseUrl = socketBaseUrl.replace('https://', 'wss://');
    } else if (socketBaseUrl.startsWith('http://')) {
      socketBaseUrl = socketBaseUrl.replace('http://', 'ws://');
    }

    const socket = io(socketBaseUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
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
      console.error('🔴 Socket connection error:', error.message || error);
    });

    socket.on('disconnect', (reason) => {
      console.warn('🔴 Socket disconnected:', reason);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        console.log('🔴 Socket manually disconnected');
      }
    };
  }, [token, guestMode, setTasks]);
};
