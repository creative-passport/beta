// User.js
// This is the data model for the User 
const crypto = require('crypto');

var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    salt: String,
    date_joined: Date,
    birthday: Date,
    persona: String,
    real: String,
    basic_biog: String,
    policy: String,
    validated: Boolean,
    token: String,
    identifiers: {
        isni: String, 
        ppl_id: String,
    },
    skills: String,
    interests: String,
    wallet_id_ibm: String,
    alpha: Boolean
});

UserSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    //return this.hash === hash;
    if (hash === this.password) {
        return true;
    } else {
        return false;
    }
}

UserSchema.methods.updatePassword = function (password, newPassword) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');

    if (hash === this.password) {
        // return true;
        // Old password the same so can update.
        this.salt = crypto.randomBytes(16).toString('hex');
        this.password = crypto.pbkdf2Sync(newPassword, this.salt, 10000, 512, 'sha512').toString('hex');
    } else {
        // Original password does not match
        return false;
    }
}

mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');