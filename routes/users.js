var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");

// Fonction Regex pour valider le format de l'email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Fonction pour valider le format du mot de passe
function validatePassword(password) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/; // Mot de passe doit avoir au moins 8 caractères, une lettre et un chiffre
  return passwordRegex.test(password);
}

// Fonction pour valider le format du username
function validateUsername(username) {
  const usernameRegex = /^[A-Za-z0-9]+$/;
  return usernameRegex.test(username);
}

// ===============================================================
// ================ route Post SignUp =================
// =============================================================

// Route POST pour l'inscription des utilisateurs
router.post("/signup", async (req, res) => {
  // Vérifie si les champs requis sont présents et non vides dans le corps de la requête
  if (!checkBody(req.body, ["username", "email", "password", "birthday"])) {
    return res.json({ result: false, error: "Missing or empty fields" }); // Renvoie une réponse JSON avec une erreur si des champs sont manquants ou vides
  }

  // Valide le format du username
  if (!validateUsername(req.body.username)) {
    return res.json({
      result: false,
      error: "Le format du pseudo n'est pas valide. Seuls les lettres et les chiffres sont autorisés.",
    });
  }

  // Valide le format de l'email
  if (!validateEmail(req.body.email)) {
    return res.json({ result: false, error: "Format d'email invalide" });
  }
  // Valide le format du mot de passe
  if (!validatePassword(req.body.password)) {
    console.error("Password validation failed");
    return res.json({
      result: false,
      error:
        "Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule et un chiffre.",
    });
  }

  try {
    // Vérifie si un utilisateur avec le même nom d'utilisateur ou email existe déjà, insensible à la casse pour le nom d'utilisateur
    const existingUser = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(req.body.username, "i") } },
        { email: req.body.email },
      ],
    });

  /*   if (existingUser) {
      return res.json({ result: false, error: "L'utilisateur existe déjà" }); // Renvoie une réponse JSON avec une erreur si l'utilisateur existe déjà
    }
 */
    if (existingUser) {
      const errorMessage = existingUser.username.toLowerCase() === req.body.username.toLowerCase() 
        ? "Le pseudo est déjà pris." 
        : "L'email est déjà enregistré.";
      return res.json({ result: false, error: errorMessage }); // Renvoie une réponse JSON avec une erreur spécifique si l'utilisateur existe déjà
    }

    // Hash le mot de passe avec bcrypt en utilisant un sel de 10
    const hash = bcrypt.hashSync(req.body.password, 10);

    // Crée un nouvel utilisateur avec les informations fournies
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      birthday: new Date(req.body.birthday),
      gender: req.body.gender,
      password: hash,
      token: uid2(32), // Génère un token unique
    });

    // Sauvegarde le nouvel utilisateur dans la base de données
    const savedUser = await newUser.save();

    // Renvoie une réponse JSON avec le token de l'utilisateur en cas de succès
    res.json({
      result: true,
      token: savedUser.token,
      username: savedUser.username,
    });
  } catch (error) {
    console.error("Signup error:", error);
    // Renvoie une réponse JSON avec une erreur en cas d'échec de la sauvegarde ou de la recherche
    res.json({ result: false, error: "An error occurred during signup" });
  }
});

// ===============================================================
// ================ route Post SignIn =================
// =============================================================

// Route POST pour la connexion des utilisateurs
router.post("/signin", async (req, res) => {
  try {
    // Vérifie si les champs requis sont présents et non vides dans le corps de la requête
    if (!checkBody(req.body, ["username", "password"])) {
      return res
        .status(400)
        .json({ result: false, error: "Missing or empty fields" });
    }
    // Recherche de l'utilisateur par nom d'utilisateur (insensible à la casse)
    const user = await User.findOne({
      username: { $regex: new RegExp(req.body.username, "i") },
    });

    if (!user) {
      return res
        .status(401)
        .json({ result: false, error: "User not found or wrong password" });
    }

    // Comparaison du mot de passe fourni avec le mot de passe haché dans la base de données
    const passwordMatch = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ result: false, error: "User not found or wrong password" });
    }

    // Si l'authentification réussit, renvoie le token
    res.status(200).json({
      result: true,
      token: user.token,
      username: user.username,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Création d'un middleware pour filtrer les informations du front
const verifyInfos = (requiredField) => {
  return (req, res, next) => {
    // Définition d'une regex qui correspond à une chaine qui ne contient que des espaces vides
    const regex = /^\s*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 


    // Pour chacune des propriétés de req.body passées en argument nous bouclons pour vérifier si elle est undefined, null ou si elle match la regex
    // auquel cas nous retournons une erreur 400
    for (const field of requiredField) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        regex.test(req.body[field])
      ) {
        return res
          .status(400)
          .json({ result: false, error: `Entrez des informations valides` });
      } 
      // Si le champ testé correspond au champ email alors nous vérifions que la data reçu est bien au bon format
       if (field === "email" && !emailRegex.test(req.body[field])) {
        return res
          .status(400)
          .json({ result: false, error: 'Entrez une adresse email valide' });
      }
    }
    // Si il n'y a pas d'erreur nous envoyons les informations à la route
    next();
  };
};

