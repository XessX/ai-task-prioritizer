// server/socket.js
import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('📡 New connection:', socket.id);

    socket.on('task:add', () => io.emit('refresh'));
    socket.on('task:update', () => io.emit('refresh'));
    socket.on('task:delete', () => io.emit('refresh'));

    socket.on('disconnect', () => {
      console.log('❌ Disconnected:', socket.id);
    });
  });
};

export const getIO = () => io;
