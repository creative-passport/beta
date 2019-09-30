// ISNI.js
// This is the data model for the Users ISNI data

var mongoose = require('mongoose');
var ISNISchema = new mongoose.Schema({
    user_id: String,
    isni_data: String
});

mongoose.model('ISNI', ISNISchema);

module.exports = mongoose.model('ISNI');