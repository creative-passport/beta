/* Main Application Set Up*/
require('dotenv').config();

const https = require('https');
const fs = require('fs');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const CustomStrategy = require('passport-custom').Strategy;
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const flash = require('connect-flash');
var express_enforces_ssl = require('express-enforces-ssl');
const aws = require('aws-sdk');

// Yoti Config
const yoti = require('yoti');
const CLIENT_SDK_ID = 'f8378961-dd6d-4fef-aad0-cfe4490b3dc3';
const PEM_PATH = './Creative Passport Cayce-access-security.pem';
const PEM_KEY = fs.readFileSync(PEM_PATH);

// For SDK version < 3
//const yotiClient = new yoti(CLIENT_SDK_ID, PEM);

// For SDK version >= 3
const yotiClient = new yoti.Client(CLIENT_SDK_ID, PEM_KEY);

// Set up AWS Config
// Set the AWS Region
aws.config.update({
            region: 'eu-west-1' 
        });

// Create SQS service object
// Create an SQS service object
var sqs = new aws.SQS({
    apiVersion: '2012-11-05'
});

mongoose.promise = global.Promise;
mongoose.set('useCreateIndex', true);

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Initiate our app
const app = express();
const port = 8080;

app.enable('trust proxy');

app.use(express_enforces_ssl());

//Configure our app
app.use(flash());

app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'passport-beta',
    cookie: {
        maxAge: 3600000
    },
    resave: false,
    saveUninitialized: false
}));
// Set the page template engine
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session()); // Used to persist login sessions

// Require the User Schema Model
var User = require('./models/User');
var Issuance = require('./models/Issuance');

// Database connection
var db = require('./db');

if (!isProduction) {
    app.use(errorHandler());
}

const versionAssignment = process.env.CP_BETA_VERSION;

/* IBM Agent Check */
const Agent = require('openssi-websdk').Agent;

const account_url = process.env.IBM_CREDENTIAL_URL;
const agent_name = process.env.IBM_CREDENTIAL_AGENT_NAME;
const agent_password = process.env.IBM_CREDENTIAL_AGENT_PASSWORD;
const cred_def_id = process.env.IBM_CREDENTIAL_DEF_ID;
const proof_schema_id = process.env.IBM_PROOF_SCHEMA_ID;

// Check values on console
console.log(account_url);
console.log(agent_name);
console.log(agent_password);

const agent = new Agent(account_url, agent_name, agent_password);

// Async
(async () => {
    try {
        // Check the username and password by hitting the API
        const agentInfo = await agent.getIdentity();
        console.log(`Agent info: ${JSON.stringify(agentInfo, 0, 1)}`);
    } catch(err){
        console.log(err);
    }
});

// Non Async
/*
const agent = new Agent(account_url, agent_name, agent_password);

// Return agent info - non Async
agent.getIdentity().then((agent_info) => {
    console.log(`Agent Info: ${JSON.stringify(agent_info, 0, 1)}`)
});
*/

// PASSPORT LOCAL AUTHENTICATION 
passport.use(new LocalStrategy(
    function (username, password, done) {
        console.log('Verifying User account');
        User.findOne({
            username: username
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            if (!user.validPassword(password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return done(null, user);
        });
    }
));


// Passport Custom Strategy for Credential Authentication
passport.use('credentialStrategy', new CustomStrategy(
    function(req, done) {
        console.log('Passed Email : ' + req.email);
        User.findOne({
            username: req.email
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            return done(null, user);
        });
    }
));

// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// Middleware to check if the user is authenticated
function isUserAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/signin');
    }
}

function userWalletAddress(email) {
    console.log('Finding user with email address: ' + email);
    User.findOne({
        username: email
    }, function (err, user) {
        if (err) {
            console.log(err);
            return done(err);
        }
        if (!user) {
            console.log('No User Found!');
            return done(null);
        }
        if (!user.wallet_id_ibm){
            console.log('No Wallet URL');
            return done(null);
        }
        
        console.log('Wallet URL to be returned to calling function: ' + user.wallet_id_ibm);
        return new Promise(user.wallet_id_ibm);
    });
}

function displayTidyLists(list) {
    var items = list.split(',');
    
}
// Routes
var UserController = require('./routes/api/UserController');

app.use('/api/user', UserController);

// Homepage
app.get('/', (req, res) => {
    res.render('homepage.ejs');
    //    res.send('Running')
});

