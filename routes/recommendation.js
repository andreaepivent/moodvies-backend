var express = require('express');
var router = express.Router();
const { recommendMovies } = require('./movieFunctions');

router.post('/', async (req, res) => {
    const { userMood, option } = req.body;
    if (!userMood || !option) {
      return res.status(400).send('Please provide userMood and option.');
    }
  
    try {
      const recommendations = await recommendMovies(userMood, option);
      res.json(recommendations);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error recommending movies');
    }
  });

module.exports = router;