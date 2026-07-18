const { getIO } = require('./socket');

const emitGroupUpdate = (groupId) => {
  try {
    const io = getIO();
    io.emit('group:update', { groupId });
  } catch {
    // Ignore if the socket server is not initialized yet.
  }
};

module.exports = {
  emitGroupUpdate,
};
