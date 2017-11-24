'use strict';

const claim = require('../models/claimdetails');

exports.negotiateClaimFind = (claim_no) => {

    return new Promise((resolve, reject) => {

        claim
            .find({claim_no:claim_no},{
                  
              "claimObjects.NegotiateClaim":1
             
             }).then(claims => {
                var totalnegotiations=claims[0]._doc.claimObjects[4].NegotiateClaim
                console.log(totalnegotiations.length)
                var lastnegotiation=totalnegotiations[(totalnegotiations.length)-1]
                 console.log(lastnegotiation)
                resolve({
                    status: 201,
                    negotiationAmount: lastnegotiation.Negotiations.NegotiationAmount
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