// Issuance.js

var mongoose = require('mongoose');
var IssuanceSchema = new mongoose.Schema({
    passportID: String,
    dateCreated: Date
});

mongoose.model('Issuance', IssuanceSchema);

module.exports = mongoose.model('Issuance');