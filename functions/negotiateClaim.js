'use strict';


const claim = require('../models/claimdetails');
var user = 'risabh.s';
var affiliation = 'fundraiser';

exports.negotiateClaim = (claim_no,Negotiations) =>{
  return  new Promise((resolve, reject) => {
      
       
        claim.find({ "claimObjects.NegotiateClaim": { $exists: true} })
        .then((claimlist) => {
            var claimarray=claimlist

            console.log(claimarray)

            if(claimarray.length==0){
        claim.findOneAndUpdate({
                claim_no: claim_no
            }, {
                $push: {
                    claimObjects: {NegotiateClaim:[{Negotiations}]}
                }
            }, {
                new: true
            }).then((claims)=>{
            resolve({status: 201, message: 'your Claim has been Validated'})


            }).catch(err => {

            if (err.code == 11000) {

                return reject({status: 409, message: 'cant fetch !'});

            } else {
                console.log("error occurred" + err);

                return reject({status: 500, message: 'Internal Server Error !'});
            }
        })

             
            }else{
             claim.findOneAndUpdate({
                claim_no: claim_no
            }, {
                $push: {
                    "claimObjects.4.NegotiateClaim":{Negotiations}
                }
            }, {
                new: true
            }).then((claims)=>{
           resolve({status: 201, message: 'your Claim has been Validated'})


            }).catch(err => {

            if (err.code == 11000) {

                return reject({status: 409, message: 'cant fetch !'});

            } else {
                console.log("error occurred" + err);

                return reject({status: 500, message: 'Internal Server Error !'});
            }
        })

            

            }

          
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

// var bcSdk = require('../fabcar/invoke.js');;
// var user = 'risabh.s';
// var affiliation = 'fundraiser';

// exports.negotiateClaim = (claim_no, negotiationamount, asperterm2B, id) =>
//     new Promise((resolve, reject) => {


//         const claim_details = ({
//             claim_no: claim_no,
//             negotiationamount: negotiationamount,
//             asperterm2B: asperterm2B,
//             id: id
//         });

//         console.log("ENTERING THE negotiateClaim from negotiateClaim.js to blockchainSdk");

//         bcSdk.negotiateClaim({
//                 user: user,
//                 ClaimDetails: claim_details
//             })



//             .then(() => resolve({
//                 status: 201,
//                 message: 'claim  negotiated Sucessfully !'
//             }))

//             .catch(err => {

//                 if (err.code == 11000) {

//                     reject({
//                         status: 409,
//                         message: ' claims already negotiated !'
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