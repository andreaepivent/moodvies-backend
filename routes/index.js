var express = require('express');
var router = express.Router();
const User = require("../models/users");
const Movie = require("../models/movies");
const Newsletter = require("../models/newsletters");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
