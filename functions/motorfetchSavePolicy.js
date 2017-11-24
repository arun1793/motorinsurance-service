'use strict';

const motorsavepolicy = require('../models/motorsavepolicy');

exports.motorfetchSavePolicy = (userid) => {

    return new Promise((resolve, reject) => {



        motorsavepolicy.find({
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