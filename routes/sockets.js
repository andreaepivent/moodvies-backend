const express = require("express");
const router = express.Router();

module.exports = (io) => {
  // Route pour ajouter un film
  router.post("/add-movie", (req, res) => {
    const movie = req.body;
    // Logique pour ajouter le film à la base de données
    io.emit("movieAdded", movie); // Émettre l'événement via Socket.io
    res.status(201).send(movie);
  });

  // Route pour supprimer un film
  router.delete("/delete-movie/:id", (req, res) => {
    const movieId = req.params.id;
    // Logique pour supprimer le film de la base de données
    io.emit("movieDeleted", movieId); // Émettre l'événement via Socket.io
    res.status(200).send({ id: movieId });
  });

  return router;
};
