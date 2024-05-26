var express = require("express");
var router = express.Router();
const Newsletter = require("../models/newsletters");
const Movie = require("../models/movies");
const transporter = require("../modules/mailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

// Charger et compiler le template Handlebars pour les emails
const templatePath = path.join(__dirname, "../templates/movieNewsletter.hbs");
const source = fs.readFileSync(templatePath, "utf8");
const template = handlebars.compile(source);

// Route pour envoyer un email
router.post("/send-email", async (req, res) => {
  try {
    // Récupérer le film par id_tmdb depuis la base de données
    const movie = await Movie.findOne({ id_tmdb: 823464}).lean();

    if (!movie) {
      return res.status(404).send("Film non trouvé");
    }

    console.log("Film trouvé:", movie.title.en); // Vérifier que les données du film sont correctes
    console.log("Template compilé:", template({ movie })); // Vérifier le HTML généré


    // Définir les options pour l'email
    const mailOptions = {
      from: `"MOODVIES" <${process.env.NODEMAILER_EMAIL}>`,
      to: "andrea.epivent@gmail.com", // Ou une autre adresse récupérée via req.body ou autre
      subject: `Proposition de Film: ${movie.title.fr || movie.title.en}`,
      html: template({ movie }) // Passer le film au template
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
});

module.exports = router;
