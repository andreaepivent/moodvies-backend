
// Fonction pour vérifier si les champs requis sont présents et non vides dans le corps de la requête
function checkBody(body, keys) {
    let isValid = true;
  
    for (const field of keys) {
      if (!body[field] || body[field] === '') {
        isValid = false;
        break; // Sort de la boucle dès qu'un champ manquant ou vide est trouvé
      }
    }
  
    return isValid;
  }
  
  module.exports = { checkBody };
  