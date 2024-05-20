var express = require('express');
var router = express.Router();
const Movie = require("../models/movies");

/* Récupérer le mood d'un film */
router.post('/', async (req, res) => {
    const { movieId } = req.body;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).send('Movie not found');
    }
  
    try {
      // On fait appel à notre code Python pour faire de l'analyse de sentiment à partir du synopsis
      // Le serveur Flask doit tourner en même temps que le backend
      const response = await fetch('http://localhost:5000/sentiment_analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ synopsis: movie.synopsis })
      });
  
      const data = await response.json();
      const mood = data.emotion;
  
      // On update la valeur mood dans le document
      movie.mood = mood;
      await movie.save();
  
      res.send(`Movie mood updated to ${mood}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error analyzing emotion');
    }
  });

module.exports = router;
