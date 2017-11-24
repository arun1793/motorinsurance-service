'use strict';


const claim = require('../models/claimdetails');
var user = 'risabh.s';
var affiliation = 'fundraiser';
//exports is used here so that registerUser can be exposed for router and blockchainSdk file
exports.createClaim = (claim_no,SubmissionClaim) =>{
  return  new Promise((resolve, reject) => {
        claim.findOneAndUpdate({
                claim_no: claim_no
            }, {
                $push: {
                    claimObjects: {SubmissionClaim}
                }
            }, {
                new: true
            }).then((claim) => {

            console.log(claim)

            resolve({status: 201, message: 'your Claim has been submitted'})

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

