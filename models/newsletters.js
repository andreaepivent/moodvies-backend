const mongoose = require('mongoose');

const newsletterSchema = mongoose.Schema({
    date : Date,
    movie : {type: mongoose.Schema.Types.ObjectId, ref:"movies"}
   })

const Newsletter = mongoose.model('newsletters', newsletterSchema);

module.exports = Newsletter;

