const socketIo = require("socket.io");
const sockets = require("./sockets");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = [process.env.FRONTEND_URL]; // Stocker dans le env l'url front (local et déployé)
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
    sockets(io, socket);
  });

  return io;
};
