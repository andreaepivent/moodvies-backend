const Movie = require("../models/movies");
const User = require("../models/users");

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

// Fonction pour recommander des films
const recommendMovies = async (userId, userMood, option) => {
  const user = await User.findById(userId).populate("recommendedMovies.movie");
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
