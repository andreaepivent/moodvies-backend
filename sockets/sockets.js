const sockets = async (io, socket) => {
  socket.on("connection", function (socket) {
    console.log("a user connected");
  });

  // Envoyer une notification lors de l'ajout d'un film

  socket.on("addMovie", (movie) => {
    io.emit("movieAdded", movie);
  });

  socket.on("addDate", (movie) => {
    io.emit("dateAdded", movie);
  });

  // Envoyer une notification lors de la suppression d'un film
  socket.on("deleteMovie", (movieId) => {
    io.emit("movieDeleted", movieId);
  });
};

module.exports = sockets;
