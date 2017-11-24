'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const policySchema = mongoose.Schema({

    
    rapidID: String,
    policyNumber:String,
    created_at: String,
    policyObject: Object,
    vehicleObject:Object
    
   
    

});


mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/digitalId', { useMongoClient: true });

mongoose.connect('mongodb://rpqb:rpqb123@ds131583.mlab.com:31583/digitalid', {
    useMongoClient: true
});



module.exports = mongoose.model('policydetails', policySchema);