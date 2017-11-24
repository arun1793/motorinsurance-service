'use strict';

const savepolicy = require('../models/savepolicy');
var ObjectId = require('mongodb').ObjectID

exports.savePolicy = (id, _id, status, consignmentWeight, consignmentValue, modeofTransport, packingMode, consignmentType, contractType, policyType, invoiceNo, policyIssueDate, policyEndDate, voyageStartDate, voyageEndDate) => new Promise((resolve, reject) => {

    const savePolicy = new savepolicy({

        id: id,
        consignmentWeight: consignmentWeight,
        consignmentValue: consignmentValue,

        modeofTransport: modeofTransport,
        packingMode: packingMode,
        consignmentType: consignmentType,
        contractType: contractType,
        policyType: policyType,

        invoiceNo: invoiceNo,
        policyIssueDate: policyIssueDate,
        policyEndDate: policyEndDate,
        voyageStartDate: voyageStartDate,
        voyageEndDate: voyageEndDate
    });
    if (status === "new") {
        savePolicy
            .save()
            .then(() => resolve({status: 201, message: 'policy saved Sucessfully !', _id: savePolicy._id}))
            .catch(err => {

                if (err.code == 11000) {

                    reject({status: 409, message: 'policy Already saved !'});

                } else {

                    reject({status: 500, message: 'Internal Server Error !'});
                }
            });
    } else if (status === "update") {

        savepolicy.update({
            _id: ObjectId(_id)
        }, {

            $set: {
                id: id,
                consignmentWeight: consignmentWeight,
                consignmentValue: consignmentValue,

                modeofTransport: modeofTransport,
                packingMode: packingMode,
                consignmentType: consignmentType,
                contractType: contractType,
                policyType: policyType,

                invoiceNo: invoiceNo,
                policyIssueDate: policyIssueDate,
                policyEndDate: policyEndDate,
                voyageStartDate: voyageStartDate,
                voyageEndDate: voyageEndDate
            }
        }).then(() => resolve({status: 201, message: 'policy updated and saved Sucessfully !', _id: _id})).catch(err => {

            if (err.code == 11000) {

                reject({status: 409, message: 'policy Already saved !'});

            } else {

                reject({status: 500, message: 'Internal Server Error !'});
            }
        });
    }

});