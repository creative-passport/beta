// db.js
require('dotenv').config();

var mongoose = require('mongoose');

// Live Database
/*
mongoose.connect(process.env.LIVE_DB, {
    useNewUrlParser: true
});
*/


// Staging Database
mongoose.connect(process.env.STAGE_DB, {
    useNewUrlParser: true
});

//mongoose.connect('mongodb://localhost/CreativePassportBeta');
//mongoose.set('debug', true);