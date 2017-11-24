'use strict';

const user = require('../models/user');

exports.publicadjusterList = (userid) => {

    return new Promise((resolve, reject) => {

        user
            .find({usertype:"Public Adjuster"},{
                '_id':0,
              'rapidID':1,  
             'userObject.fname':1,
             'userObject.lname':1
}
            )
            .then(users => {
                console.log("users", users)
                var list = [];
                var fullname;
                for (let i = 0; i < users.length; i++) {
                    var rapidID=(users[i].rapidID);
                    fullname=users[i].userObject.fname +" "+ users[i].userObject.lname;
                    list.push({"fullname":fullname,
                        "rapidID":rapidID});
                   
                }
               console.log("list", list)
                resolve({
                    status: 201,
                    usr: list
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