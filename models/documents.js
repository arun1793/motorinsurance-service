'use strict';


const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var Photo = mongoose.Schema({
    url: {
        type: String,
        length: 255
    },

    userid: String,
    claimno:Number,

});
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://rpqb:rpqb123@ds131583.mlab.com:31583/digitalid', { useMongoClient: true });
module.exports = mongoose.model('files', Photo);
