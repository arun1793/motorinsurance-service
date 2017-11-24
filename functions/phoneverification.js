'use strict';

const user = require('../models/user');

exports.phoneverification = (otp, phone, userinfo) => {

    return new Promise((resolve, reject) => {
        console.log(otp)
        if (userinfo === 'registeruser') {
            user.findOneAndUpdate({
                otp: otp
            }, {
                $push: {
                    status: "phone"
                }
            }, {
                new: true
            }).then((users) => {
                console.log(users)
                let userPhone = users._doc.userObject.phone;
                if (userPhone === phone)
                    resolve({
                        status: 201,
                        usr: users
                    })
                else
                    resolve({
                        status: 404,
                        message: "not a registered number"
                    })



            }).catch(err => {

                if (err.code == 11000) {

                    return reject({
                        status: 409,
                        message: 'cant fetch !'
                    });

                } else {
                    console.log("error occurred" + err);

                    return reject({
                        status: 500,
                        message: 'please enter a valid otp'
                    });
                }
            })
        } else if(userinfo==='verifyuser') {
            user.find({
                otp: otp
            }).then((users) => {
                console.log(users)
                let userPhone = users[0]._doc.userObject.phone;
                if (userPhone === phone)
                    resolve({
                        status: 202,
                        usr: users,
                        message: "otp verified succesfully"
                    })
                else
                    resolve({
                        status: 404,
                        message: "not a registered number"
                    })



            }).catch(err => {

                if (err.code == 11000) {

                    return reject({
                        status: 409,
                        message: 'cant fetch !'
                    });

                } else {
                    console.log("error occurred" + err);

                    return reject({
                        status: 500,
                        message: 'please enter a valid otp'
                    });
                }
            })



        }
    })

};