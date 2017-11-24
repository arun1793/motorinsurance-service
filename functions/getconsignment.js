'use strict';

//const user = require('../models/user');
var user = "dhananjay.p";
var getconsignment = "getconsignment";
const bcSdk = require('../fabcar/query.js');

exports.fetch_consignmentlist = (params) => {
    return new Promise((resolve, reject) => {
        bcSdk.fetchConsignmentlist({
                user: user,
                getconsignment: getconsignment
            })

            .then((consignmentArray) => {
                console.log("data in policyArray " + consignmentArray)
                return resolve({
                    status: 201,
                    "consignmentlist": consignmentArray
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