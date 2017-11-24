'use strict';

//const user = require('../models/user');
var user = "risabh.s";
var getclaims = "getclaims";
const bcSdk =  require('../fabcar/query.js');

exports.fetch_Claim_list = (params) => {
    return new Promise((resolve, reject) => {
        bcSdk.fetchClaimlist({
                user: user,
                getclaims: getclaims
            })

            .then((claimArray) => {
                console.log("data in claimArray " + claimArray)
                return resolve({
                    status: 201,
                    "claimlist": claimArray
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