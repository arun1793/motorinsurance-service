'use strict';

const savepolicy = require('../models/savepolicy');
var ObjectId = require('mongodb').ObjectID

exports.deletesavepolicy = (_id) => {

    return new Promise((resolve, reject) => {

        savepolicy
            .remove({_id: ObjectId(_id)})
            .then((policy) => {

                console.log(policy.deletedCount)

                resolve({status: 201, message: "deleted succefully"})

            })
            .catch(err => {

                if (err.code == 11000) {

                    return reject({status: 409, message: 'cant fetch !'});

                } else {
                    console.log("error occurred" + err);

                    return reject({status: 500, message: 'Internal Server Error !'});
                }
            })
    })
};