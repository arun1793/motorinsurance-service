'use strict';


const claim = require('../models/claimdetails');
var user = 'risabh.s';
var affiliation = 'fundraiser';

exports.examineClaim = (claim_no,ExamineClaim) =>{
  return  new Promise((resolve, reject) => {
        claim.findOneAndUpdate({
                claim_no: claim_no
            }, {
                $push: {
                    claimObjects: {ExamineClaim}
                }
            }, {
                new: true
            }).then((claim) => {

            console.log(claim)

            resolve({status: 201, message: 'your Claim has been Examined'})

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

// exports.examineClaim = (claim_no, assesseddamagevalue, assessedclaimvalue, examinerid) =>
//     new Promise((resolve, reject) => {


//         const claim_details = ({
//             claim_no: claim_no,
//             assesseddamagevalue: assesseddamagevalue,
//             assessedclaimvalue: assessedclaimvalue,
//             examinerid: examinerid
//         });

//         console.log("ENTERING THE examineClaim from examineClaim.js to blockchainSdk");

//         bcSdk.examineClaim({
//                 user: user,
//                 ClaimDetails: claim_details
//             })



//             .then(() => resolve({
//                 status: 201,
//                 message: 'claim value examined Sucessfully !'
//             }))

//             .catch(err => {

//                 if (err.code == 11000) {

//                     reject({
//                         status: 409,
//                         message: ' claims already examined !'
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