'use strict';


var bcSdk = require('../fabcar/invoke.js');
var user = 'dhananjay.p';
var affiliation = 'marine';


exports.consignmentDetail = (id, consignmentWeight, consignmentValue, policyName, sumInsured, premiumAmount, modeofTransport, packingMode, consignmentType, contractType, policyType, email, policyHolderName, userType, invoiceNo, policyNumber, policyIssueDate, policyEndDate, voyageStartDate, voyageEndDate) =>
    new Promise((resolve, reject) => {
        const policy = ({

            id: id,
            consignmentWeight: consignmentWeight,
            consignmentValue: consignmentValue,
            policyName: policyName,
            sumInsured: sumInsured,
            premiumAmount: premiumAmount,
            modeofTransport: modeofTransport,
            packingMode: packingMode,
            consignmentType: consignmentType,
            contractType: contractType,
            policyType: policyType,
            email: email,
            policyHolderName: policyHolderName,
            userType: userType,
            invoiceNo: invoiceNo,
            policyNumber: policyNumber,
            policyIssueDate: policyIssueDate,
            policyEndDate: policyEndDate,
            voyageStartDate: voyageStartDate,
            voyageEndDate: voyageEndDate


        });

        bcSdk.consignmentdetail({
                user: user,
                ConsignmentDetails: policy
            })

            .then(() => resolve({
                "status": true,
                "message": "policy fetched"
            }))

            .catch(err => {

                if (err.code == 409) {

                    reject({
                        "status": false,
                        message: 'already fetched'
                    });

                } else {
                    console.log("error occurred" + err);

                    reject({
                        "status": false,
                        message: 'Internal Server Error !'
                    });
                }
            });
    });