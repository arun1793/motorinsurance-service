'use strict';

const user = require('../models/user');
var bcSdk = require('../src/blockchain/blockchain_sdk');
const users = 'risabh.s';



exports.updateprofile = (email, password, userObject, usertype) => new Promise((resolve, reject) => {

    user.findOneAndUpdate({
            email: email
        }, {
            $set: {

                password: password,
                userObject: userObject


            }
        }, {
            new: true
        })
        .then(() => resolve({
            status: 201,
            message: 'your profile updated successfully'
        }))
        .catch(err => {

            if (err.code == 11000) {

                reject({
                    status: 409,
                    message: 'your profile is up to date'
                });

            } else {

                reject({
                    status: 500,
                    message: 'Internal Server Error !'
                });
            }
        });
});