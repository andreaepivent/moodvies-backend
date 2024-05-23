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
  password: String,
  birthday: Date,
  genre: String,
  platforms: [String],
  newsletter: Boolean,
  recommendedMovies: [recommendedMoviesSchema],
  token: String
});

const User = mongoose.model("users", userSchema);

module.exports = User;
