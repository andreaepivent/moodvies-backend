var express = require("express");
var router = express.Router();
const Newsletter = require("../models/newsletters");
const User = require("../models/users");
const Movie = require("../models/movies");
const transporter = require("../modules/mailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const moment = require("moment");

// Charger et compiler le template Handlebars pour les emails
const templatePath = path.join(__dirname, "../templates/movieNewsletter.hbs");
const source = fs.readFileSync(templatePath, "utf8");
const template = handlebars.compile(source);

// Fonction Regex pour valider le format de l'email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Fonction pour formater la date avec moment
function formatDate(date) {
  return moment(date).format("DD MMMM YYYY");
}

// ================================================
// ================ Post subscribe route =================
// ================================================

// Route pour s'abonner à la newsletter un email
router.post("/send-email", async (req, res) => {
  try {
    // Extraire l'email du corps de la requête
    const email  = req.body.email

    // Vérifier que l'email est fourni
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Adresse email invalide" });
    }

    //Vérification si l'adresse email est déjà enregistrée pour la newsletter
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.newsletter) {
      return res
        .status(409) // Code 409 pour conflit
        .json({ message: "Utilisateur déjà inscrit à la newsletter" });
    }

    // Récupérer le film par id_tmdb depuis la base de données
    const movie = await Movie.findOne({ id_tmdb: 14 }).lean(); //  30827

    if (!movie) {
      return res.status(404).json({ message: "Film non trouvé" });
    }

    // Formater la date de sortie
    movie.releaseDateFormatted = formatDate(movie.releaseDate);

    console.log("Film trouvé:", movie.title.en); // Vérifier que les données du film sont correctes
    // console.log("Template compilé:", template({ movie, email })); // Vérifier le HTML généré

    // Définir les options pour l'email
    const mailOptions = {
      from: `"MOODVIES" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: `Proposition de Film: ${movie.title.fr || movie.title.en}`,
      html: template({ movie, email }), // Passer le film  et l'email au template
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    // Mettre à jour l'état `newsletter` à true si l'utilisateur esttrouvée
    const result = await User.updateOne(
      { email },
      { newsletter: true },
      { upsert: true } // Si aucun utilisateur avec l'email donné n'existe, un nouveau document utilisateur sera créé
    );

    // Vérifier si l'email a été trouvé et mis à jour
    if (result.nModified === 0 && !result.upserted) {
      return res
        .status(404)
        .send("L'adresse email n'a pas été trouvée et n'a pas pu être créée");
    }

    res.status(200).json({
      message: "Inscription à la newsletter réussi",
    });
  } catch (error) {
    console.error(
      "Échec de l'envoi de l'e-mail ou de la mise à jour de l'abonnement",
      error
    );
    res.status(500).json({
      message: "",
    });
  }
});

// ================================================
// ================ Get unsubscribe route =================
// ================================================

// Route pour désabonner un utilisateur
router.get("/unsubscribe", async (req, res) => {
  // Extraire l'email des paramètres de requête
  const email = req.query.email;

  // Vérifier que l'email est fourni
  if (!email) {
    return res
      .status(400)
      .send("Adresse email est requise pour le désabonnement");
  }

  try {
    // Mettre à jour le champ `newsletter` pour l'utilisateur correspondant
    const result = await User.updateOne({ email }, { newsletter: false });

    // Vérifier si l'email a été trouvé et mis à jour
    if (result.nModified === 0) {
      return res.status(404).send("Adresse email non trouvée");
    }

    // Message de succès
    const message = "Vous avez été désabonné avec succès";
    // Rendre la page EJS avec le message de succès
    res.render("unsubscribe", { message });
  } catch (error) {
    console.error("Erreur lors du désabonnement:", error);
    // Message d'erreur
    const message = "Échec du désabonnement. Veuillez réessayer plus tard.";
    // Rendre la page EJS avec le message d'erreur
    res.render("unsubscribe", { message });
  }
});

// ===================================================
// ================ Post route weekly-email =================
// ===================================================

// Route pour envoyer un email à tous les abonnés de la newsletter
router.post("/weekly-email", async (req, res) => {
  const { movieId } = req.body;

  try {
    // Récupérer tous les utilisateurs abonnés à la newsletter
    const users = await User.find({ newsletter: true });

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun utilisateur abonné à la newsletter trouvé" });
    }

    // Récupérer le film via son objectID qui sera inclu dans l'email
    const movie = await Movie.findOne({ _id: movieId }).lean(); 
    if (!movie) {
      return res.status(404).json({ message: "Film non trouvé" });
    }

    // Formater la date de sortie
    movie.releaseDateFormatted = formatDate(movie.releaseDate);

    // Envoyer l'email à chaque utilisateur
    for (const user of users) {
      const mailOptions = {
        from: `"MOODVIES" <${process.env.NODEMAILER_EMAIL}>`,
        to: user.email,
        subject: `Proposition de Film: ${movie.title.fr || movie.title.en}`,
        html: template({ movie, email: user.email }), // Passer le film et l'email au template
      };

      await transporter.sendMail(mailOptions);
    }

    // Créer un document dans la collection newsletter
    const newsletterEntry = new Newsletter({
      date: new Date(),
      movie: movieId,
    });
    await newsletterEntry.save();

    res.status(200).json({
      message: "Emails envoyés et newsletter enregistrée avec succès",
    });
  } catch (error) {
    console.error(
      "Échec de l'envoi des e-mails ou de l'enregistrement de la newsletter",
      error
    );
    res.status(500).json({
      message:
        "Une erreur est survenue lors de l'envoi des e-mails ou de l'enregistrement de la newsletter",
    });
  }
});

module.exports = router;
