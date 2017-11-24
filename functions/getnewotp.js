'use strict';

const user = require('../models/user');

exports.getnewotp = (email,otp) => {

    return new Promise((resolve, reject) => {

        user.findOneAndUpdate({
            email: email
        }, {
            $set: {
                otp: otp,
                created_at:new Date()
            }
        }, {new: true}).then((users) => {

            console.log(users)

            resolve({status: 201, message: 'your new otp has been sent successfully to your email and phone'})

        }).catch(err => {

            if (err.code == 11000) {

                return reject({status: 409, message: 'cant fetch !'});

            } else {
                console.log("error occurred" + err);

                return reject({status: 500, message: 'Internal Server Error !'});
            }
        })
    })
};