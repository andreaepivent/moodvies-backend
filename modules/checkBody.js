
// Fonction pour vérifier si les champs requis sont présents et non vides dans le corps de la requête
function checkBody(body, keys) {
    let isValid = true;
  
    for (const field of keys) {
      if (!body[field] || body[field].trim() === '') {
        isValid = false;
        break; 
      }
    }
  
    return isValid;
  }
  
  module.exports = { checkBody };
  