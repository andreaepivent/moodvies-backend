const mongoose = require('mongoose');

const newsletterSchema = mongoose.Schema({
    date : Date,
    content: String,
    images:[String],
    receivedBy : [{type: mongoose.Schema.Types.ObjectId, ref:"users"}], 
})

const Newsletter = mongoose.model('newsletters', newsletterSchema);

module.exports = Newsletter;

