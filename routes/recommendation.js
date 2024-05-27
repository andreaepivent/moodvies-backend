var express = require("express");
var router = express.Router();
const { recommendMovies } = require("../modules/recommendation");
const { moodTranslations } = require("../modules/updateMood");
const User = require("../models/users");
const Movie = require("../models/movies");

const countryCodes = {
  Américain: "US",
  Français: "FR",
  Anglais: "GB",
  Japonais: "JP",
  Coréen: "KR",
  Italien: "IT",
  Espagnol: "ES",
};

// Recommandation d'un film en fonction du mood de l'utilisateur et de l'option choisie
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
              userMood: { en: userMood, fr: moodTranslations[userMood] },
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

// Recommandation d'un film en fonction de critères choisis par l'utilisateur
router.post("/customRec", async (req, res) => {
  const { token, preferences } = req.body;
  const timestamp = Date.now();

  if (!token || !preferences) {
    return res.status(400).send("Please provide token and/or preferences.");
  }

  try {
    // Récupérer la liste des films déjà recommandés pour cet utilisateur
    const user = await User.findOne({ token })
      .select("recommendedMovies.movie")
      .lean();
    const recommendedMoviesIds = user
      ? user.recommendedMovies.map((rm) => rm.movie)
      : [];

    // Construire la requête de recherche dynamiquement
    let query = {};

    if (preferences.genre && preferences.genre !== "Indifférent") {
      query["genre.fr"] = { $in: [preferences.genre] };
    };

    if (preferences.country && preferences.country !== "Indifférent") {
      if (preferences.country === "Autres") {
        const excludedCountries = Object.values(countryCodes);
        query.country = { $nin: excludedCountries };
      } else {
        const countryCode = countryCodes[preferences.country];
        if (countryCode) {
          query.country = { $in: [countryCode] };
        }
      }
    };

    if (preferences.time && preferences.time !== "Indifférent") {
      if (preferences.time === "Court (moins d'1h30)") {
        query.duration = { $lte: 90 };
      } else if (preferences.time === "Moyen (entre 1h30 et 2h)") {
        query.duration = { $gt: 90, $lte: 120 };
      } else if (preferences.time === "J'ai du temps (plus de 2h)") {
        query.duration = { $gt: 120 };
      }
    };

    if (preferences.popularity && preferences.popularity !== "Indifférent") {
      if (preferences.popularity === "Populaire") {
        query.popularity_score = { $gte: 70 }; // Par exemple, un score de popularité supérieur ou égal à 70
      } else if (preferences.popularity === "Niche") {
        query.popularity_score = { $lt: 70 }; // Par exemple, un score de popularité inférieur à 70
      }
    };

     // Exclure les films déjà recommandés
     if (recommendedMoviesIds.length > 0) {
      query._id = { $nin: recommendedMoviesIds };
    };

    // Rechercher des films correspondant aux critères
    const recommendations = await Movie.aggregate([
      { $match: query },
      { $sample: { size: 4 } },
    ]);

    // On met à jour les films recommandés pour l'utilisateur
    const addRecommendedMovies = recommendations.map((recommendation, index) =>
      User.updateOne(
        { token },
        {
          $push: {
            recommendedMovies: {
              movie: recommendation._id,
              userMood: { en: "Custom", fr: "Sur mesure" },
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

// Laiser un avis sur un film recommandé
router.post("/addFeedback", async (req, res) => {
  let { token, note, movieId } = req.body;
  note = Number(note);

  try {
    await User.updateOne(
      { token, "recommendedMovies.movie": movieId },
      { $set: { "recommendedMovies.$.note": note } }
    ).then(() => res.json({ result: true }));
  } catch (error) {
    res.json({ result: false, error });
  }
});

module.exports = router;
