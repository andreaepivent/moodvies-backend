const Movie = require("../models/movies");

const sockets = async (io, socket) => {
  // Envoyer une notification lors de l'ajout d'un film
  socket.on("addMovie", async (movieData) => {
    try {
      const movie = await Movie.findOne({ id_tmdb: movieData.title }).lean();
      if (movie) {
        io.emit("movieAdded", movie);
      } else {
        console.error(`Movie with ID ${movieData.title} not found.`);
      }
    } catch (error) {
      console.error("Error fetching movie data:", error);
    }
  });

  // Envoyer une notification lors de la suppression d'un film
  socket.on("deleteMovie", (movieId) => {
    io.emit("movieDeleted", movieId);
  });
};

module.exports = sockets;
