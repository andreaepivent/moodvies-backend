const express = require("express");
const router = express.Router();
const Movie = require("../models/movies");
const { updateMood } = require("../modules/updateMood");
const fetch = require("node-fetch");

// Route pour mettre à jour le mood de tous les films dans la BDD
router.get("/", async (req, res) => {
  try {
    let i = 0;
    const movies = await Movie.find();
    for (let movie of movies) {
      try {
        console.log(i); // Tracker l'avancement du code
        await updateMood(movie._id);
        console.log(`Updated mood for movie: ${movie.title.en}`);
        i++;
      } catch (error) {
        console.error(
          `Failed to update mood for movie: ${movie.title.en}`,
          error
        );
      }
    }
    res.status(200).send("All movie moods updated");
  } catch (error) {
    res.status(500).send("An error occurred while updating movie moods");
  }
});

// Route pour obtenir les valeurs distinctes des mood des films dans notre bdd et leur nombre d'occurrences
router.get('/distinctMoods', async (req, res) => {
    try {
      const distinctMoodsEn = await Movie.aggregate([
        { $group: { _id: "$mood.en", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      const distinctMoodsFr = await Movie.aggregate([
        { $group: { _id: "$mood.fr", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
  
      res.status(200).json({
        englishMoods: distinctMoodsEn,
        frenchMoods: distinctMoodsFr
      });
    } catch (error) {
      console.error('Failed to fetch distinct moods', error);
      res.status(500).send('An error occurred while fetching distinct moods');
    }
  });

module.exports = router;
