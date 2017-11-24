'use strict';

const motorsavepolicy = require('../models/motorsavepolicy');
var ObjectId = require('mongodb').ObjectID

exports.motordeletesavepolicy = (_id) => {

    return new Promise((resolve, reject) => {

        motorsavepolicy
            .remove({_id: ObjectId(_id)})
            .then((policy) => {

               

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