// Logout route
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/error', (req, res) => {
    res.render('error.ejs');
});

app.get('/success', (req, res) => {
    res.render('success.ejs');
});

// User register
app.get('/register', (req, res) => {
    // Show the user register form
    let message = req.flash('message');
    res.render('register.ejs', {
        message: message
    });
});

app.get('/signin', (req, res) => {
    let message = req.flash('message');
    res.render('signin.ejs', {
        message: message
    });
});

// Secret route
app.get('/secret', isUserAuthenticated, (req, res) => {
    res.send('You have reached the secret route');
});

app.get('/scan', isUserAuthenticated, (req, res) => {
    // Scan a QRcode Passport ID
    res.render('scan.ejs', { user: req.user } );
});

app.get('/profile', isUserAuthenticated, (req, res) => {

    console.log(req.user);

    var date = new Date(req.user.date_joined);
    let message = req.flash('message');



   // res.render('profile.ejs', {
    res.render('profile_new.ejs', {
        user: req.user,
        date: date,
        message: message
    });
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/error'
    }));

app.post('/credential_auth', async (req, res) => {
    console.log('Submitted Email Address : ' + req.body.email);

    // Request a verification credential from the user
    try {
        // Check the username and password by hitting the API
        const agentInfo = await agent.getIdentity();
        console.log(`Agent info: ${JSON.stringify(agentInfo, 0, 1)}`);
    } catch (err) {
        console.log(err);
    }

    try {
        // Check / Get the wallet address for that email address
        //var walletAddress = await userWalletAddress(req.body.email);
        //console.log('The given wallet address is : ' + walletAddress);
        var user = await User.findOne({username: req.body.email}).exec();

        var to = {
            url: user.wallet_id_ibm
        };
    

        const connection_offer = await agent.createConnection(to);
        const accepted_connection = await agent.waitForConnection(connection_offer.id);
        console.log(`Accepted Connection: ${JSON.stringify(accepted_connection, 0, 1)}`);
        var didto = {
            did: accepted_connection.remote.pairwise.did
        };

        const proof_request = await agent.createVerification(didto, proof_schema_id, 'outbound_proof_request');
        console.log(proof_request);
        const finished_verification = await agent.waitForVerification(proof_request.id);
        console.log(finished_verification);

        const opts = {
            state: 'inbound_proof_request'
        };

        const inbound_proof_requests = await agent.getVerifications(opts);
        console.log(inbound_proof_requests);
        for (const index in inbound_proof_requests) {
            const verification = inbound_proof_requests[index];
            console.log(verification);
            await agent.updateVerification(verification.id, 'proof_generated');
            await agent.updateVerification(verification.id, 'proof_shared');
        }

        for (const index in finished_verification.info.attributes) {
            const attr = finished_verification.info.attributes[index];

            console.log(`${attr.cred_def_id ? '*' : ' '}${attr.name} = ${attr.value}`);

            if(attr.name = "email") {
                console.log('Sign In By Credential');
                console.log(attr.value);
                User.findOne({
                    username: attr.value
                }, function (err, user) {
                    if (err) {
                        //return res.status(500).send("There was a problem adding the document" + err);
                        req.flash('message', 'That email address has already registered. Please try again, or get in touch.')
                        res.redirect('/register');
                    } else {
                        console.log(user);
                        req.login(user, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            return res.redirect('/profile');
                        });
                    }
                });
            }

        }   
    } catch (error) {
        console.log(error);
    }
});

