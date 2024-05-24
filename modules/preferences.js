const Movie = require("../models/movies");
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

// Variable pour suivre l'état de la conversation
let conversationState = {};

// Fonction pour obtenir des recommandations de films en fonction des préférences
async function getMovieRecommendations(preferences) {
    const query = {};

    if (preferences.genre) {
        query['genre.en'] = { $regex: preferences.genre, $options: 'i' };
    }
    if (preferences.actor) {
        query['cast'] = { $regex: preferences.actor, $options: 'i' };
    }
    if (preferences.duration) {
        query['duration'] = preferences.duration === 'long' ? { $gt: 120 } : { $lte: 120 };
    }
    if (preferences.popularity) {
        query['popularity_score'] = preferences.popularity === 'populaire' ? { $gt: 50 } : { $lte: 50 };
    }
    if (preferences.country) {
        query['country'] = { $regex: preferences.country, $options: 'i' };
    }

    const movies = await Movie.find(query).limit(4);
    return movies;
}

// Fonction pour interagir avec Dialogflow et générer des réponses
async function detectIntent(projectId, sessionId, query, languageCode) {
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    return responses[0].queryResult;
}

module.exports = {
  getMovieRecommendations,
  detectIntent,
};
