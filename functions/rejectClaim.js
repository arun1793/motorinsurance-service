'use strict';


const claim = require('../models/claimdetails');
var user = 'risabh.s';
var affiliation = 'fundraiser';

exports.rejectClaim = (claim_no,RejectionClaim) =>{
  return  new Promise((resolve, reject) => {
        claim.findOneAndUpdate({
                claim_no: claim_no
            }, {
                $push: {
                    claimObjects: {RejectionClaim}
                }
            }, {
                new: true
            }).then((claim) => {

            console.log(claim)

            resolve({status: 201, message: 'your Claim has been Rejected'})

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






// 'use strict';


// var bcSdk = require('../fabcar/invoke.js');
// var user = 'risabh.s';
// var affiliation = 'fundraiser';

// exports.rejectClaim = (claim_no) =>
//     new Promise((resolve, reject) => {


//         const claim_details = ({
//             claim_no: claim_no

//         });

//         console.log("ENTERING THE rejectClaim from rejectClaim.js to blockchainSdk");

//         bcSdk.rejectClaim({
//                 user: user,
//                 ClaimDetails: claim_details
//             })



//             .then(() => resolve({
//                 status: 201,
//                 message: 'claim  rejected  !'
//             }))

//             .catch(err => {

//                 if (err.code == 11000) {

//                     reject({
//                         status: 409,
//                         message: ' claims reject !'
//                     });

//                 } else {
//                     console.log("error occurred" + err);

//                     reject({
//                         status: 500,
//                         message: 'Internal Server Error !'
//                     });
//                 }
//             });
//     });