// This is just a sample script. Paste your real code (javascript or HTML) here.
// here only routing is done and if the ro
'use strict';

var crypto = require('crypto');
const jwt = require('jsonwebtoken');
var request = require('request');
var cors = require('cors');
var dateTime = require('node-datetime');
var Promises = require('promise');
const date = require('date-and-time');
const Nexmo = require('nexmo');
var mongoose = require('mongoose');
var Photo = require('./models/documents');
var path = require('path');
var cloudinary = require('cloudinary').v2;
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const nodemailer = require('nodemailer');
const config = require('./config/config.json');

const register = require('./functions/register');
const login = require('./functions/login');
const updateprofile = require('./functions/updateprofile');
const verifyemail = require('./functions/emailverification');
const verifyphone = require('./functions/phoneverification');
const getnewotp = require('./functions/getnewotp');
const setpassword = require('./functions/setpassword');
const deleteuser = require('./functions/deleteuser');
const getotpcount = require('./functions/getotpcount');
const registerpublicadjuster = require('./functions/registerpublicadjuster');
const publicadjusterList = require('./functions/publicadjusterList');
const userfullname = require('./functions/userfullname');
const User = require('./functions/getUser');

const motorsavepolicy = require('./functions/motorsavepolicy');
const motorfetchSavePolicy = require('./functions/motorfetchSavePolicy');
const motordeletesavepolicy = require('./functions/motordeletesavepolicy');
const policydetails = require('./functions/policydetails');
const savetransaction = require('./functions/savetransaction');
const fetchMotorIssuedPolicy = require('./functions/fetchMotorIssuedPolicy');
const readRequest = require('./functions/readRequest');
const readIndex = require('./functions/readIndex');
const readAllRequest = require('./functions/readAllRequest');
const updatetransaction = require('./functions/updatetransaction');

const notifyClaim = require('./functions/notifyClaim');
const createClaim = require('./functions/createClaim');
const rejectClaim = require('./functions/rejectClaim');
const examineClaim = require('./functions/examineClaim');
const negotiateClaim = require('./functions/negotiateClaim');
const negotiateClaimFind = require('./functions/negotiateClaimFind');
const approveClaim = require('./functions/approveClaim');
const settleClaim = require('./functions/settleClaim');
const fetchClaimlist = require('./functions/fetchClaimlist');

const nexmo = new Nexmo({
    apiKey: 'f538dd31',
    apiSecret: '903787c18f0cca8e'
});

// connection to email API
var transporter = nodemailer.createTransport("SMTP", {
    host: 'smtp.ipage.com',
    port: 587,
    secure: true,
    auth: {
        user: "vikram.viswanathan@rapidqube.com",
        pass: "Rpqb@12345"
    }
});

var requestList = [];

