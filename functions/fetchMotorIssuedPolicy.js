'use strict';

const policydetails = require('../models/policydetails');

exports.fetchMotorIssuedPolicy = (userid) => {

    return new Promise((resolve, reject) => {

        policydetails
            .find({rapidID:userid},{
             'policyObject.policyName':1,
             'created_at':1,  
             'policyObject.premiumAmount':1,
             'policyObject.sumInsured':1,
             'policyObject.name':1,
             'policyNumber':1,
}
            )
            .then(policylist => {
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