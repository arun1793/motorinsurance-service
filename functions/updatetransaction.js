'use strict';
// const bc_client = require('../blockchain_sample_client'); const bcrypt =
// require('bcryptjs');
var bcSdk = require('../fabcar/invoke1.js');

exports.updatetransaction = (policyNumber,transactionString,id) => new Promise((resolve, reject) => {
    const transactiondetails = ({
        policyNumber: policyNumber,
        transactionString: transactionString,
        id: id
        
    });
    console.log("ENTERING THE CORE MODULE");
    bcSdk
        .updatetransaction({
            
            TransactionDetails: transactiondetails
        })
        .then(() => resolve({
            status: 201,
            message: 'Claim Notified Sucessfully !'
        }))
        .catch(err => {
            if (err.code == 11000) {
                reject({
                    status: 409,
                    message: 'some error !'
                });
            } else {
                console.log("error occurred" + err);
                reject({
                    status: 500,
                    message: 'Internal Server Error !'
                });
            }
        });
});