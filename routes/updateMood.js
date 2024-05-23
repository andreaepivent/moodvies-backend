const express = require("express");
const router = express.Router();
const Movie = require("../models/movies");
const fetch = require("node-fetch");

const moodTranslations = {
  admiration: "admiration",
  amusement: "amusement",
  anger: "colère",
  annoyance: "agacement",
  approval: "approbation",
  caring: "bienveillance",
  confusion: "confusion",
  curiosity: "curiosité",
  desire: "désir",
  disappointment: "déception",
  disapproval: "désapprobation",
  disgust: "dégoût",
  embarrassment: "embarras",
  excitement: "excitation",
  fear: "peur",
  gratitude: "gratitude",
  grief: "chagrin",
  joy: "joie",
  love: "amour",
  nervousness: "nervosité",
  optimism: "optimisme",
  pride: "fierté",
  realization: "réalisation",
  relief: "soulagement",
  remorse: "remords",
  sadness: "tristesse",
  surprise: "surprise",
};

// Fonction pour mettre à jour le mood d'un film
const updateMood = async (movieId) => {
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new Error("Movie not found");
  }

  const response = await fetch("http://localhost:5000/sentiment_analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ synopsis: movie.synopsis.en }),
  });

  // On récupère l'émotion retourné par le modèle, si c'est neutre, on prend la deuxième émotion la plus probable
  const data = await response.json();
  let mood = data.emotion;
  if (mood === "neutral" && data.secondary_emotion) {
    mood = data.secondary_emotion;
  }

  // Mise à jour du mood dans la BDD
  Movie.updateOne({_id:movieId}, {mood: {en: mood, fr: moodTranslations[mood]}}).then();

};

// Route pour mettre à jour l'humeur de tous les films
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

// Route pour obtenir les valeurs distinctes de mood et leur nombre d'occurrences
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


router.get("/:movieId", async (req, res) => {
    let { movieId } = req.params;
  
    try {
      await updateMood(movieId);
      console.log(`Updated mood`);
      res.status(200).send(`Updated mood for movie with ID: ${movieId}`);
    } catch (error) {
      console.error(`Failed to update mood for movie`, error);
      res.status(500).send("Failed to update mood for movie");
    }
  });

module.exports = router;
