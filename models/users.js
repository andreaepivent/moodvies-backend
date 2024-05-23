const mongoose = require("mongoose");

const recommendedMoviesSchema = mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "movies" },
  mood : {
    en:String,
    fr:String
  },
  note: {type: Number, default:null},
  date: Date,
  rank: Number,
});

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  birthday: Date,
  genre: {
    en:String,
    fr:String
  },
  platforms: [String],
  newsletter: Boolean,
  recommendedMovies: [recommendedMoviesSchema],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
