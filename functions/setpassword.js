'use strict';

const user = require('../models/user');

exports.setpassword = (email, password) => {

    return new Promise((resolve, reject) => {

        user.findOneAndUpdate({
            email: email
        }, {
            $set: {
                password: password
            }
        }, {
            new: true
        }).then((users) => {

            console.log(users)

            resolve({
                status: 201,
                message: 'your password has been updated successfully'
            })

        }).catch(err => {

            if (err.code == 11000) {

                return reject({
                    status: 409,
                    message: 'cant fetch !'
                });

            } else {
                console.log("error occurred" + err);

                return reject({
                    status: 500,
                    message: 'Internal Server Error !'
                });
            }
        })
    })
};