app.get('/imreal', async (req, res) => {
    // Call back for Yoti.
    console.log(req.query.token);

    yotiClient.getActivityDetails(req.query.token)
        .then((activityDetails) => {
            console.log(activityDetails);
            const rememberMeId = activityDetails.getRememberMeId();
            const parentRememberMeId = activityDetails.getParentRememberMeId();
            const receiptId = activityDetails.getReceiptId();
            const timestamp = activityDetails.getTimestamp();
            const base64SelfieUri = activityDetails.getBase64SelfieUri();

            //const userProfile = activityDetails.getUserProfile(); // deprecated, use getProfile() instead
            const profile = activityDetails.getProfile();

            const applicationProfile = activityDetails.getApplicationProfile();
            //const selfieImageData = profile.getSelfie().getValue();
            const fullName = profile.getFullName().getValue();
            const familyName = profile.getFamilyName().getValue();
            const givenNames = profile.getGivenNames().getValue();
            const phoneNumber = profile.getPhoneNumber().getValue();
            const emailAddress = profile.getEmailAddress().getValue();
            //const dateOfBirth = profile.getDateOfBirth().getValue();
            //const postalAddress = profile.getPostalAddress().getValue();
            //const structuredPostalAddress = profile.getStructuredPostalAddress().getValue();
            const gender = profile.getGender().getValue();
            //const nationality = profile.getNationality().getValue();
            //const ageVerified = profile.getAgeVerified().getValue();
            //const documentDetails = profile.getDocumentDetails().getValue();
            const applicationName = applicationProfile.getName().getValue();
            const applicationUrl = applicationProfile.getUrl().getValue();
            const applicationLogo = applicationProfile.getLogo().getValue();
            const applicationReceiptBgColor = applicationProfile.getReceiptBgColor().getValue();

            // You can retrieve the sources and verifiers for each attribute as follows
            const givenNamesObj = profile.getGivenNames()
            const givenNamesSources = givenNamesObj.getSources(); // list/array of anchors
            const givenNamesVerifiers = givenNamesObj.getVerifiers(); // list/array of anchor

            // You can also retrieve further properties from these respective anchors in the following way:
            // Retrieving properties of the first anchor
            //const value = givenNamesSources[0].getValue(); // string
            //const subtype = givenNamesSources[0].getSubType(); // string
            //const timestamp = givenNamesSources[0].getSignedTimeStamp().getTimestamp(); // Date object
            //const originServerCerts = givenNamesSources[0].getOriginServerCerts(); // list of X509 certificates

            console.log('Full Name: ' + fullName);
            console.log(givenNamesSources);
            console.log(givenNamesVerifiers);
            //console.log(documentDetails);
            res.redirect('/yoti');
        });

});

app.get('/yoti', async (req, res) => {
    res.render('yoti-test.ejs');
});

app.get('/issue', isUserAuthenticated, async (req, res) => {
    try {
        // Check the username and password by hitting the API
        const agentInfo = await agent.getIdentity();
        console.log(`Agent info: ${JSON.stringify(agentInfo, 0, 1)}`);
    } catch (err) {
        console.log(err);
    }

    try {
        var to = {
            url: req.user.wallet_id_ibm
        };

        const connection_offer = await agent.createConnection(to);
        const accepted_connection = await agent.waitForConnection(connection_offer.id);
        console.log(`Accepted Connection: ${JSON.stringify(accepted_connection, 0, 1)}`);
        var didto = {
            did: accepted_connection.remote.pairwise.did
        };

        const attributes = {
            'persona_name': req.user.persona,
            'email': req.user.username,
            'date' : req.user.date_joined.toDateString(),
            'myceliaID' : req.user._id.toString()
        };

        console.log(`DID To: ${JSON.stringify(didto, 0, 1)}`);
        console.log(`Credential Definition ID: ${cred_def_id}`);
        console.log(`Attributes: ${JSON.stringify(attributes, 0, 1)}`);
        const credential_offer = await agent.offerCredential(didto, cred_def_id, attributes, {name: 'mycelia'});
        console.log(`Credential Offer: ${JSON.stringify(credential_offer, 0, 1)}`);
        const issued_credential = await agent.waitForCredential(credential_offer.id);
        console.log(`Issued Credential: ${JSON.stringify(issued_credential, 0, 1)}`);   
        console.log('##############################################################################');     
        
        // Create a record that a credential has been issued for this user on this date
        Issuance.create({
            passportID: req.user._id,
            dateCreated: Date.now()
        },
        (err, issuance) => {
            if (err) {
                //return res.status(500).send("There was a problem adding the document" + err);
                req.flash('message', 'There was a problem recording the credential issuance.');
            } 
        });
    } catch (error) {
        console.log(error);
    }
    res.redirect('/profile');
});

// End of Application Routes

/*
//Error handlers & middlewares
if (!isProduction) {
    app.use((err, req, res) => {
        res.status(err.status || 500);

        res.json({
            errors: {
                message: err.message,
                error: err,
            },
        });
    });
}

app.use((err, req, res) => {
    res.status(err.status || 500);

    res.json({
        errors: {
            message: err.message,
            error: {},
        },
    });
});
*/

// For deployment
app.listen(port, () => console.log(`Creative Passport Core Services listening on port ${port}!`));

// Running locally on development machine
/*
https.createServer({
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    }, app).listen(port, () => {
    console.log(`Creative Passport Core Services listening on port ${port}!`)
});
*/