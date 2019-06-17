// Connection.js

var mongoose = require('mongoose');
var ConnectionSchema = new mongoose.Schema({
    fromID: String,
    toID: String,
    relationship: String,
    dateCreated: Date
});

mongoose.model('Connection', ConnectionSchema);

module.exports = mongoose.model('Connection');