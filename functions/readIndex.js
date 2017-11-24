'use strict';


const bcSdk = require('../fabcar/query1.js');

exports.readIndex = () => {
    return new Promise((resolve, reject) => {
        console.log("entering into readIndex function.....!")
        
       bcSdk.readIndex({}).then((readIndexArray) => {
            console.log("data in IndexArray " + readIndexArray)
            return resolve({
                status: 201,                
               query: readIndexArray
            })
        })
        .catch(err => {

           if (err.code == 11000) {

               return reject({
                    status: 409,
                    message: 'cant fetch !'
                });

           } else {
                console.log("error occurred" + err);

               return reject({
                    status: 500,
                    message: 'Internal Server Error !'
                });
            }
        })
    })
};