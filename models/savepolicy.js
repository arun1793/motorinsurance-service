'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const policySchema = mongoose.Schema({
    id: String,
    consignmentWeight: Number,
    consignmentValue: Number,

    modeofTransport: String,
    packingMode: String,
    consignmentType: String,
    contractType: String,
    policyType: String,

    invoiceNo: Number,
    policyIssueDate: String,
    policyEndDate: String,
    voyageStartDate: String,
    voyageEndDate: String
});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://rpqb:rpqb123@ds131583.mlab.com:31583/digitalid', { useMongoClient: true });

module.exports = mongoose.model('savepolicy', policySchema);
