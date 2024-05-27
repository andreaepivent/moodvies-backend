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
      error: "Invalid username format. Only letters and numbers are allowed.",
    });
  }

  // Valide le format de l'email
  if (!validateEmail(req.body.email)) {
    return res.json({ result: false, error: "Invalid email format" });
  }
  // Valide le format du mot de passe
  if (!validatePassword(req.body.password)) {
    console.error('Password validation failed')
    return res.json({
      result: false,
      error:
        "Password must be at least 8 characters long and include at least one uppercase letter and one number",
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

    if (existingUser) {
      return res.json({ result: false, error: "User already exists" }); // Renvoie une réponse JSON avec une erreur si l'utilisateur existe déjà
    }

    // Hash le mot de passe avec bcrypt en utilisant un sel de 10
    const hash = bcrypt.hashSync(req.body.password, 10);

    // Crée un nouvel utilisateur avec les informations fournies
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      birthday: new Date(req.body.birthday),
      genre: req.body.genre,
      password: hash,
      token: uid2(32), // Génère un token unique
    });

    // Sauvegarde le nouvel utilisateur dans la base de données
    const savedUser = await newUser.save();

    // Renvoie une réponse JSON avec le token de l'utilisateur en cas de succès
    res.json({ result: true, token: savedUser.token });
  } catch (error) {
    console.error("Signup error:", error);
    // Renvoie une réponse JSON avec une erreur en cas d'échec de la sauvegarde ou de la recherche
    res.json({ result: false, error: "An error occurred during signup" });
  }
});

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
  
    // Pour chacune des propriétés de req.body passées en argument nous bouclons pour vérifier si elle est undefined, null ou si elle match la regex
    // auquel cas nous retournons une erreur 400
    for (const field of requiredField) {
      if (req.body[field] === undefined || req.body[field] === null || regex.test(req.body[field])) {
        return res.status(400).json({result: false, error: `${field} is invalid`});
      }
    }
    // Si il n'y a pas d'erreur nous envoyons les informations à la route
    next();
  }
} 

router.post("/getUserData", verifyInfos(['token']), async (req, res) => {
  const { token } = req.body;

  try {
    const response = await User.findOne({token: token});

    if (!response) {
      res.status(404).json({result: false, error: "user not found"})
    }

    const userData = response;
    res.json({result: true, data: userData})

  } catch (error) {
    console.error("error :", error.message)
    res.status(500).json({result: false, error: error.message})
  }
})

// Modification du profil pour l'utilisateur
router.put("/editProfile", verifyInfos(['token', 'username', 'email']), async (req, res) => {
  const {token, username, email} = req.body;

  try {
    const response = await User.findOneAndUpdate(
      { token: token }, 
      { email: email, username: username }, 
      { new: true }
    );

    if (response) {
      res.json({result: true, data: response});
    } else {
      res.status(404).json({result: false, error: "No user found"});
    }

  } catch (error) {
    res.status(500).json({result: false, error: error});
  }

});

router.put("/editPassword", verifyInfos(['currentPassword', 'newPassword']), async (req, res) => {
  const {currentPassword, newPassword} = req.body;

  try {
    const response = await User.findOneAndUpdate(
      { password: currentPassword }, 
      { password: newPassword }, 
      { new: true }
    );

    if (response) {
      res.json({result: true, data: response});
    } else {
      res.status(404).json({result: false, error: "No user found"});
    }

  } catch (error) {
    res.status(500).json({result: false, error: error});
  }

})

// Ajout d'une plateforme pour l'utilisateur
router.post("/addPlatform", async (req, res) => {});

// Suppression d'une plateforme pour l'utilisateur
router.delete("/deletePlatform", async (req, res) => {});

module.exports = router;
