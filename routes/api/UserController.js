// UserController.js

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
//const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());
const crypto = require('crypto');

const aws = require('aws-sdk');


// Set up AWS Config
// Set the AWS Region
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: 'eu-west-1'
});

// Create SQS service object
// Create an SQS service object
var sqs = new aws.SQS({
    apiVersion: '2012-11-05'
});

var User = require('../../models/User');
var Connection = require('../../models/Connection');

// Middleware to check if the user is authenticated
function isUserAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/signin');
    }
}

// Return 200 if server live but nothing else
router.get('/', function (req, res) {
    res.status(200);
});

router.post('/register', (req, res) => {
    console.log('Submitted User Details: ' + req);
    console.log('Username : ' + req.body.username);
    console.log('Password : ' + req.body.password);
    console.log('Policy : ' + req.body.policy);
    // Add a user to the database

    var salt = crypto.randomBytes(16).toString('hex');
    var hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 512, 'sha512').toString('hex');
    User.create({
            username: req.body.username,
            password: hash,
            salt: salt,
            policy: req.body.policy,
            date_joined: Date.now(),
            validated: false,
            basic_biog: '',
            validated: false,
            token: ''
        },
        (err, user) => {
            if (err) {
                //return res.status(500).send("There was a problem adding the document" + err);
                req.flash('message', 'That email address has already registered. Please try again, or get in touch.')
                res.redirect('/register');
            } else {
                req.login(user, function (err) {
                    if (err) {
                        console.log(err);
                    }

                    // Send a message to the Queue to send Email to confirm email
                    var params = {
                        DelaySeconds: 10,
                        MessageAttributes: {
                            "emailAddress": {
                                DataType: "String",
                                StringValue: req.body.username
                            }
                        },
                        MessageBody: "Confirm a new email address used to register",
                        QueueUrl: "https://sqs.eu-west-1.amazonaws.com/426201969392/send_confirm_email"
                    };

                    sqs.sendMessage(params, function (err, data) {
                        if (err) {
                            console.log("Error", err);
                        } else {
                            console.log("Success", data.MessageId);
                        }
                    });
                    return res.redirect('/profile');
                }); 
            };
        });
});

router.post('/biography', (req, res) => {
    console.log(req.body);
    var id = req.body._id;
    console.log('ID: ' + id);
    console.log('Biography Text: ' + req.body.minibiog);
    var query = {
        _id: req.body._id
    };
    var update = {
        basic_biog: req.body.minibiog
    };
    var options = { new: true }; 
    User.findOneAndUpdate(query, update, options, function(err, doc){ 
        // Done! 
        res.send(200);
    });
    
});

router.post('/relationship', isUserAuthenticated, (req, res) => {
    console.log(req.body);
    console.log('from ID : ' + req.body.fromId);
    console.log('target ID : ' + req.body.targetId);
    console.log('Relationship : ' + req.body.relationship);

    Connection.create({
            fromID: req.body.fromId,
            toID: req.body.targetId,
            relationship: req.body.relationship,
            dateCreated: Date.now()
        },
        (err, connection) => {
            if (err) {
                //return res.status(500).send("There was a problem adding the document" + err);
                req.flash('message', 'There was a problem adding the connection.')
                res.redirect('/profile');
            } else {
                //req.flash('message', 'Please Sign In with your email and password (we will be sending emails to confirm the email address soon).')
                res.redirect('/profile');
            };
        });
   
});

// Adding / Editing Passport Information
router.post('/update/:id', isUserAuthenticated, (req, res) => {
    //const { body: { user } } = req;

    console.log(req.body);
    console.log('User ID: ' + req.params.id);
    console.log('Skills: ' + req.body.skills);

    var user = req.body;

    var query = {
        _id: req.params.id
    };

    var update = {
        persona: req.body.persona,
        identifiers: {
            isni: req.body.isni,
            ppl_id: req.body.ppl_id
        },
        basic_biog: req.body.basic_biog,
        skills: req.body.skills.replace(/,/g, ', '),
        interests: req.body.interests.replace(/,/g, ', '),
        wallet_id_ibm: req.body.wallet_id_ibm
    };

    var options = {
        new: true
    };

    User.findOneAndUpdate(query, update, options, function (err, doc) {
        if (err) return res.status(500).send("There was a problem adding the document" + err);
        
        user = doc;
        console.log(user);

        res.redirect('/profile');
    });

});

module.exports = router;