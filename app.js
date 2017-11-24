/**
@author: risabh sharma
@version: 1.0
@date: 06/05/2017
@Description: Hyperledger Fabric Blockchain sample client
**/
//this is the start of the application 
//from here the blockchain enviornment setup would start and our node js port for webservice would also start running
'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const loggerpac = require('morgan');
const router = express.Router();
var cors = require('cors');

var logger;
var Promise = require('bluebird');
var log4js = require('log4js');
var config = require('config');

var blockchainNetwork = require('./src/blockchain/blockchain_network.js');
var datastore = require('./src/database/datastore.js');
var logHelper = require('./src/logging/logging.js');


var constants = require('./src/constants/constants.js');
var util = require('./src/utils/util.js');
var validate = require('./src/utils/validation_helper.js');
var CloudantKeyValueStore = require('./src/database/model/kv_store_model.js');
var bcSdk = require('./src/blockchain/blockchain_sdk.js');

var cloudantKvStore;

const port = process.env.PORT || 8082;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(loggerpac('dev'));
app.use(cors());
require('./routes')(router);
app.use('/', router);


console.log(`App Runs on ${port}`);


function runClient() {

    logHelper.initialize(config.processname, config.env, config.log4js);
    logger = logHelper.getLogger('app.js');

    var user = 'risabh.s';
    var affiliation = 'fundraiser';

    var args = process.argv.slice(2);
    if (args.length >= 1) {
        var input = JSON.parse(args);
        if (validate.isValidString(input['user'])) {
            user = input['user'];
        }
        if (validate.isValidString(input['affiliation'])) {
            affiliation = input['affiliation'];
        }
    }

    setup()
        .then(function(resp) {
            return bcSdk.recursiveRegister({
                username: user,
                affiliation: affiliation
            })
        })
        .then(function(resp) {
            return bcSdk.recursiveLogin({
                username: user,
                password: resp['body']['password']
            })
        })
        .then(function(resp) {
            console.log("server is running on" + port)
            app.listen(port);
            return ("hello")
        })


        .catch(function(err) {
            console.log("runClient", "Error Occurred", err);


        })
};


function setup() {
    return new Promise(function(resolve, reject) {
        try {
            logHelper.logMethodEntry(logger, "setup");

            //Fetch IBM Bluemix Cloudant and Blockchain service instance configuration
            var cloudantConfig = config.VCAP_SERVICES[constants.VCAP_SERVICES_CLOUDANT][0];
            var blockchainConfig = config.VCAP_SERVICES[constants.VCAP_SERVICES_BLOCKCHAIN][0];

            //Setup datastore
            var result = datastore.initSync(cloudantConfig);
            if (result.statusCode != constants.SUCCESS) {
                logHelper.logError(logger, 'Could not initialize datastore', result);
                return reject({
                    statusCode: 500,
                    body: ''
                });
            }

            //Setup Cloudant based KeyValueStore
            var cloudantSetupDone = false;
            getCloudantKeyValStore(datastore, config.databases[constants.APP_MASTER_DB])
                .then(function(resp) {
                    cloudantKvStore = resp.body;
                    cloudantSetupDone = true;
                    return blockchainNetwork.setupBlockchain({
                        blockchainConfig: blockchainConfig,
                        ccName: constants['BLOCKCHAIN_CHAINCODE_NAME'],
                        kvStore: cloudantKvStore
                    })
                })
                .then(function(resp) {
                    return resolve({
                        statusCode: 200,
                        body: ''
                    });
                })
                .catch(function(err) {
                    if (cloudantSetupDone != true) {
                        logHelper.logError(logger, 'Could not initialize CloudantKeyValueStore', err);
                    } else {
                        logHelper.logError(logger, 'Blockchain setup failed. exiting...', err);
                    }
                    return reject(err);
                });


        } catch (err) {
            logHelper.logError(logger, 'Could not complete setup', err);
            throw reject({
                statusCode: 500,
                body: err
            });
        }
    })

}

/**
Instantiates CloudantKeyValueStoreModel object with dbName and corresponding dbInstance
**/
function getCloudantKeyValStore(datastore, dbName) {
    return new Promise(function(resolve, reject) {
        logHelper.logEntryAndInput(logger, 'getCloudantKeyValStore', dbName);

        if (!validate.isValid(datastore)) {
            logHelper.logError(logger, 'getCloudantKeyValStore', 'datastore is invalid');
            return reject({
                statusCode: constants.INVALID_INPUT,
                body: null
            });
        }

        if (!validate.isValidString(dbName)) {
            logHelper.logError(logger, 'getCloudantKeyValStore', 'dbName is invalid');
            return reject({
                statusCode: constants.INVALID_INPUT,
                body: null
            });
        }

        datastore.getDbInstance(dbName)
            .then(function(resp) {
                var dbInstance = resp.body;
                var model = new CloudantKeyValueStore(dbName, dbInstance);
                return resolve({
                    statusCode: constants.SUCCESS,
                    body: model
                });
            })
            .catch(function(err) {
                logHelper.logError(logger, 'getCloudantKeyValStore', 'Could not initialize model for ' + dbName, err);
                return reject(err);

            });
    });
}

module.exports = {
    runClient: runClient
}


runClient();