const Movie = require("../models/movies");

const moodComplements = {
  admiration: "disapproval",
  amusement: "boredom",
  anger: "calm",
  annoyance: "patience",
  approval: "disapproval",
  caring: "indifference",
  confusion: "clarity",
  curiosity: "disinterest",
  desire: "apathy",
  disappointment: "satisfaction",
  disapproval: "approval",
  disgust: "acceptance",
  embarrassment: "confidence",
  excitement: "calm",
  fear: "bravery",
  gratitude: "ingratitude",
  grief: "joy",
  joy: "sadness",
  love: "hate",
  nervousness: "confidence",
  optimism: "pessimism",
  pride: "humility",
  realization: "ignorance",
  relief: "stress",
  remorse: "satisfaction",
  sadness: "joy",
  surprise: "expectation",
};

// Fonction pour récupérer le mood complémentaire
const getComplementaryMood = (mood) => {
  return moodComplements[mood] || null;
};

// Fonction pour calculer la similarité des moods
const calculateSimilarity = (mood1, mood2) => {
  return mood1 === mood2 ? 1 : 0;
};

// Fonction pour recommander des films
const recommendMovies = async (userMood, option) => {
  const movies = await Movie.find();
  let recommendations = [];

  // Randomiser les films
  movies = movies.sort(() => Math.random() - 0.5);

  if (option === "similarity") {
    recommendations = movies.filter(
      (movie) => calculateSimilarity(movie.mood, userMood) > 0
    );
  } else if (option === "complementarity") {
    const complementaryMood = getComplementaryMood(userMood);
    recommendations = movies.filter(
      (movie) => calculateSimilarity(movie.mood, complementaryMood) > 0
    );
  }

  return recommendations.slice(0, 4);
};

module.exports = {
    recommendMovies,
    getComplementaryMood,
    calculateSimilarity
  };
