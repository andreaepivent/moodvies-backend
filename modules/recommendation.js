const Movie = require("../models/movies");
const User = require("../models/users");

const moodComplements = {
  admiration: "disapproval",
  amusement: "annoyance",
  anger: "relief",
  annoyance: "amusement",
  approval: "disapproval",
  caring: "disgust",
  confusion: "realization",
  curiosity: "indifference",
  desire: "disgust",
  disappointment: "joy",
  disapproval: "approval",
  disgust: "admiration",
  embarrassment: "pride",
  excitement: "nervousness",
  fear: "excitement",
  gratitude: "disappointment",
  grief: "joy",
  joy: "sadness",
  love: "anger",
  nervousness: "excitement",
  optimism: "disappointment",
  pride: "embarrassment",
  realization: "confusion",
  relief: "anger",
  remorse: "pride",
  sadness: "joy",
  surprise: "realization"
};

// Fonction pour récupérer le mood complémentaire
const getComplementaryMood = (mood) => {
  return moodComplements[mood] || null;
};

// Fonction pour recommander des films
const recommendMovies = async (token, userMood, option) => {
  const user = await User.findOne({token}).populate("recommendedMovies.movie");
  if (!user) {
    throw new Error("User not found");
  }

  // On ne veut pas recommander un film qui a déjà été recommandé à cet utilisateur
  const recommendedMovieIds = user.recommendedMovies.map((rec) =>
    rec.movie._id.toString()
  );

  let movies = await Movie.find();
  let recommendations = [];

  // Randomiser les films
  movies = movies.sort(() => Math.random() - 0.5);

  if (option === "similarity") {
    recommendations = movies.filter(
      (movie) =>
        movie.mood.get("en") === userMood &&
        !recommendedMovieIds.includes(movie._id.toString())
    );
  } else if (option === "complementarity") {
    const complementaryMood = getComplementaryMood(userMood);
    recommendations = movies.filter(
      (movie) =>
        movie.mood.get("en") === complementaryMood &&
        !recommendedMovieIds.includes(movie._id.toString())
    );
  }

  return recommendations
    .slice(0, 4)
    .sort((a, b) => b.popularity_score - a.popularity_score);
};

module.exports = {
  recommendMovies,
  getComplementaryMood,
};
