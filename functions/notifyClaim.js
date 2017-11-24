'use strict';

const claimschema = require('../models/claimdetails');
var bcSdk = require('../src/blockchain/blockchain_sdk');
const users = 'risabh.s';


exports.notifyClaim = (claim_no,policyNumber,id,NotificationClaim) => new Promise((resolve, reject) => {
   var Claim={NotificationClaim}
   console.log(Claim)
    const newClaim = new claimschema({
        claim_no:claim_no,
        policyNumber:policyNumber,
        rapidID: id,
        claimObjects: Claim
     
        
    });
    newClaim
        .save()
        .then(() => resolve({status: 201, message: 'Claim Notified Successfully'}))
        .catch(err => {

            if (err.code == 11000) {

                reject({status: 409, message: 'Already Claimed !'});

            } else {

                reject({status: 500, message: 'Internal Server Error !'});
            }
        });
});