var express = require("express");
var router = express.Router();
const { recommendMovies } = require("../modules/recommendation");
const { moodTranslations } = require("../modules/updateMood");
const User = require("../models/users");

router.post("/", async (req, res) => {
  const { userId, userMood, option } = req.body;
  const timestamp = Date.now();
  if (!userId || !userMood || !option) {
    return res
      .status(400)
      .send("Please provide userId, userMood and/or option.");
  }

  try {
    const recommendations = await recommendMovies(userId, userMood, option);

    // On met à jour les films recommandés pour l'utilisateur
    const addRecommendedMovies = recommendations.map((recommendation, index) =>
      User.updateOne(
        { _id: userId },
        {
          $push: {
            recommendedMovies: {
              movie: recommendation._id,
              mood: { en: userMood, fr: moodTranslations[userMood] },
              date: timestamp,
              rank: index,
            },
          },
        }
      )
    );

    await Promise.all(addRecommendedMovies);

    res.json({ result: true, recommendations });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error recommending movies");
  }
});

module.exports = router;
