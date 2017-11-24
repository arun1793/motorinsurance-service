'use strict';

const user = require('../models/user');

exports.loginUser = (email, password) =>

    new Promise((resolve, reject) => {



        user.find({
                "email": email
            })
            .then(users => {

                const dbpin = users[0].password;
                console.log(users[0].password)
                console.log(dbpin + "   " + users[0].password)

                if (String(password) === String(dbpin)) {

                    resolve({
                        status: 200,
                        message:"Logged in successfully",
                        users: users
                    });

                } else {

                    reject({
                        status: 402,
                        message: ' email or password wrong!'
                    });
                }
            })




            .then(users => {
                console.log(users)
                if (users.length == 0) {

                    reject({
                        status: 404,
                        message: 'User Not Found !'
                    });

                } else {

                    return users[0];

                }
            })


            .catch(err => reject({
                status: 401,
                message: 'user does not exist !'
            }));


    });