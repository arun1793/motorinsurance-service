'use strict';

const motorsavepolicy = require('../models/motorsavepolicy');
var ObjectId = require('mongodb').ObjectID

exports.motorsavepolicy = (id,_id,status, name, phone, email, regAreaCode, previousPolicyExpiry, registrationYear, carModel, fuelType, carVariant, existingInsurer) => new Promise((resolve, reject) => {

    const motorsavePolicy = new motorsavepolicy({

        id: id,
        name: name,
        phone: phone,

        email: email,
        regAreaCode: regAreaCode,
        previousPolicyExpiry: previousPolicyExpiry,
        registrationYear: registrationYear,
        carModel: carModel,

        fuelType: fuelType,
        carVariant: carVariant,
        existingInsurer: existingInsurer
       
    });
    if (status === "new") {
        motorsavePolicy
            .save()
            .then(() => resolve({status: 201, message: 'policy saved Sucessfully !', _id: motorsavePolicy._id}))
            .catch(err => {

                if (err.code == 11000) {

                    reject({status: 409, message: 'policy Already saved !'});

                } else {

                    reject({status: 500, message: 'Internal Server Error !'});
                }
            });
    } else if (status === "update") {

        motorsavepolicy.update({
            _id: ObjectId(_id)
        }, {

            $set: {
        id: id,
        name: name,
        phone: phone,

        email: email,
        regAreaCode: regAreaCode,
        previousPolicyExpiry: previousPolicyExpiry,
        registrationYear: registrationYear,
        carModel: carModel,

        fuelType: fuelType,
        carVariant: carVariant,
        existingInsurer: existingInsurer
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