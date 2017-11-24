'use strict';

const request = require('../models/requestid');




exports.saveRequestId = (requestid) => new Promise((resolve, reject) => {
    console.log(requestid)

   const newRequestId = new request({

       requestid: requestid
      
    });
    newRequestId
        .save()
        .then(() => resolve({status: 201, message: 'requestid saved successfully'}))
        .catch(err => {

           if (err.code == 11000) {

               reject({status: 409, message: 'User Already Registered !'});

           } else {

               reject({status: 500, message: 'Internal Server Error !'});
            }
        });
});