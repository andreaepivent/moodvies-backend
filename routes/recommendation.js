var express = require("express");
var router = express.Router();
const { recommendMovies } = require("../modules/recommendation");
const { moodTranslations } = require("../modules/updateMood");
const User = require("../models/users");

router.post("/", async (req, res) => {
  const { token, userMood, option } = req.body;
  const timestamp = Date.now();
  if (!token || !userMood || !option) {
    return res
      .status(400)
      .send("Please provide token, userMood and/or option.");
  }

  try {
    const recommendations = await recommendMovies(token, userMood, option);

    // On met à jour les films recommandés pour l'utilisateur
    const addRecommendedMovies = recommendations.map((recommendation, index) =>
      User.updateOne(
        { token },
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

router.post("/addFeedback", async (req, res) => {
  let { token, note, movieId } = req.body;
  note = Number(note);

  try {
    await User.updateOne(
      { token, "recommendedMovies.movie": movieId },
      { $set: { "recommendedMovies.$.note": note } }
    ).then(() => res.json({result:true}));
  } catch (error) {
    res.json({result:false, error});
  }
});

module.exports = router;
