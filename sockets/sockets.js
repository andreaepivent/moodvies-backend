const Movie = require("../models/movies");

const sockets = async (io, socket) => {
  // Envoyer une notification lors de l'ajout d'un film

  socket.on("addMovie", async (movieData) => {
    const movie = await Movie.findOne({ id_tmdb: movieData.title }).lean();
    io.emit("movieAdded", movie);
  });

  // Envoyer une notification lors de la suppression d'un film
  socket.on("deleteMovie", (movieId) => {
    io.emit("movieDeleted", movieId);
  });
};

module.exports = sockets;
