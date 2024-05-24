var express = require("express");
var router = express.Router();
const { getMovieRecommendations, detectIntent } = require("../modules/preferences");

// Variable pour suivre l'état de la conversation
let conversationState = {};

// Route pour gérer les interactions du chatbot
router.post('/', async (req, res) => {
    const projectId = 'wise-boulder-424215-f3';
    const sessionId = req.body.sessionId || uuid.v4();
    const query = req.body.message;
    const languageCode = 'fr';

    if (!conversationState[sessionId]) {
        conversationState[sessionId] = { preferences: {} };
    }

    const state = conversationState[sessionId];
    let response;
    let recommendations;

    // Détecter l'intention de l'utilisateur avec Dialogflow
    const result = await detectIntent(projectId, sessionId, query, languageCode);

    response = result.fulfillmentText;

    // Mettre à jour les préférences en fonction des entités détectées
    if (result.parameters.fields.genre) {
        state.preferences.genre = result.parameters.fields.genre.stringValue;
    }
    if (result.parameters.fields.actor) {
        state.preferences.actor = result.parameters.fields.actor.stringValue;
    }
    if (result.parameters.fields.duration) {
        state.preferences.duration = result.parameters.fields.duration.stringValue.includes('plus') ? 'long' : 'court';
    }
    if (result.parameters.fields.popularity) {
        state.preferences.popularity = result.parameters.fields.popularity.stringValue.includes('populaire') ? 'populaire' : 'niche';
    }
    if (result.parameters.fields.country) {
        state.preferences.country = result.parameters.fields.country.stringValue;
    }

    // Fournir des recommandations basées sur les préférences collectées
    if (result.intent.displayName === 'RecommendMoviesIntent') {
        recommendations = await getMovieRecommendations(state.preferences);
        if (recommendations.length === 0) {
            response = 'Désolé, je n\'ai trouvé aucun film correspondant à vos préférences. Voulez-vous essayer avec d\'autres critères ?';
        } else {
            response = 'Merci pour vos réponses. Voici quelques films que je vous recommande :';
            recommendations.forEach(movie => {
                response += `\n- ${movie.title.fr} (Durée: ${movie.duration} minutes, Note: ${movie.note}/10)`;
            });
            // Réinitialiser l'état de la conversation après les recommandations
            delete conversationState[sessionId];
        }
    }

    // Stocker l'état de la conversation
    conversationState[sessionId] = state;

    res.send({ response });
});

module.exports = router;
