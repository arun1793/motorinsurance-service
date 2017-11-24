'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const policySchema = mongoose.Schema({
    id: String,
    name: String,
    phone: String,

    email: String,
    regAreaCode: String,
    previousPolicyExpiry: String,
    registrationYear: String,
    carModel: String,

    fuelType: String,
    carVariant: String,
    existingInsurer: String
});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://rpqb:rpqb123@ds131583.mlab.com:31583/digitalid', { useMongoClient: true });

module.exports = mongoose.model('motorsavepolicy', policySchema);
