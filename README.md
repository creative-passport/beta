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


# Notd on `git and GitHub

git push origin development

Branches

git checkout -b [name_of_your_new_branch]

 git branch -a  -> will show all branches

 Then you need to apply to merge changes, if your branch is derivated from develop you need to do :

$ git merge [name_of_your_remote]/develop
Delete a branch on your local filesystem :

$ git branch -d [name_of_your_new_branch]
To force the deletion of local branch on your filesystem :

$ git branch -D [name_of_your_new_branch]
Delete the branch on github :

$ git push origin :[name_of_your_new_branch]

From: https://github.com/Kunena/Kunena-Forum/wiki/Create-a-new-branch-with-git-and-manage-branches

When you do a pull request on a branch, you can continue to work on another branch and make another pull request on this other branch.

Before creating a new branch, pull the changes from upstream. Your master needs to be up to date.

$ git pull
Create the branch on your local machine and switch in this branch :

$ git checkout -b [name_of_your_new_branch]
Push the branch on github :

$ git push origin [name_of_your_new_branch]
When you want to commit something in your branch, be sure to be in your branch. Add -u parameter to set upstream.

You can see all branches created by using :

$ git branch -a
Which will show :

* approval_messages
  master
  master_clean
Add a new remote for your branch :

$ git remote add [name_of_your_remote] [name_of_your_new_branch]
Push changes from your commit into your branch :

$ git push [name_of_your_new_remote] [url]
Update your branch when the original branch from official repository has been updated :

$ git fetch [name_of_your_remote]
Then you need to apply to merge changes, if your branch is derivated from develop you need to do :

$ git merge [name_of_your_remote]/develop
Delete a branch on your local filesystem :

$ git branch -d [name_of_your_new_branch]
To force the deletion of local branch on your filesystem :

$ git branch -D [name_of_your_new_branch]
Delete the branch on github :

$ git push origin :[name_of_your_new_branch]
The only difference is the : to say delete, you can do it too by using github interface to remove branch : https://help.github.com/articles/deleting-unused-branches.

If you want to change default branch, it's so easy with github, in your fork go into Admin and in the drop-down list default branch choose what you want.

If you want create a new branch:

$ git branch <name_of_your_new_branch>