# Creative Passport Beta Microservices

This codebase prototypes the core microsservices for the Creative Passport.

All calls are made via a /api/DOMAIN call.

Client side is delivered via /DOMAIN functions

The Client will be replaced by a separate React based client, and then possibly a React Native developed client.

## Server Names
Using names from the Bigend trilogy by William Gibson

### hubertus.creativepassport.net
This is a backend data reporting server / services. Initially it will capture useful data on the usage of the 
Creative Passport, number of accounts created, locations set as well as collecting the name values for passport 
parameters as entered by the users

### cayce.creativepassport.net
Manages the front end client delivery. This will include delivering PWA applications.

### pollard.creativepassport.net
Backend API calls for the cayce frontend/s

Google Cloud Deployment
gcloud --project=creativepassport-miami app deploy app.yaml -v v1

## To Do
Basic Profile
* Forgot Password - reset password
** Verify password on sign-up page (enter twice). 
* Verify email address
* Add in phone number ?
* QR Code Scanner
** Display QR Code for your Passport
** Scan a QR Code 
** Add details around the link 
** Increase link count on Profile Page
* Add Location setting for Profile
* Add Skills list for Profile
* Add Interests list for Profile
* Add website link for Profile
* 
Credentials
* Issue Credential
** Publish core redential schema
** Publish Creative Passport DID 
