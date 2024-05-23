const Movie = require("../models/movies");

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
      throw new Error('Movie not found');
    }
  
    const response = await fetch('http://localhost:5000/sentiment_analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ synopsis: movie.synopsis.en })
    });
  
    const data = await response.json();
    let mood = data.emotion;
    if (mood === 'neutral' && data.secondary_emotion) {
      mood = data.secondary_emotion;
    }
  
    movie.mood.en = mood;
    movie.mood.fr = moodTranslations[mood];
    await movie.save();
  
    return movie;
  };

  const updateAllMoods = async () => {
    let i = 0;

    const movies = await Movie.find();
    for (let movie of movies) {
      try {
        console.log(i) // Tracker l'avancement du code
        await updateMood(movie._id);
        console.log(`Updated mood for movie: ${movie.title.en}`);
        i++;
      } catch (error) {
        console.error(`Failed to update mood for movie: ${movie.title.en}`, error);
      }
    }
  };

  updateAllMoods();