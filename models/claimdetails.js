'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const claimSchema = mongoose.Schema({

    claim_no:String,
    rapidID: String,
    policyNumber:String,
    claimObjects: [Schema.Types.Mixed]
    
});


mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/digitalId', { useMongoClient: true });

mongoose.connect('mongodb://rpqb:rpqb123@ds131583.mlab.com:31583/digitalid', {
    useMongoClient: true
});



module.exports = mongoose.model('claimdetails', claimSchema);