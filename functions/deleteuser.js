'use strict';

const user = require('../models/user');


exports.deleteuser = (email) => {

    return new Promise((resolve, reject) => {

        user
            .remove({
                email: email
            })
            .then((users) => {



                resolve({
                    status: 201,
                    message: "deleted succefully"
                })

            })
            .catch(err => {

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