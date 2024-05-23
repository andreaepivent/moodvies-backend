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

  // On récupère l'émotion retourné par le modèle
  const data = await response.json();
  let mood = data.emotion;

  // Mise à jour du mood dans la BDD
  Movie.updateOne(
    { _id: movieId },
    { mood: { en: mood, fr: moodTranslations[mood] } }
  ).then();
};

module.exports = {
  updateMood,
  moodTranslations,
};