module.exports = router => {

    router.get('/', (req, res) => res.send("Welcome to commercial-insurance,please hit a service !"));

    router.post('/registerUser', cors(), (req, res) => {

        const email = req.body.email;
        console.log(email);
        var emailtosend = email;
        console.log(emailtosend);
        const password = req.body.password;
        console.log(password);
        const rapidID = crypto
            .createHash('sha256')
            .update(email)
            .digest('base64');
        console.log(rapidID);
        const userObject = req.body.userObject;
        console.log(userObject);
        var phonetosend = userObject.phone;
        const usertype = req.body.usertype;
        console.log(usertype);
        var otp = "";
        var possible = "0123456789";
        for (var i = 0; i < 4; i++)
            otp += possible.charAt(Math.floor(Math.random() * possible.length));
        console.log("otp" + otp);
        var remoteHost = "apidigi.herokuapp.com";
        console.log(remoteHost);
        var encodedMail = new Buffer(req.body.email).toString('base64');

        if (!email || !password || !usertype) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });

        } else {

            register
                .registerUser(email, password, rapidID, userObject, usertype, otp, encodedMail)
                .then(result => {

                    var link = "https://" + remoteHost + "/email/verify?mail=" + encodedMail + "&email=" + email;

                    var otptosend = 'your otp is ' + otp;
                    var mailOptions = {
                        transport: transporter,
                        from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                        to: emailtosend,
                        subject: 'Please confirm your Email account',

                        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {}
                    });
                    nexmo
                        .message
                        .sendSms('919768135452', phonetosend, otptosend, {
                            type: 'unicode'
                        }, (err, responseData) => {
                            if (responseData) {
                                console.log(responseData)
                            }
                        });
                    res
                        .status(result.status)
                        .json({
                            message: result.message,
                            email: email,
                            phone: phonetosend
                        });

                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }).json({
                    status: err.status
                }));
        }
    });

    router.post('/login', cors(), (req, res) => {

        const email = req.body.email;

        const password = req.body.password;

        if (!email) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });

        } else {
            User
                .getUser(email)
                .then(result => {
                    if (result.usr.length == 0) {
                        res.send({
                            status: 401,
                            message: 'user does not exist !'
                        });
                    } else {
                        var status = result.usr[0]._doc.status
                        if (status.length == 2) {
                            login
                                .loginUser(email, password)
                                .then(result => {

                                    const token = jwt.sign(result, config.secret, {
                                        expiresIn: 60000
                                    })

                                    res
                                        .status(result.status)
                                        .json({
                                            message: result.message,
                                            token: token,
                                            userdetails: result.users[0]
                                        });

                                })
                                .catch(err => res.status(err.status).json({
                                    message: err.message
                                }));
                        } else {
                            res
                                .status(403)
                                .json({
                                    message: "email or phone no has not been verified",
                                    status: false
                                });
                        }
                    }
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        }
    });

    router.post('/UpdateProfile', cors(), (req, res) => {

        const email = req.body.email;
        console.log(email);
        var emailtosend = email;
        console.log(emailtosend);
        const password = req.body.password;
        console.log(password);

        const userObject = req.body.userObject;
        console.log(userObject);

        const usertype = req.body.usertype;
        console.log(usertype);

        if (!email || !password || !usertype) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });

        } else {

            updateprofile
                .updateprofile(email, password, userObject, usertype)
                .then(result => {

                    res
                        .status(result.status)
                        .json({
                            message: result.message
                        });

                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }).json({
                    status: err.status
                }));
        }
    });

    router.get("/email/verify", cors(), (req, res, next) => {
        var status;
        var querymail = req.query.mail;
        var email = req.query.email;
        console.log("URL: " + querymail);
        console.log("email: " + email);
        User
            .getUser(email)
            .then(result => {
                var minutes1 = new Date(result.usr[0]._doc.created_at).getMinutes();
                console.log("minutes1" + minutes1);
                var minutes2 = new Date().getMinutes();
                console.log("minutes2" + minutes2);
                var diffinminutes = minutes2 - minutes1;
                if (diffinminutes > 10) {
                    deleteuser
                        .deleteuser(email)
                        .then(result => {
                            res.send({
                                status: 201,
                                message: 'your email link has been expired please register again'
                            });
                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));

                } else {
                    verifyemail
                        .emailverification(querymail)
                        .then(result => {
                            var status = result.usr.status
                            if (status.length == 2) {
                                res.send({
                                    "status": true,
                                    "message": "registration successful"
                                });
                            } else {

                                res.send({
                                    "status": false,
                                    "message": "please verify mobile no too"
                                });
                            }

                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));
                }
            });
    });

    router.post("/newotp", cors(), (req, res, next) => {
        var phonetosend = req.body.phone;
        var email = req.body.email;
        var emailtosend = email;
        var otp = "";
        var possible = "0123456789";
        for (var i = 0; i < 4; i++)
            otp += possible.charAt(Math.floor(Math.random() * possible.length));
        var otptosend = 'your new otp is ' + otp;

        if (!email || !phonetosend) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });

        } else {

            var mailOptions = {
                transport: transporter,
                from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                to: emailtosend,
                subject: 'OTP Confirmation',

                html: "Hello,<br> Your Otp is.<br> " + otp
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {}
            });
            nexmo
                .message
                .sendSms('919768135452', phonetosend, otptosend, {
                    type: 'unicode'
                }, (err, responseData) => {
                    if (responseData) {
                        console.log(responseData)
                    }
                });
            getnewotp
                .getnewotp(email, otp)
                .then(result => {
                    res
                        .status(result.status)
                        .json({
                            message: result.message
                        });
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        }
    });

    router.post("/getotpcount", cors(), (req, res, next) => {
        var count = req.body.count;
        var email = req.body.email;

        getotpcount
            .getotpcount(email, count)
            .then(result => {
                res
                    .status(result.status)
                    .json({
                        email: result.email,
                        count: result.count
                    });
            })
            .catch(err => res.status(err.status).json({
                message: err.message
            }));
    });

    router.post("/user/phoneverification", cors(), (req, res) => {
        const email = req.body.email;
        const phone = req.body.phone;
        var otp = req.body.otp;
        const userinfo = req.body.user;
        console.log(otp);
        console.log(phone);
        console.log(userinfo);
        User
            .getUser(email)
            .then(result => {
                var minutes1 = new Date(result.usr[0]._doc.created_at).getMinutes();
                console.log("minutes1" + minutes1);
                var minutes2 = new Date().getMinutes();
                console.log("minutes2" + minutes2);
                var diffinminutes = minutes2 - minutes1;
                if (diffinminutes > 10) {
                    res.send({
                        status: 201,
                        message: 'your otp has been expired please request new one'
                    });
                } else {
                    verifyphone
                        .phoneverification(otp, phone, userinfo)
                        .then(result => {
                            var status = result.usr.status
                            if (result.status === 202) {
                                res
                                    .status(result.status)
                                    .json({
                                        message: result.message
                                    });
                            } else if (status.length == 2) {
                                res
                                    .status(result.status)
                                    .json({
                                        message: "registration successful",
                                        status: true
                                    })
                            } else {

                                if (result.status === 404) {
                                    res
                                        .status(result.status)
                                        .json({
                                            message: result.message
                                        });
                                } else {
                                    res
                                        .status(200)
                                        .json({
                                            message: "please verify emailid too",
                                            status: false
                                        });

                                }
                            }

                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));
                }
            })
            .catch(err => res.status(err.status).json({
                message: err.message
            }));
    });

    router.post("/setPassword", cors(), (req, res, next) => {
        var password = req.body.password;
        var email = req.body.email;

        setpassword
            .setpassword(email, password)
            .then(result => {
                res
                    .status(result.status)
                    .json({
                        message: result.message
                    });
            })
            .catch(err => res.status(err.status).json({
                message: err.message
            }));
    });

    router.get('/publicadjusterlist', cors(), (req, res) => {
        const userid = getUserId(req)
        console.log(userid);

        if (!userid || !userid.trim()) {
            // the if statement checks if any of the above paramenters are null or not..if
            // is the it sends an error report.
            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });

        } else {

            publicadjusterList
                .publicadjusterList(userid)
                .then(function(result) {
                    console.log(result)

                    res
                        .status(result.status)
                        .json({
                            status: result.status,
                            message: result.usr
                        })
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        }

    });

    router.post('/userfullname', cors(), (req, res) => {
        const userid = getUserId(req)
        console.log(userid);
        const rapidid = req.body.rapidID;
        console.log(rapidid);
        if (!rapidid || !rapidid.trim()) {
            // the if statement checks if any of the above paramenters are null or not..if
            // is the it sends an error report.
            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });

        } else {

            userfullname
                .userfullname(rapidid)
                .then(function(result) {
                    console.log(result)

                    res
                        .status(result.status)
                        .json({
                            status: result.status,
                            fullname: result.usr
                        })
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        }

    });

    router.post("/motorfetchPolicyQuotes", (req, res) => {
        var id = getUserId(req)

        console.log("id" + id);
        const _id = (req.body._id);
        console.log("_id" + _id);
        var status = req.body.status;
        console.log("status" + status);
        var name = req.body.name;
        console.log("name" + name);
        const phone = (req.body.phone);
        console.log("phone" + phone);
        var email = (req.body.email);
        console.log("email:" + email);
        var regAreaCode = (req.body.regAreaCode);
        console.log("regAreaCode:" + regAreaCode);
        var previousPolicyExpiry = req.body.previousPolicyExpiry;
        console.log("previousPolicyExpiry:" + previousPolicyExpiry);
        var registrationYear = req.body.registrationYear;
        console.log("registrationYear:" + registrationYear);
        var carModel = req.body.carModel;
        console.log("carModel:" + carModel);
        var fuelType = req.body.fuelType;
        console.log("fuelType:" + fuelType);
        var carVariant = req.body.carVariant;
        console.log("carVariant:" + carVariant);
        var existingInsurer = req.body.existingInsurer;
        console.log("existingInsurer:" + existingInsurer);

        if (!status || !name || !phone || !email || !regAreaCode || !previousPolicyExpiry || !registrationYear || !carModel || !fuelType || !carVariant || !existingInsurer || !status.trim() || !name.trim() || !phone.trim() || !email.trim() || !regAreaCode.trim() || !previousPolicyExpiry.trim() || !registrationYear.trim() || !carModel.trim() || !fuelType.trim() || !carVariant.trim() || !existingInsurer.trim()) {

            res
                .status(400)
                .json({
                    "status": false,
                    "message": 'Invalid Request !'
                });

        } else {

            var policyList;

            if (fuelType == "Petrol" && carVariant == "AC 4 SPEED(796CC)") {

                policyList = [{
                    "policyName": "21st Century Insurance",

                    "premiumAmount": "3500",
                    "sumInsured": "50000",
                    "premiumPayment": "12000"
                }, {
                    "policyName": "Alfa Corporation",

                    "premiumAmount": "4000",
                    "sumInsured": "125000",
                    "premiumPayment": "20000"

                }, {
                    "policyName": "Bajaj Allianz",

                    "premiumAmount": "3000",
                    "sumInsured": "100000",
                    "premiumPayment": "15000"
                }, {
                    "policyName": "American International Group",

                    "premiumAmount": "3750",
                    "sumInsured": "125000",
                    "premiumPayment": "20000"

                }, {
                    "policyName": "Cincinnati Financial",

                    "premiumAmount": "5000",
                    "sumInsured": "225000",
                    "premiumPayment": "55000"
                }, {
                    "policyName": "ICICI Lombard",

                    "premiumAmount": "1500",
                    "sumInsured": "50000",
                    "premiumPayment": "6000"
                }]

            } else if (fuelType == "CNG" && carVariant == "LPG AC") {

                policyList = [{
                    "policyName": "Darwin Professional Underwriters, Inc.",

                    "premiumAmount": "3000",
                    "sumInsured": "150000",
                    "premiumPayment": "60000"
                }, {
                    "policyName": "Eastern Insurance Holdings, Inc.",

                    "premiumAmount": "5000",
                    "sumInsured": "225000",
                    "premiumPayment": "55000"
                }, {
                    "policyName": "EMC Insurance Group, Inc.",

                    "premiumAmount": "5000",
                    "sumInsured": "725000",
                    "premiumPayment": "15000"
                }, {
                    "policyName": "Everest Re Group, Ltd.",

                    "premiumAmount": "5000",
                    "sumInsured": "125000",
                    "premiumPayment": "20000"
                }, {
                    "policyName": "First Mercury Financial Corporation",

                    "premiumAmount": "1000",
                    "sumInsured": "50000",
                    "premiumPayment": "12000"
                }, {
                    "policyName": "Berkshire Hathaway",

                    "premiumAmount": "3000",
                    "sumInsured": "125000",
                    "premiumPayment": "20000"
                }]

            }
            motorsavepolicy
                .motorsavepolicy(id, _id, status, name, phone, email, regAreaCode, previousPolicyExpiry, registrationYear, carModel, fuelType, carVariant, existingInsurer)
                .then((result) => {
                    console.log("_id" + result._id)
                    res
                        .status(200)
                        .json({
                            "status": true,
                            "message": result.message,
                            "policyList": policyList,
                            "_id": result._id
                        });

                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        }
    });

    router.get('/motorfetchSavePolicy', cors(), (req, res) => {
        const userid = getUserId(req)
        console.log(userid);

        if (!userid || !userid.trim()) {
            // the if statement checks if any of the above paramenters are null or not..if
            // is the it sends an error report.
            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });

        } else {

            motorfetchSavePolicy
                .motorfetchSavePolicy(userid)
                .then(function(result) {
                    console.log(result)
                    res
                        .status(result.status)
                        .json({
                            status: result.status,
                            policylist: result.policylist
                        })
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        }

    });

    router.post('/motorIssuePolicy', cors(), function(req, res) {
        var id = getUserId(req)
        var policydetailmessage;
        var transactiondeletemessage;

        const _id = (req.body.transactionString._id).toString()
        console.log("_id" + _id);
        const phonetosend = req.body.transactionString.policydetails.phone;
        console.log(phonetosend);
        const emailtosend = req.body.transactionString.policydetails.email;
        console.log(emailtosend);
        var messagetosend = 'Thank you for choosing HDFC Ergo to insure your Motor. Please wait for 4-5 working days to receive your copy of the Insurance Policy Document';
        var transaction = req.body.transactionString;
        console.log(transaction)
        var policy = transaction.policydetails;
        var vehicle = transaction.vehicledetails;

        var object;
        object = function(policy, vehicle) {
            var record = {};

            function set(k) {
                record[k] = this[k];
            }
            Object
                .keys(policy)
                .forEach(set, policy);
            Object
                .keys(vehicle)
                .forEach(set, vehicle);

            return record;
        }(policy, vehicle)

        var transactionString = JSON.stringify(object)
        console.log(transactionString)

        var policyNumber = "";
        var possible = "01234567891011121314151617181920213031404151523548854547585474654987878";
        for (var i = 0; i < 10; i++)
            policyNumber += possible.charAt(Math.floor(Math.random() * possible.length));

        var firstMethod = function() {
            var promise = new Promise(function(resolve, reject) {
                policydetails
                    .policydetails(policyNumber, id, policy, vehicle)
                    .then(result => {
                        policydetailmessage = result.message
                        console.log("policydetailmessage" + policydetailmessage);
                        resolve(policydetailmessage);

                    })
                    .catch(err => res.status(err.status).json({
                        message: err.message
                    }));
            });
            return promise;
        };

        var secondMethod = function() {
            var promise = new Promise(function(resolve, reject) {

                motordeletesavepolicy
                    .motordeletesavepolicy(_id)
                    .then(function(result) {
                        transactiondeletemessage = result.message
                        console.log("transactiondeletemessage" + transactiondeletemessage);
                        resolve(transactiondeletemessage);

                    })
                    .catch(err => res.status(err.status).json({
                        message: err.message
                    }));

            });
            return promise;
        };

        var thirdMethod = function() {

            savetransaction
                .savetransaction(policyNumber, transactionString, id)
                .then((result) => {
                    if (result !== null && result !== '') {
                        var mailOptions = {
                            transport: transporter,
                            from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                            to: emailtosend,
                            subject: 'Policy Issue Notification',

                            html: "Hello,<br> Thank you for choosing HDFC Ergo to insure your Motor. Please wait fo" +
                                "r 4-5 working days to receive your copy of the Insurance Policy Document<br>"
                        };
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {}
                        });
                        // nexmo     .message     .sendSms('919768135452', phonetosend, messagetosend, {
                        //         type: 'unicode'     }, (err, responseData) => {         if
                        // (responseData) {             console.log(responseData)         }     });

                        res
                            .status(200)
                            .json({
                                "message": "Policy issued succesfully !",
                                "status": "success"
                            });
                    }

                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        };
        firstMethod()
            .then(secondMethod)
            .then(thirdMethod);

    });

    router.get("/motorfetchissuedpolicy", (req, res) => {
        const userid = getUserId(req)
        console.log(userid);
        var issuedPolicies = [];

        if (!userid || !userid.trim()) {
            // the if statement checks if any of the above paramenters are null or not..if
            // is the it sends an error report.
            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });

        } else {

            fetchMotorIssuedPolicy
                .fetchMotorIssuedPolicy(userid)
                .then(function(result) {
                    console.log(result)
                    for (let i = 0; i < result.policylist.length; i++) {

                        issuedPolicies.push({
                            "policyName": result.policylist[i].policyObject.policyName,
                            "issuedDate": result.policylist[i].created_at,
                            "premiumAmount": parseInt(result.policylist[i].policyObject.premiumAmount),

                            "insuredAmount": parseInt(result.policylist[i].policyObject.sumInsured),
                            "policyHolderName": result.policylist[i].policyObject.name,
                            "policyNumber": result.policylist[i].policyNumber

                        });
                    }
                    return res.json({
                        "status": true,
                        "issuedPolicies": issuedPolicies
                    });
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        }

    });

    router.get("/readIndex", cors(), (req, res) => {

        if (checkToken(req)) {

            readIndex
                .readIndex({})
                .then(function(result) {
                    var firstrequest = result.query[0]
                    console.log("firstrequest--", firstrequest);
                    var length = result.query.length;
                    var lastrequest = result.query[length - 1];
                    console.log("lastrequest--", lastrequest);
                    if (requestList.length === 0) {
                        requestList.push(firstrequest.requestid);
                        requestList.push(lastrequest.requestid);

                    }

                    return res.json({
                        "status": 200,
                        "requestrange": requestList
                    });
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        } else {
            res
                .status(401)
                .json({
                    "status": false,
                    message: 'cant fetch data !'
                });
        }
    });

    router.get("/readAllrequest", cors(), (req, res) => {

        if (checkToken(req)) {

            var startKey = '0000000000';
            console.log("startKey", startKey);
            var endKey = '9999999999';
            console.log("endKey--", endKey);

            readAllRequest
                .readAllRequest(startKey, endKey)
                .then(function(result) {
                    console.log("  result.query---->", result.query);
                    return res.json({
                        "status": 200,
                        "readAllRequest": result.query
                    });
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        } else {
            res
                .status(401)
                .json({
                    "status": false,
                    message: 'cant fetch data !'
                });
        }
    });

    router.post("/readTransaction", (req, res) => {

        if (checkToken(req)) {

            const requestid = req.body.policyNumber;
            console.log("requestid1", requestid);

            readRequest
                .readRequest(requestid)
                .then(function(result) {

                    return res.json({
                        "status": 200,
                        "message": result.query
                    });
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        } else {
            res
                .status(401)
                .json({
                    "status": false,
                    message: 'cant fetch data !'
                });
        }
    });



    router.post('/notifyClaim', cors(), (req, res) => {
        const userid = getUserId(req)
        const NotificationClaim = req.body.transaction;
        const phonetosend = req.body.phone;
        console.log(phonetosend);
        const emailtosend = req.body.email;
        console.log(emailtosend);
        var messagetosend = 'Thank you for choosing HDFC Ergo to insure your Motor. Please wait for 4-5 working days to receive your copy of the Insurance Policy Document';

        const policyNumber = NotificationClaim.policyNumber;
        const claim_no1 = Math.floor(Math.random() * (1000 - 1)) + 1;
        const claim_no = claim_no1.toString();
        const claimNotifiedDate = new Date();
        const status = "Claim Notified";

        NotificationClaim.claimNotifiedDate = claimNotifiedDate;
        NotificationClaim.status = status;
        NotificationClaim.InsuredId = userid;
        console.log("NotificationClaim" + JSON.stringify(NotificationClaim));
        const transactionString = JSON.stringify((({
            claim_no,
            Title,
            status,
            claimNotifiedDate
        }) => ({
            claim_no,
            Title,
            status,
            claimNotifiedDate
        }))(NotificationClaim));
        console.log("transactionString" + transactionString);
        if (!userid || !userid.trim()) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });
        } else {

            var firstMethod = function() {
                var promise = new Promise(function(resolve, reject) {
                    notifyClaim
                        .notifyClaim(claim_no, policyNumber, userid, NotificationClaim)
                        .then(result => {
                            var message = result.message
                            console.log("message" + message);
                            resolve(message);

                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));
                });
                return promise;
            };

            var secondMethod = function() {

                updatetransaction
                    .updatetransaction(policyNumber, transactionString, userid)
                    .then((result) => {
                        if (result !== null && result !== '') {
                            var mailOptions = {
                                transport: transporter,
                                from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                                to: emailtosend,
                                subject: 'Policy Issue Notification',

                                html: "Hello,<br> Thank you for choosing HDFC Ergo to insure your Motor. Please wait fo" +
                                    "r 4-5 working days to receive your copy of the Insurance Policy Document<br>"
                            };
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {}
                            });
                            // nexmo     .message     .sendSms('919768135452', phonetosend, messagetosend, {
                            //         type: 'unicode'     }, (err, responseData) => {         if
                            // (responseData) {             console.log(responseData)         }     });

                            res
                                .status(200)
                                .json({
                                    "message": result.message,
                                    "status": "success"
                                });
                        }

                    })
                    .catch(err => res.status(err.status).json({
                        message: err.message
                    }));

            };
            firstMethod().then(secondMethod);
        }

    });

    router.get('/claim/Claimlist', (req, res) => {

        if (checkToken(req)) {

            fetchClaimlist
                .fetch_Claim_list({
                    "user": "risabh",
                    "getclaims": "getclaims"
                })
                .then(function(result) {
                    var daysDifference = [];
                    var claimDifference = [];
                    for (let i = 0; i < result.claimlist.claimlist.length; i++) {

                        if (result.claimlist.claimlist[i].claimsettleddate !== "0001-01-01T00:00:00Z") {

                            var date1 = new Date(result.claimlist.claimlist[i].claimnotifieddate);
                            console.log("date1" + date1);
                            var date2 = new Date(result.claimlist.claimlist[i].claimsettleddate);
                            console.log("date1" + date2);
                            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                            console.log("diffDays" + diffDays);
                            daysDifference.push(diffDays)
                            console.log("daysDifference" + daysDifference);
                            var total = 0;
                            for (let i = 0; i < daysDifference.length; i++) {
                                total += daysDifference[i];
                            }
                            var averagedays = total / daysDifference.length;
                            var longest = Math
                                .max
                                .apply(null, daysDifference)
                            var shortest = Math
                                .min
                                .apply(null, daysDifference)

                        }

                    }
                    res.json({
                        message: "user claims found",
                        allClaims: result,
                        Average: averagedays,
                        Longest: longest,
                        Shortest: shortest
                    });
                    //res.json(result)
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        } else {

            res
                .status(401)
                .json({
                    message: 'cant fetch data !'
                });
        }
    });
    router.post('/createClaim', cors(), (req, res) => {
        const userid = getUserId(req)
        const SubmissionClaim = req.body.transaction;
        const phonetosend = req.body.phone;
        console.log(phonetosend);
        const emailtosend = req.body.email;
        console.log(emailtosend);
        var messagetosend = 'Thank you for choosing HDFC Ergo to insure your Motor. Please wait for 4-5 worki' +
            'ng days to receive your copy of the Insurance Policy Document';

        const policyNumber = SubmissionClaim.policyNumber;
        const claim_no = SubmissionClaim.claim_no;
        const claimSubmittedDate = new Date();
        const status = "Claim Submitted";

        SubmissionClaim.claimSubmittedDate = claimSubmittedDate;
        SubmissionClaim.status = status;
        SubmissionClaim.InsuredId = userid;
        console.log("SubmissionClaim" + JSON.stringify(SubmissionClaim));
        const transactionString = JSON.stringify(SubmissionClaim);
        console.log("transactionString" + transactionString);
        if (!userid || !userid.trim()) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });
        } else {

            var firstMethod = function() {
                var promise = new Promise(function(resolve, reject) {
                    createClaim
                        .createClaim(claim_no, SubmissionClaim)
                        .then(result => {
                            var message = result.message
                            console.log("message" + message);
                            resolve(message);

                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));
                });
                return promise;
            };

            var secondMethod = function() {

                updatetransaction
                    .updatetransaction(policyNumber, transactionString, userid)
                    .then((result) => {
                        if (result !== null && result !== '') {
                            var mailOptions = {
                                transport: transporter,
                                from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                                to: emailtosend,
                                subject: 'Policy Issue Notification',

                                html: "Hello,<br> Thank you for choosing HDFC Ergo to insure your Motor. Please wait fo" +
                                    "r 4-5 working days to receive your copy of the Insurance Policy Document<br>"
                            };
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {}
                            });
                            // nexmo     .message     .sendSms('919768135452', phonetosend, messagetosend, {
                            //         type: 'unicode'     }, (err, responseData) => {         if
                            // (responseData) {             console.log(responseData)         }     });

                            res
                                .status(200)
                                .json({
                                    "message": result.message,
                                    "status": "success"
                                });
                        }

                    })
                    .catch(err => res.status(err.status).json({
                        message: err.message
                    }));

            };
            firstMethod().then(secondMethod);
        }

    });

    router.post('/rejectClaim', cors(), (req, res) => {
        const userid = getUserId(req)
        const RejectionClaim = req.body.transaction;
        const phonetosend = req.body.phone;
        console.log(phonetosend);
        const emailtosend = req.body.email;
        console.log(emailtosend);
        var messagetosend = 'Thank you for choosing HDFC Ergo to insure your Motor. Please wait for 4-5 worki' +
            'ng days to receive your copy of the Insurance Policy Document';

        const policyNumber = RejectionClaim.policyNumber;
        const claim_no = RejectionClaim.claim_no;
        const claimRejectedDate = new Date();
        const status = "Claim Rejected";

        RejectionClaim.claimRejectedDate = claimRejectedDate;
        RejectionClaim.status = status;
        RejectionClaim.ExaminerId = userid;
        console.log("RejectionClaim" + JSON.stringify(RejectionClaim));
        const transactionString = JSON.stringify(RejectionClaim);
        console.log("transactionString" + transactionString);
        if (!userid || !userid.trim()) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });
        } else {

            var firstMethod = function() {
                var promise = new Promise(function(resolve, reject) {
                    rejectClaim
                        .rejectClaim(claim_no, RejectionClaim)
                        .then(result => {
                            var message = result.message
                            console.log("message" + message);
                            resolve(message);

                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));
                });
                return promise;
            };

            var secondMethod = function() {

                updatetransaction
                    .updatetransaction(policyNumber, transactionString, userid)
                    .then((result) => {
                        if (result !== null && result !== '') {
                            var mailOptions = {
                                transport: transporter,
                                from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                                to: emailtosend,
                                subject: 'Policy Issue Notification',

                                html: "Hello,<br> Thank you for choosing HDFC Ergo to insure your Motor. Please wait fo" +
                                    "r 4-5 working days to receive your copy of the Insurance Policy Document<br>"
                            };
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {}
                            });
                            // nexmo     .message     .sendSms('919768135452', phonetosend, messagetosend, {
                            //         type: 'unicode'     }, (err, responseData) => {         if
                            // (responseData) {             console.log(responseData)         }     });

                            res
                                .status(200)
                                .json({
                                    "message": result.message,
                                    "status": "success"
                                });
                        }

                    })
                    .catch(err => res.status(err.status).json({
                        message: err.message
                    }));

            };
            firstMethod().then(secondMethod);
        }

     

    });

    router.post('/examineClaim', cors(), (req, res) => {
        const userid = getUserId(req)
        const ExamineClaim = req.body.transaction;
        const phonetosend = req.body.phone;
        console.log(phonetosend);
        const emailtosend = req.body.email;
        console.log(emailtosend);
        var messagetosend = 'Thank you for choosing HDFC Ergo to insure your Motor. Please wait for 4-5 worki' +
            'ng days to receive your copy of the Insurance Policy Document';

        const policyNumber = ExamineClaim.policyNumber;
        const claim_no = ExamineClaim.claim_no;
        const claimExaminedDate = new Date();
        const status = "Claim Examined";

        ExamineClaim.claimExaminedDate = claimExaminedDate;
        ExamineClaim.status = status;
        ExamineClaim.ExaminerId = userid;
        console.log("ExamineClaim" + JSON.stringify(ExamineClaim));
        const transactionString = JSON.stringify(ExamineClaim);
        console.log("transactionString" + transactionString);
        if (!userid || !userid.trim()) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });
        } else {

            var firstMethod = function() {
                var promise = new Promise(function(resolve, reject) {
                    examineClaim
                        .examineClaim(claim_no, ExamineClaim)
                        .then(result => {
                            var message = result.message
                            console.log("message" + message);
                            resolve(message);

                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));
                });
                return promise;
            };

            var secondMethod = function() {

                updatetransaction
                    .updatetransaction(policyNumber, transactionString, userid)
                    .then((result) => {
                        if (result !== null && result !== '') {
                            var mailOptions = {
                                transport: transporter,
                                from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                                to: emailtosend,
                                subject: 'Policy Issue Notification',

                                html: "Hello,<br> Thank you for choosing HDFC Ergo to insure your Motor. Please wait fo" +
                                    "r 4-5 working days to receive your copy of the Insurance Policy Document<br>"
                            };
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {}
                            });
                            // nexmo     .message     .sendSms('919768135452', phonetosend, messagetosend, {
                            //         type: 'unicode'     }, (err, responseData) => {         if
                            // (responseData) {             console.log(responseData)         }     });

                            res
                                .status(200)
                                .json({
                                    "message": result.message,
                                    "status": "success"
                                });
                        }

                    })
                    .catch(err => res.status(err.status).json({
                        message: err.message
                    }));

            };
            firstMethod().then(secondMethod);
        }

    });

    router.post('/negotiateClaim', cors(), (req, res) => {

        const userid = getUserId(req)
        const Negotiations = req.body.transaction;
        const phonetosend = req.body.phone;
        console.log(phonetosend);
        const emailtosend = req.body.email;
        console.log(emailtosend);
        var messagetosend = 'Thank you for choosing HDFC Ergo to insure your Motor. Please wait for 4-5 worki' +
            'ng days to receive your copy of the Insurance Policy Document';

        const policyNumber = Negotiations.policyNumber;
        const claim_no = Negotiations.claim_no;
        const claimNegotiatedDate = new Date();
        const status = "Claim Examined";

        Negotiations.claimNegotiatedDate = claimNegotiatedDate;
        Negotiations.status = status;
        Negotiations.userid = userid;
        console.log("NegotiateClaim" + JSON.stringify(Negotiations));
        const transactionString = JSON.stringify(Negotiations);
        console.log("transactionString" + transactionString);
        if (!userid || !userid.trim()) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });
        } else {

            var firstMethod = function() {
                var promise = new Promise(function(resolve, reject) {
                    negotiateClaim
                        .negotiateClaim(claim_no, Negotiations)
                        .then(result => {
                            var message = result.message
                            console.log("message" + message);
                            resolve(message);

                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));
                });
                return promise;
            };

            var secondMethod = function() {

                updatetransaction
                    .updatetransaction(policyNumber, transactionString, userid)
                    .then((result) => {
                        if (result !== null && result !== '') {
                            var mailOptions = {
                                transport: transporter,
                                from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                                to: emailtosend,
                                subject: 'Policy Issue Notification',

                                html: "Hello,<br> Thank you for choosing HDFC Ergo to insure your Motor. Please wait fo" +
                                    "r 4-5 working days to receive your copy of the Insurance Policy Document<br>"
                            };
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {}
                            });
                            // nexmo     .message     .sendSms('919768135452', phonetosend, messagetosend, {
                            //         type: 'unicode'     }, (err, responseData) => {         if
                            // (responseData) {             console.log(responseData)         }     });

                            res
                                .status(200)
                                .json({
                                    "message": result.message,
                                    "status": "success"
                                });
                        }

                    })
                    .catch(err => res.status(err.status).json({
                        message: err.message
                    }));

            };
            firstMethod().then(secondMethod);
        }
        

    });

    router.post('/approveClaim', cors(), (req, res) => {
        const userid = getUserId(req)
        const ApproveClaim = req.body.transaction;
        const phonetosend = req.body.phone;
        console.log(phonetosend);
        const emailtosend = req.body.email;
        console.log(emailtosend);
        var messagetosend = 'Thank you for choosing HDFC Ergo to insure your Motor. Please wait for 4-5 worki' +
            'ng days to receive your copy of the Insurance Policy Document';

        const policyNumber = ApproveClaim.policyNumber;
        const claim_no = ApproveClaim.claim_no;
        const claimApprovedDate = new Date();
        const status = "Approved";

        ApproveClaim.claimApprovedDate = claimApprovedDate;
        ApproveClaim.status = status;
        ApproveClaim.ClaimAdjusterId = userid;
        console.log("ApproveClaim" + JSON.stringify(ApproveClaim));
        var transactionString;

        if (!userid || !userid.trim()) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });
        } else {

            var firstMethod = function() {
                var promise = new Promise(function(resolve, reject) {
                    negotiateClaimFind
                        .negotiateClaimFind(claim_no)
                        .then(result => {
                            var negotiationAmount = result.negotiationAmount
                            ApproveClaim.ApprovedAmount = negotiationAmount;
                            transactionString = JSON.stringify(ApproveClaim);
                            resolve(negotiationAmount);

                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));
                });
                return promise;
            };

            var secondMethod = function() {
                var promise = new Promise(function(resolve, reject) {
                    approveClaim
                        .approveClaim(claim_no, ApproveClaim)
                        .then(result => {
                            var message = result.message
                            console.log("message" + message);
                            resolve(message);

                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));
                });
                return promise;
            };

            var thirdMethod = function() {

                updatetransaction
                    .updatetransaction(policyNumber, transactionString, userid)
                    .then((result) => {
                        if (result !== null && result !== '') {
                            var mailOptions = {
                                transport: transporter,
                                from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                                to: emailtosend,
                                subject: 'Policy Issue Notification',

                                html: "Hello,<br> Thank you for choosing HDFC Ergo to insure your Motor. Please wait fo" +
                                    "r 4-5 working days to receive your copy of the Insurance Policy Document<br>"
                            };
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {}
                            });
                            // nexmo     .message     .sendSms('919768135452', phonetosend, messagetosend, {
                            //         type: 'unicode'     }, (err, responseData) => {         if
                            // (responseData) {             console.log(responseData)         }     });

                            res
                                .status(200)
                                .json({
                                    "message": result.message,
                                    "status": "success"
                                });
                        }

                    })
                    .catch(err => res.status(err.status).json({
                        message: err.message
                    }));

            };
            firstMethod()
                .then(secondMethod)
                .then(thirdMethod);
        }

    
    });



    router.post('/settleClaim', cors(), (req, res) => {

        const userid = getUserId(req)
        const SettleClaim = req.body.transaction;
        const phonetosend = req.body.phone;
        console.log(phonetosend);
        const emailtosend = req.body.email;
        console.log(emailtosend);
        var messagetosend = 'Thank you for choosing HDFC Ergo to insure your Motor. Please wait for 4-5 working days to receive your copy of the Insurance Policy Document';

        const policyNumber = SettleClaim.policyNumber;
        const claim_no = SettleClaim.claim_no;
        const claimSettledDate = new Date();
        const status = "Settled";

        SettleClaim.claimSettledDate = claimSettledDate;
        SettleClaim.status = status;
        SettleClaim.ClaimAdjusterId = userid;
        console.log("SettleClaim" + JSON.stringify(SettleClaim));
        const transactionString = JSON.stringify(SettleClaim);
        console.log("transactionString" + transactionString);
        if (!userid || !userid.trim()) {

            res
                .status(400)
                .json({
                    message: 'Invalid Request !'
                });
        } else {

            var firstMethod = function() {
                var promise = new Promise(function(resolve, reject) {
                    settleClaim
                        .settleClaim(claim_no, SettleClaim)
                        .then(result => {
                            var message = result.message
                            console.log("message" + message);
                            resolve(message);

                        })
                        .catch(err => res.status(err.status).json({
                            message: err.message
                        }));
                });
                return promise;
            };

            var secondMethod = function() {

                updatetransaction
                    .updatetransaction(policyNumber, transactionString, userid)
                    .then((result) => {
                        if (result !== null && result !== '') {
                            var mailOptions = {
                                transport: transporter,
                                from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                                to: emailtosend,
                                subject: 'Policy Issue Notification',

                                html: "Hello,<br> Thank you for choosing HDFC Ergo to insure your Motor. Please wait fo" +
                                    "r 4-5 working days to receive your copy of the Insurance Policy Document<br>"
                            };
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {}
                            });
                            // nexmo     .message     .sendSms('919768135452', phonetosend, messagetosend, {
                            //         type: 'unicode'     }, (err, responseData) => {         if
                            // (responseData) {             console.log(responseData)         }     });

                            res
                                .status(200)
                                .json({
                                    "message": result.message,
                                    "status": "success"
                                });
                        }

                    })
                    .catch(err => res.status(err.status).json({
                        message: err.message
                    }));

            };
            firstMethod().then(secondMethod);
        }
    
    });

    router.get('/claim/UserClaims', function(req, res) {

        var filteredclaims = [];
        var status = [];
        var daysDifference = [];
        var averagedays,
            longest,
            shortest;
        const id = getUserId(req)
        console.log("id" + id);
        if (1 == 1) {

            fetchClaimlist
                .fetch_Claim_list({
                    " user ": " risabh ",
                    " getclaims ": " getclaims "
                })
                .then(function(result) {
                    console.log("result array data" + result.claimlist.claimlist);

                    var filteredclaims = [];
                    var status = [];
                    var daysDifference = [];
                    console.log("length of result array" + result.claimlist.claimlist.length);

                    for (let i = 0; i < result.claimlist.claimlist.length; i++) {
                        console.log("id" + id);
                        console.log("userid" + result.claimlist.claimlist[i].insuredid);
                        if (result.claimlist.claimlist[i].insuredid === id) {
                            console.log("userid" + result.claimlist.claimlist[i].insuredid);
                            filteredclaims.push(result.claimlist.claimlist[i]);
                            status.push(result.claimlist.claimlist[i].status);
                            var countstatus = count(status);
                            console.log("countstatus" + countstatus);
                            console.log("filteredclaims array " + filteredclaims);
                            if (result.claimlist.claimlist[i].claimsettleddate !== "0001-01-01T00:00:00Z") {

                                var date1 = new Date(result.claimlist.claimlist[i].claimnotifieddate);
                                console.log("date1" + date1);
                                var date2 = new Date(result.claimlist.claimlist[i].claimsettleddate);
                                console.log("date1" + date2);
                                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                                console.log("diffDays" + diffDays);
                                daysDifference.push(diffDays)
                                console.log("daysDifference" + daysDifference);
                                var total = 0;
                                for (let i = 0; i < daysDifference.length; i++) {
                                    total += daysDifference[i];
                                }
                                var averagedays = total / daysDifference.length;
                                var longest = Math
                                    .max
                                    .apply(null, daysDifference)
                                var shortest = Math
                                    .min
                                    .apply(null, daysDifference)

                            }

                        }
                    }
                    return res.json({
                        message: "user claims found",
                        userClaims: filteredclaims,
                        statuscount: countstatus,
                        Average: averagedays,
                        Longest: longest,
                        Shortest: shortest
                    });
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        } else {

            return res
                .status(401)
                .json({
                    message: 'cant fetch data !'
                });
        }
    });

    router.get('/claim/ExaminerClaims', (req, res) => {

        const id = getUserId(req)

        console.log("id" + id);
        if (1 == 1) {

            fetchClaimlist
                .fetch_Claim_list({
                    "user": "risabh",
                    "getclaims": "getclaims"
                })
                .then(function(result) {
                    console.log("result array data" + result.claimlist.claimlist);

                    var filteredclaims = [];

                    var status = [];
                    var daysDifference = [];
                    var countstatus
                    console.log("length of result array" + result.claimlist.claimlist.length);

                    for (let i = 0; i < result.claimlist.claimlist.length; i++) {
                        console.log("id" + id);
                        console.log("userid" + result.claimlist.claimlist[i].userid);
                        if (id === id) {

                            if (result.claimlist.claimlist[i].status == "Submitted") {
                                filteredclaims.push(result.claimlist.claimlist[i]);
                                status.push(result.claimlist.claimlist[i].status);
                                countstatus = count(status);

                                console.log("countstatus" + countstatus);
                                console.log("filteredclaims array " + filteredclaims);
                                for (let i = 0; i < filteredclaims.length; i++) {
                                    if (filteredclaims[i].claimsettleddate !== "0001-01-01T00:00:00Z") {

                                        var date1 = new Date(filteredclaims[i].claimnotifieddate);
                                        console.log("date1" + date1);
                                        var date2 = new Date(filteredclaims[i].claimsettleddate);
                                        console.log("date1" + date2);
                                        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                                        console.log("diffDays" + diffDays);
                                        daysDifference.push(diffDays)
                                        console.log("daysDifference" + daysDifference);
                                        var total = 0;
                                        for (let i = 0; i < daysDifference.length; i++) {
                                            total += daysDifference[i];
                                        }
                                        var averagedays = total / daysDifference.length;
                                        var longest = Math
                                            .max
                                            .apply(null, daysDifference)
                                        var shortest = Math
                                            .min
                                            .apply(null, daysDifference)

                                    }
                                }

                            }
                            if (result.claimlist.claimlist[i].status == "Notified") {
                                status.push(result.claimlist.claimlist[i].status);
                                countstatus = count(status);
                            }
                            if (result.claimlist.claimlist[i].examinerid === id) {
                                status.push(result.claimlist.claimlist[i].status);
                                countstatus = count(status);

                            }
                        }
                    }
                    return res.json({
                        message: "user claims found",
                        userClaims: filteredclaims,
                        statuscount: countstatus,
                        Average: averagedays,
                        Longest: longest,
                        Shortest: shortest

                    });
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        } else {

            return res
                .status(401)
                .json({
                    message: 'cant fetch data !'
                });
        }
    });

    router.get('/claim/ClaimAdjusterClaims', (req, res) => {

        const id = getUserId(req)

        console.log("id" + id);
        if (1 == 1) {

            fetchClaimlist
                .fetch_Claim_list({
                    "user": "risabh",
                    "getclaims": "getclaims"
                })
                .then(function(result) {
                    console.log("result array data" + result.claimlist.claimlist);

                    var filteredclaims = [];

                    var status = [];
                    var daysDifference = [];
                    var countstatus
                    console.log("length of result array" + result.claimlist.claimlist.length);

                    for (let i = 0; i < result.claimlist.claimlist.length; i++) {
                        console.log("id" + id);
                        console.log("userid" + result.claimlist.claimlist[i].userid);
                        if (id === id) {

                            if (result.claimlist.claimlist[i].status == "Examined" || result.claimlist.claimlist[i].status == "Validated" || result.claimlist.claimlist[i].status == "Approved" || result.claimlist.claimlist[i].status == "Settled") {
                                filteredclaims.push(result.claimlist.claimlist[i]);

                                if (result.claimlist.claimlist[i].status == "Examined") {
                                    status.push(result.claimlist.claimlist[i].status);
                                } else if (result.claimlist.claimlist[i].status == "Validated") {
                                    status.push(result.claimlist.claimlist[i].status);
                                } else if (result.claimlist.claimlist[i].status == "Approved") {
                                    status.push(result.claimlist.claimlist[i].status);
                                } else if (result.claimlist.claimlist[i].status == "Settled") {
                                    status.push(result.claimlist.claimlist[i].status);
                                }

                                countstatus = count(status);

                                console.log("countstatus" + countstatus);
                                console.log("filteredclaims array " + filteredclaims);
                                for (let i = 0; i < filteredclaims.length; i++) {
                                    if (filteredclaims[i].claimsettleddate !== "0001-01-01T00:00:00Z") {

                                        var date1 = new Date(filteredclaims[i].claimnotifieddate);
                                        console.log("date1" + date1);
                                        var date2 = new Date(filteredclaims[i].claimsettleddate);
                                        console.log("date1" + date2);
                                        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                                        console.log("diffDays" + diffDays);
                                        daysDifference.push(diffDays)
                                        console.log("daysDifference" + daysDifference);
                                        var total = 0;
                                        for (let i = 0; i < daysDifference.length; i++) {
                                            total += daysDifference[i];
                                        }
                                        var averagedays = total / daysDifference.length;
                                        var longest = Math
                                            .max
                                            .apply(null, daysDifference)
                                        var shortest = Math
                                            .min
                                            .apply(null, daysDifference)

                                    }
                                }

                            }

                            if (result.claimlist.claimlist[i].status == "Notified" || result.claimlist.claimlist[i].status == "Submitted") {
                                status.push(result.claimlist.claimlist[i].status);
                                countstatus = count(status);
                            }

                        }
                    }
                    return res.json({
                        message: "user claims found",
                        userClaims: filteredclaims,
                        statuscount: countstatus,
                        Average: averagedays,
                        Longest: longest,
                        Shortest: shortest

                    });
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        } else {

            return res
                .status(401)
                .json({
                    message: 'cant fetch data !'
                });
        }
    });

    router.get('/claim/PublicAdjusterClaims', (req, res) => {

        const id = getUserId(req)

        console.log("id" + id);
        if (1 == 1) {

            fetchClaimlist
                .fetch_Claim_list({
                    "user": "risabh",
                    "getclaims": "getclaims"
                })
                .then(function(result) {
                    console.log("result array data" + result.claimlist.claimlist);

                    var filteredclaims = [];

                    var status = [];
                    var status1 = [];
                    var daysDifference = [];
                    var countstatus
                    var countstatus1
                    console.log("length of result array" + result.claimlist.claimlist.length);

                    for (let i = 0; i < result.claimlist.claimlist.length; i++) {
                        console.log("id" + id);
                        console.log("userid" + result.claimlist.claimlist[i].userid);
                        if (result.claimlist.claimlist[i].publicadjusterid === id) {

                            if (result.claimlist.claimlist[i].status == "Validated" || result.claimlist.claimlist[i].status == "Approved" || result.claimlist.claimlist[i].status == "Settled") {
                                filteredclaims.push(result.claimlist.claimlist[i]);
                                if (result.claimlist.claimlist[i].status == "Validated") {
                                    status1.push(result.claimlist.claimlist[i].status);
                                    countstatus1 = count(status1);
                                } else if (result.claimlist.claimlist[i].status == "Approved") {
                                    status.push(result.claimlist.claimlist[i].status);
                                } else if (result.claimlist.claimlist[i].status == "Settled") {
                                    status.push(result.claimlist.claimlist[i].status);
                                }

                                countstatus = count(status);

                                console.log("filteredclaims array " + filteredclaims);
                                for (let i = 0; i < filteredclaims.length; i++) {
                                    if (filteredclaims[i].claimsettleddate !== "0001-01-01T00:00:00Z") {

                                        var date1 = new Date(filteredclaims[i].claimnotifieddate);
                                        console.log("date1" + date1);
                                        var date2 = new Date(filteredclaims[i].claimsettleddate);
                                        console.log("date1" + date2);
                                        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                                        console.log("diffDays" + diffDays);
                                        daysDifference.push(diffDays)
                                        console.log("daysDifference" + daysDifference);
                                        var total = 0;
                                        for (let i = 0; i < daysDifference.length; i++) {
                                            total += daysDifference[i];
                                        }
                                        var averagedays = total / daysDifference.length;
                                        var longest = Math
                                            .max
                                            .apply(null, daysDifference)
                                        var shortest = Math
                                            .min
                                            .apply(null, daysDifference)

                                    }
                                }

                            }

                            if (result.claimlist.claimlist[i].status == "Notified" || result.claimlist.claimlist[i].status == "Submitted" || result.claimlist.claimlist[i].status == "Examined") {
                                status.push(result.claimlist.claimlist[i].status);
                                countstatus = count(status);
                            }
                        }
                    }

                    return res.json({
                        message: "user claims found",
                        userClaims: filteredclaims,
                        statuscount: countstatus,
                        statuscount1: countstatus1,
                        Average: averagedays,
                        Longest: longest,
                        Shortest: shortest

                    });

                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        } else {

            return res
                .status(401)
                .json({
                    message: 'cant fetch data !'
                });
        }
    });

    cloudinary.config({
        cloud_name: 'diyzkcsmp',
        api_key: '188595956976777',
        api_secret: 'F7ajPhx0uHdohqfbjq2ykBZcMiw'
    });

    router.post('/UploadDocs', multipartMiddleware, function(req, res, next) {
        const id = getUserId(req)
        const claimno = parseInt(req.body.claimno, 10);
        // const claimno =215;
        console.log(claimno)
        var photo = new Photo(req.body);
        console.log("req.files.image" + JSON.stringify(req.files));
        var imageFile = req.files.file.path;

        cloudinary
            .uploader
            .upload(imageFile, {
                tags: 'express_sample'
            })
            .then(function(image) {
                console.log('** file uploaded to Cloudinary service');
                console.dir(image);
                photo.url = image.url;
                photo.userid = id;
                photo.claimno = claimno;
                // Save photo with image metadata
                return photo.save();
            })
            .then(function(photo) {

                res.send({
                    url: photo._doc.url,
                    claimno: photo._doc.claimno,
                    message: "files uploaded succesfully"
                });
            })
            .finally(function() {

                res.render('photos/create_through_server', {
                    photo: photo,
                    upload: photo.image
                });
            });
    });

    router.get('/images/id', cors(), (req, res) => {
        const id = getUser(req)
        console.log("id" + id);
        Photo
            .find({
                "userid": id
            })
            .then((images) => {
                var image = [];
                for (let i = 0; i < images.length; i++) {
                    image.push(images[i]._doc)

                }

                res.send({
                    images: image,
                    message: "image fetched succesfully"
                });
            })

    });

    function getUserId(req) {
        const token = req.headers['x-access-token'];
        if (token) {
            try {
                var decoded = jwt.verify(token, config.secret);
                return decoded.users[0].rapidID
            } catch (err) {
                return false;
            }
        } else {
            return failed;
        }
    }

    function getUser(req) {
        const token = req.query.token;
        if (token) {
            try {
                var decoded = jwt.verify(token, config.secret);
                return decoded.users[0].rapidID
            } catch (err) {
                return false;
            }
        } else {
            return failed;
        }
    }

    function checkToken(req) {

        const token = req.headers['x-access-token'];

        if (token) {

            try {

                var decoded = jwt.verify(token, config.secret);
                return true

            } catch (err) {

                return false;
            }

        } else {

            return failed;
        }
    }

    function filterstatus(status) {

        if (1 == 1) {

            fetchClaimlist
                .fetch_Claim_list({
                    "user": "risabh",
                    "getclaims": "getclaims"
                })
                .then(function(result) {

                    console.log("result" + result.claimlist.claimlist)
                    var statusfilter = [];

                    for (let i = 0; i < result.claimlist.claimlist.length; i++) {
                        console.log("status" + status);
                        console.log("statusledger" + result.claimlist.claimlist[i].status);
                        if (result.claimlist.claimlist[i].status === status) {

                            statusfilter.push(result.claimlist.claimlist[i].status);
                            console.log("statusfilter" + statusfilter);

                        }
                    }
                    return statusfilter;
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        } else {
            return res
                .status(401)
                .json({
                    message: 'cant fetch data !'
                });

        }
    }

    function count(arr) {
        var statusname = [],
            statuscount = [],
            prev;

        arr.sort();
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] !== prev) {
                statusname.push(arr[i]);
                statuscount.push(1);
            } else {
                statuscount[statuscount.length - 1]++;
            }
            prev = arr[i];
        }
        console.log("statusname" + statusname);
        var result = [];
        for (var status in statusname) {

            result.push({
                statusname: statusname[status],
                statuscount: statuscount[status]
            });
        }

        return result;
    }
}