'use strict';

const user = require('../models/user');

exports.getotpcount = (email, count) => {

    return new Promise((resolve, reject) => {

        user.findOneAndUpdate({
            email: email
        }, {
            $set: {
                count: count

            }
        }, {
            new: true
        }).then((users) => {

            console.log(users)

            resolve({
                status: 201,
                count: users._doc.count,
                email: users._doc.email
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