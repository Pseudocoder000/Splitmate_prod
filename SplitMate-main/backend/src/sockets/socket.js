const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  if (io) {
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join-group', (groupId) => {
      if (groupId) {
        socket.join(groupId);
      }
    });

    socket.on('leave-group', (groupId) => {
      if (groupId) {
        socket.leave(groupId);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }

  return io;
};

module.exports = {
  initSocket,
  getIO,
};
