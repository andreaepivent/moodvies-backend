const socketIo = require("socket.io");
const sockets = require("./sockets");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = [
          "http://localhost:3000",
          "http://localhost:3001",
          "https://moodvies-frontend-web.vercel.app",
          "https://site--moodvies--5xx8wnrqybfd.code.run/",
          "https://moodvies-frontend-aounwd7i9-andreaepvs-projects.vercel.app",
          "https://moodvies-frontend-web-git-dev-andreaepvs-projects.vercel.app",
          "https://moodvies-frontend-web-lszq.vercel.app",
        ]; // Stocker dans le env l'url front (local et déployé)
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
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
