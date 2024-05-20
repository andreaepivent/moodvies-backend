const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
    title: String,
    director : String,
    duration: Number,
    synopsis: String,
    genre: String,
    cast: [String],
    note: Number,
    image: String,
    trailer: String,
    release_date : Date, 
    mood: {type: String, default: 'neutral'}
})

const Movie = mongoose.model('movies', movieSchema);

module.exports = Movie;

