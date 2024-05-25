const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
  id_tmdb: Number,
  title: {
    en: String,
    fr: String,
  },
  directors: [String],
  duration: Number,
  synopsis: {
    en: String,
    fr: String,
  },
  genre: {
    en: [String],
    fr: [String],
  },
  cast: [String],
  note: Number,
  poster: String,
  backdrop: String,
  trailer: {
    en: String,
    fr: String,
  },
  release_date: Date,
  budget: Number,
  revenue: Number,
  country: [String],
  language: String,
  popularity_score: Number,
  vote_count: Number,
  keywords: [String],
  similarMovies: [Number],
  providers: {
    en: [String],
    fr: [String],
  },
  moods: {
    type: [String],
    default: []
  },
});

const Movie = mongoose.model("movies", movieSchema);

module.exports = Movie;
