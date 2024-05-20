var express = require('express');
var router = express.Router();
const Movie = require('../models/Movies')

/* GET home page. */
router.post('/', async (req, res) => {
    const { movieId } = req.body;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).send('Movie not found');
    }
  
    try {
      const response = await fetch('http://localhost:3000/analyze_emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ synopsis: movie.synopsis })
      });
  
      const data = await response.json();
      const mood = data.emotion;
  
      movie.mood = mood;
      await movie.save();
  
      res.send(`Movie mood updated to ${mood}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error analyzing emotion');
    }
  });

module.exports = router;
