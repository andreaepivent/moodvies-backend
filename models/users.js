const mongoose = require("mongoose");

const likeMovieSchema = mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "movies" },
  mood : String,
  note : Number,
});

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  age: Number,
  genre: String,
  platforms: [String],
  newsletter: Boolean,
  likeMovies: [likeMovieSchema],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
