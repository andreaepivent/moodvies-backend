var express = require("express");
var router = express.Router();
const Movie = require("../models/movies");
const fetch = require("node-fetch");

const OWM_API_TOKEN = process.env.OWM_API_TOKEN;

const getOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${OWM_API_TOKEN}`,
  },
};
/* const postOptions = {
  method: "POST",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    Authorization: `Bearer ${OWM_API_TOKEN}`,
  },
}; */

// autre adresse pour le fetch : https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=false&language=en-US&sort_by=popularity.desc&page=${page}

// fonction fetch pour récupérer l'id des films et toute la discoverie
const getDiscoverMovies = async (page) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/popular?page=${page}`,
    getOptions
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// Fonction fetch pour récupérer les crédits des films
const fetchMovieCredits = async (movieId, language) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/credits?language=${language}`,
    getOptions
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// Fonction fetch pour récupérer les détails des films
const fetchMovieDetails = async (movieId, language) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?language=${language}`,
    getOptions
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// Fonction fetch pour récupérer le trailer des films
const fetchMovieVideos = async (movieId, language) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/videos?language=${language}`,
    getOptions
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// fonction fetch pour récupérer la key permettant d'avoir des informations complémentaires sur le thème des films
const fetchMovieKeywords = async (movieId) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/keywords`,
    getOptions
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// fonction fetch pour récupérer les films similaires 
const fetchMovieSimilar = async (movieId) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/similar?language=en-US&page=1`,
    getOptions
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// fonction fetch pour récupérer les plateformes sur lesquelles les films sont disponible 
const fetchMovieProviders = async (movieId) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`,
    getOptions
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// fonction fetch pour récupérer des images secondaires des films
const fetchMovieBackdrop = async (movieId) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/images`,
    getOptions
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// routes GET servant à nourrir la BDD des films
router.get("/fetchMovies", async (req, res) => {
  try {
    for (let page = 1; page < 501; page++) {
      console.log(page); // tracker l'avancement de la bdd
      for (let i = 0; i < 20; i++) {
        // Première requête pour récupérer l'ID
        const movieData1 = await getDiscoverMovies(page);
        const movieId = movieData1.results[i].id;

        // Requêtes pour récupérer les données en en / general 
        const [
          movieCreditsEn,
          movieDetailsEn,
          movieVideosEn,
          movieKeywords,
          movieSimilar,
          movieProvider,
          movieBackdrop,
        ] = await Promise.all([
          fetchMovieCredits(movieId, "en-US"),
          fetchMovieDetails(movieId, "en-US"),
          fetchMovieVideos(movieId, "en-US"),
          fetchMovieKeywords(movieId),
          fetchMovieSimilar(movieId),
          fetchMovieProviders(movieId),
          fetchMovieBackdrop(movieId),
        ]);

        // Requêtes pour récupérer les données en fr
        const [movieCreditsFr, movieDetailsFr, movieVideosFr] =
          await Promise.all([
            fetchMovieCredits(movieId, "fr-FR"),
            fetchMovieDetails(movieId, "fr-FR"),
            fetchMovieVideos(movieId, "fr-FR"),
          ]);

        const directors = movieCreditsEn.crew
          .filter(({ job }) => job === "Director")
          .map((obj) => obj.name);

        const actors = movieCreditsEn.cast.map((obj) => obj.name);

        const videosFr = movieVideosFr.results.find(
          ({ type }) => type === "Trailer"
        )?.key;

        const videosEn = movieVideosEn.results.find(
          ({ type }) => type === "Trailer"
        )?.key;

        const genresFr = movieDetailsFr.genres.map((obj) => obj.name);

        const genresEn = movieDetailsEn.genres.map((obj) => obj.name);

        const keywords = movieKeywords.keywords.map((obj) => obj.name);

        const similar = movieSimilar.results.map((obj) => obj.id);

        const providerFr =
          movieProvider.results.FR && movieProvider.results.FR.flatrate
            ? movieProvider.results.FR.flatrate.map((obj) => obj.provider_name)
            : [];
        const providerEn =
          movieProvider.results.US && movieProvider.results.US.flatrate
            ? movieProvider.results.US.flatrate.map((obj) => obj.provider_name)
            : [];

        const backdrop =
          movieBackdrop.backdrops && movieBackdrop.backdrops.length > 0
            ? movieBackdrop.backdrops[0].file_path
            : null;

        // Créations des documents dans la bdd
        const newMovie = new Movie({
          id_tmdb: movieId,
          title: {
            en: movieDetailsEn.title,
            fr: movieDetailsFr.title,
          },
          directors,
          duration: movieDetailsFr.runtime, 
          synopsis: {
            en: movieDetailsEn.overview,
            fr: movieDetailsFr.overview,
          },
          genre: {
            en: genresEn,
            fr: genresFr,
          },
          cast: actors,
          note: movieDetailsEn.vote_average,
          poster: movieDetailsEn.poster_path,
          backdrop,
          trailer: {
            en: videosEn,
            fr: videosFr,
          },
          release_date: movieDetailsFr.release_date,
          budget: movieDetailsFr.budget,
          revenue: movieDetailsFr.revenue,
          country: movieDetailsFr.origin_country,
          language: movieDetailsFr.original_language,
          popularity_score: movieDetailsFr.popularity,
          vote_count: movieDetailsFr.vote_count,
          keywords,
          similarMovies: similar,
          providers: {
            en: providerEn,
            fr: providerFr,
          },
        });

        // Sauvegarder dans la BDD
        newMovie.save().then();
      }
    }

    res.json({result: true})

  } catch (error) {
    console.error("Fetch error:", error);
    res.json({ result: false, error: error.message });
  }
});

// Route pour supprimer les doublons
router.delete('/remove-duplicates', async (req, res) => {
  try {
    // Trouver les doublons en se basant sur l'id_tmdb
    const duplicates = await Movie.aggregate([
      {
        $group: {
          _id: '$id_tmdb',
          count: { $sum: 1 },
          docs: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    // Parcourir les doublons et en supprimer tous sauf un
    for (let duplicate of duplicates) {
      const idsToDelete = duplicate.docs.slice(1); // Conserver le premier document et supprimer les autres
      await Movie.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.status(200).send('Duplicates removed successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error removing duplicates');
  }
});

//------------------------------//
/* router.get("/", (req, res) => {
  fetch(urlData1, getOptions)
    .then((response) => response.json())
    .then((data) => {
      res.json({ result: true, movies: data.results });
    })
    .catch((err) => console.error("error:" + err));
});
*/
module.exports = router;