const mongoose = require('mongoose');
const { Schema } = mongoose;

const shorturlSchema = new Schema({
  originalUrl: {type: String, required: true},
  shortUrl: {type: String, required: true}
});

module.exports = mongoose.model('Shorturl', shorturlSchema);