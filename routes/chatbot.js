var express = require('express');
var router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const Movie = require("../models/movies");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);
  

let userPreferences = {};

router.post('/', async (req, res) => {
  const { message } = req.body;

  const aiResponse = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `L'utilisateur a dit: "${message}". Pose une question pour mieux comprendre quel genre de film il veut regarder.`,
    max_tokens: 100,
  });

  const aiReply = aiResponse.data.choices[0].text.trim();
  res.json({ reply: aiReply });
});

router.post('/preferences', (req, res) => {
  const { key, value } = req.body;
  userPreferences[key] = value;

  res.json({ message: 'Préférence enregistrée', preferences: userPreferences });
});

router.get('/recommendations', async (req, res) => {
  try {
    const query = {};

    if (userPreferences.language) {
      query.language = userPreferences.language;
    }
    if (userPreferences.origin) {
      query.origin = userPreferences.origin;
    }
    if (userPreferences.genre) {
      query.genre = userPreferences.genre;
    }
    if (userPreferences.duration) {
      query.duration = { $lte: parseInt(userPreferences.duration, 10) };
    }
    if (userPreferences.budget) {
      query.budget = { $lte: parseInt(userPreferences.budget, 10) };
    }
    if (userPreferences.popularity_score) {
      query.popularity_score = { $gte: parseInt(userPreferences.popularity_score, 10) };
    }

    const movies = await Movie.find(query);
    res.json({ recommendations: movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;