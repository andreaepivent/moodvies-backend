const Movie = require("../models/movies");
const moodTranslations = {
  admiration: "admiration",
  amusement: "amusement",
  colère: "anger",
  agacement: "annoyance",
  approbation: "approval",
  bienveillance: "caring",
  confusion: "confusion",
  curiosité: "curiosity",
  désir: "desire",
  déception: "disappointment",
  désapprobation: "disapproval",
  dégoût: "disgust",
  embarras: "embarrassment",
  excitation: "excitement",
  peur: "fear",
  gratitude: "gratitude",
  chagrin: "grief",
  joie: "joy",
  amour: "love",
  nervosité: "nervousness",
  optimisme: "optimism",
  fierté: "pride",
  réalisation: "realization",
  soulagement: "relief",
  remords: "remorse",
  tristesse: "sadness",
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

  // On récupère l'émotion retourné par le modèle
  const data = await response.json();
  let moods = data.emotion;

  // Mise à jour du mood dans la BDD
  Movie.updateOne(
    { _id: movieId },
    { moods: { en: moods, fr: moods.map(mood => moodTranslations[mood] || mood) } }
  ).then();
};

module.exports = {
  updateMood,
  moodTranslations,
};
