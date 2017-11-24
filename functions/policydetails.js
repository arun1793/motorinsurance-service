'use strict';

const policyschema = require('../models/policydetails');
var bcSdk = require('../src/blockchain/blockchain_sdk');
const users = 'risabh.s';


exports.policydetails = (policyNumber,id, policy,vehicle) => new Promise((resolve, reject) => {

    const newPolicy = new policyschema({

        policyNumber:policyNumber,
        rapidID: id,
        policyObject: policy,
        vehicleObject:vehicle,
      
        created_at: new Date(),
        
    });
    newPolicy
        .save()
        .then(() => resolve({status: 201, message: 'Policy issued succesfully'}))
        .catch(err => {

            if (err.code == 11000) {

                reject({status: 409, message: 'Policy Already Issued !'});

            } else {

                reject({status: 500, message: 'Internal Server Error !'});
            }
        });
});