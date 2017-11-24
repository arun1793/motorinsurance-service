'use strict';

const user = require('../models/user');
var bcSdk = require('../src/blockchain/blockchain_sdk');
const users = 'risabh.s';


exports.registerUser = (email, password, rapidID, userObject, usertype, otp, encodedMail) => new Promise((resolve, reject) => {

    const newUser = new user({

        email: email,
        password: password,
        rapidID: rapidID,
        userObject: userObject,
        usertype: usertype,
        status: [],
        otp: otp,
        encodedMail: encodedMail,
        created_at: new Date(),
        count:0
    });
    newUser
        .save()
        .then(() => resolve({status: 201, message: 'Please verify your emailid and phone no'}))
        .catch(err => {

            if (err.code == 11000) {

                reject({status: 409, message: 'User Already Registered !'});

            } else {

                reject({status: 500, message: 'Internal Server Error !'});
            }
        });
});