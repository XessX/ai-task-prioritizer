import { useEffect } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (setTasks, token) => {
  useEffect(() => {
    if (!token) return;
    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => console.log('🟢 Connected to Socket.IO:', socket.id));
    socket.on('tasks:update', (tasks) => setTasks(tasks));
    socket.on('connect_error', (error) => console.error('🔴 Connection Error:', error));

    return () => socket.disconnect();
  }, [token, setTasks]);
};
