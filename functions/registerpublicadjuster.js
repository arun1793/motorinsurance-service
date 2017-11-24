'use strict';

const user = require('../models/user');

exports.registerPublicAdjuster = (liscenceid, firstname, lastname, email, phone, password) => new Promise((resolve, reject) => {

    const newUser = new user({

        liscenceid: liscenceid,
        firstname: firstname,
        lastname: lastname,
        email: email,
        phone: phone,
        password: password,

        created_at: new Date()
    });

    newUser
        .save()
        .then(() => resolve({status: 201, message: 'User Registered Sucessfully !'}))
        .catch(err => {

            if (err.code == 11000) {

                reject({status: 409, message: 'User Already Registered !'});

            } else {

                reject({status: 500, message: 'Internal Server Error !'});
            }
        });
});