// Route pour obtenir les données utilisateur
router.post("/getUserData", verifyInfos(["token"]), async (req, res) => {
  const { token } = req.body;

  try {
    // Recherche l'utilisateur par le token fourni
    const response = await User.findOne({ token: token });

    if (!response) {
      // Si l'utilisateur n'est pas trouvé, renvoie une erreur 404
      res.status(404).json({ result: false, error: "Aucun utilisateur trouvé" });
    }

    const userData = response;
    // Renvoie les données de l'utilisateur trouvées
    res.json({ result: true, data: userData });
  } catch (error) {
    console.error("error :", error.message);
    // En cas d'erreur, renvoie une erreur 500 avec le message d'erreur
    res.status(500).json({ result: false, error: error.message });
  }
});

// Route pour modifier le profil de l'utilisateur
router.put(
  "/editProfile",
  verifyInfos(["token", "username", "email"]),
  async (req, res) => {
    const { token, username, email } = req.body;

    try {
      // Met à jour les informations de l'utilisateur par le token fourni
      const response = await User.findOneAndUpdate(
        { token: token },
        { email: email, username: username },
        { new: true }
      );

      if (response) {
        // Si l'utilisateur est trouvé et mis à jour, renvoie les nouvelles données
        res.json({ result: true, data: response });
      } else {
        // Si l'utilisateur n'est pas trouvé, renvoie une erreur 404
        res.status(404).json({ result: false, error: "Aucun utilisateur trouvé" });
      }
    } catch (error) {
      // En cas d'erreur, renvoie une erreur 500 avec le message d'erreur
      res.status(500).json({ result: false, error: error });
    }
  }
);

// Route pour modifier le mot de passe de l'utilisateur
router.put(
  "/editPassword",
  verifyInfos(["currentPassword", "newPassword"]),
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
      // Met à jour le mot de passe de l'utilisateur par le mot de passe actuel fourni
      const response = await User.findOneAndUpdate(
        { password: currentPassword },
        { password: newPassword },
        { new: true }
      );

      if (response) {
        // Si l'utilisateur est trouvé et mis à jour, renvoie les nouvelles données
        res.json({ result: true, data: response });
      } else {
        // Si l'utilisateur n'est pas trouvé, renvoie une erreur 404
        res.status(404).json({ result: false, error: "Aucun utilisateur trouvé" });
      }
    } catch (error) {
      // En cas d'erreur, renvoie une erreur 500 avec le message d'erreur
      res.status(500).json({ result: false, error: error });
    }
  }
);

// Récupération des films recommandés pour l'utilisateur
router.get("/getRecommendations/:token", async (req, res) => {
  const {token} = req.params;
  User.findOne({token})
  .populate('recommendedMovies.movie')
  .then((data) => res.json(data.recommendedMovies));
});

// Laiser un avis sur un film recommandé
router.post("/addFeedback", async (req, res) => {
  let { token, note, movieId } = req.body;
  note = Number(note);

  // Vérifiez si la note est 0 et assignez null
  if (note === 0) {
    note = null;
  }

  try {
    await User.updateOne(
      { token, "recommendedMovies.movie": movieId },
      { $set: { "recommendedMovies.$.note": note } }
    ).then(() => res.json({ result: true }));
  } catch (error) {
    res.json({ result: false, error });
  }
})


// Fonction pour trouver un utilisateur par email
const findUserByEmail = async (email) => User.findOne({ email });

// Route pour la connexion avec Google
router.post("/google-login", async (req, res) => {
  const { access_token } = req.body; 

  try {
    // Récupère les informations utilisateur de Google avec le token d'accès fourni
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Log le texte brut de la réponse de Google
    const responseText = await response.text();
    console.log('Google response text:', responseText);

    // Parse la réponse en JSON
    const googleUser = JSON.parse(responseText);

    if (!googleUser.email) {
      console.error('Failed to get email from Google user info');
      // Si l'email n'est pas récupéré, renvoie une erreur 400
      return res.status(400).json({ result: false, message: 'Failed to get user info from Google' });
    }

    // Cherche l'utilisateur par email dans la base de données
    let user = await findUserByEmail(googleUser.email);

    if (!user) {
      // Crée un nouvel utilisateur si aucun n'est trouvé
      user = new User({
        email: googleUser.email,
        username: googleUser.name,
        token: uid2(32),
      });

      // Sauvegarde le nouvel utilisateur dans la base de données
      const savedUser = await user.save();

      // Renvoie les données de l'utilisateur nouvellement créé
      return res.json({
        result: true,
        token: savedUser.token,
        username: savedUser.username,
      });
    } else {
      // Renvoie les données de l'utilisateur existant
      res.json({
        result: true,
        token: user.token,
        username: user.username,
      });
    }

  } catch (error) {
    console.error('Error in /google-login route:', error);
    // En cas d'erreur, renvoie une erreur 500 avec le message d'erreur
    res.status(500).json({ result: false, message: 'Internal server error' });
  }
});

// Ajout d'une plateforme pour l'utilisateur
router.post("/addPlatform", async (req, res) => {
  const { token, platform } = req.body;

  try {
    await User.updateOne(
      { token },
      { $push: { "platforms": platform } }
    ).then(() => res.json({ result: true }));
  } catch (error) {
    res.json({ result: false, error });
  }
});

// Suppression d'une plateforme pour l'utilisateur
router.delete("/deletePlatform", async (req, res) => {
  const { token, platform } = req.body;

  try {
    await User.updateOne(
      { token },
      { $pull: { "platforms": platform } }
    ).then(() => res.json({ result: true }));
  } catch (error) {
    res.json({ result: false, error });
  }
});

module.exports = router;
