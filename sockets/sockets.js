const sockets = async (io, socket) => {
  // Envoyer une notification lors de l'ajout d'un film

  socket.on("addMovie", (movieData) => {
    const { title, date } = movieData;
    io.emit("movieAdded", movieData);
  });

  // Envoyer une notification lors de la suppression d'un film
  socket.on("deleteMovie", (movieId) => {
    io.emit("movieDeleted", movieId);
  });
};

module.exports = sockets;
