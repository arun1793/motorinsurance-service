'use strict';

const savepolicy = require('../models/savepolicy');

exports.fetchSavePolicy = (userid) => {

    return new Promise((resolve, reject) => {



        savepolicy.find({
                "id": userid
            })
            .then((policylist) => {

                console.log(policylist)

                resolve({
                    status: 201,
                    policylist: policylist
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