var express = require("express");
var router = express.Router();
const Movie = require("../models/movies");
const fetch = require("node-fetch");

const OWM_API_TOKEN = process.env.OWM_API_TOKEN;

const url =
  "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc";
const getOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${OWM_API_TOKEN}`,
  },
};
const postOptions = {
  method: "POST",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    Authorization: `Bearer ${OWM_API_TOKEN}`,
  },
};

// Display all movies
router.get("/", (req, res) => {
  fetch(url, getOptions)
    .then((response) => response.json())
    .then((data) => {
      res.json({ result: true, movies: data.results });
    })
    .catch((err) => console.error("error:" + err));
});

module.exports = router;