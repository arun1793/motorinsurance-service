'use strict';

const user = require('../models/user');

exports.userfullname = (rapidid) => {

    return new Promise((resolve, reject) => {

        user
            .find({rapidID:rapidid},{
                  
             'userObject.fname':1,
             'userObject.lname':1
             }).then(users => {
                console.log("users", users)
                
                var fullname;
                for (let i = 0; i < users.length; i++) {
                    
                    fullname=users[i].userObject.fname +" "+ users[i].userObject.lname;
                    
                   
                }
               console.log("fullname", fullname)
                resolve({
                    status: 201,
                    usr: fullname
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