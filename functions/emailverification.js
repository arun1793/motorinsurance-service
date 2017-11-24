'use strict';

const user = require('../models/user');

exports.emailverification = (querymail) => {

    return new Promise((resolve, reject) => {

        user.findOneAndUpdate({
            encodedMail: querymail
        }, {
            $push: {
                status: "email"
            }
        }, {new: true}).then((users) => {

            console.log(users)

            resolve({status: 201, usr: users})

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