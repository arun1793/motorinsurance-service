'use strict';

//const user = require('../models/user');
var user = "risabh.s";
var getcusers = "getcusers";
const bcSdk = require('../src/blockchain/blockchain_sdk');

exports.fetch_Active_Campaign_list = (params) => {
    return new Promise((resolve, reject) => {
        bcSdk.fetchActiveCampaignlist({
                user: user,
                getcusers: getcusers
            })

            .then((campaignArray) => {
                return resolve({
                    status: 201,
                    "campaignlist": campaignArray
                })
            })



            .catch(err => {

                if (err.code == 11000) {

                    return reject({
                        status: 409,
                        message: 'cant fetch !'
                    });

                } else {
                    conslole.log("error occurred" + err);

                    return reject({
                        status: 500,
                        message: 'Internal Server Error !'
                    });
                }
            })
    })
};