'use strict';
/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */
/*
 * Chaincode Invoke
 */

var hfc = require('fabric-client');
var path = require('path');
var util = require('util');

var options = {
    wallet_path: path.join(__dirname, './creds'),
    user_id: 'PeerAdmin',
    channel_id: 'mychannel',
    chaincode_id: 'marine_Insurancev1',
    peer_url: 'grpc://localhost:7051',
    event_url: 'grpc://localhost:7053',
    orderer_url: 'grpc://localhost:7050'
};

var channel = {};
var client = null;
var targets = [];
var tx_id = null;

function consignmentdetail(params) {
    var ConsignmentDetails;
    console.log("calling SDK for policy");
    return Promise
        .resolve()
        .then(() => {

            console.log("Create a client and set the wallet location");
            client = new hfc();
            return hfc.newDefaultKeyValueStore({path: options.wallet_path});
        })
        .then((wallet) => {
            console.log("Set wallet path, and associate user ", options.user_id, " with application");
            client.setStateStore(wallet);
            return client.getUserContext(options.user_id, true);
        })
        .then((user) => {
            console.log("Check user is enrolled, and set a query URL in the network");
            if (user === undefined || user.isEnrolled() === false) {
                console.error("User not defined, or not enrolled - error");
            }
            channel = client.newChannel(options.channel_id);
            var peerObj = client.newPeer(options.peer_url);
            channel.addPeer(peerObj);
            channel.addOrderer(client.newOrderer(options.orderer_url));
            targets.push(peerObj);
            return;
        })
        .then(() => {
            ConsignmentDetails = params.ConsignmentDetails;
            console.log("Consignment Details: " + JSON.stringify(ConsignmentDetails));
            tx_id = client.newTransactionID();
            console.log("Assigning transaction_id: ", tx_id._transaction_id);
            // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black',
            // 'Tom'], changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'], send
            // proposal to endorser

            var request = {
                targets: targets,
                chaincodeId: options.chaincode_id,
                fcn: 'consignmentDetail',
                args: [
                    ConsignmentDetails.id,
                    ConsignmentDetails.consignmentWeight,
                    ConsignmentDetails.consignmentValue,
                    ConsignmentDetails.policyName,
                    ConsignmentDetails.sumInsured,
                    ConsignmentDetails.premiumAmount,
                    ConsignmentDetails.modeofTransport,
                    ConsignmentDetails.packingMode,
                    ConsignmentDetails.consignmentType,
                    ConsignmentDetails.contractType,
                    ConsignmentDetails.policyType,
                    ConsignmentDetails.email,
                    ConsignmentDetails.policyHolderName,
                    ConsignmentDetails.userType,
                    ConsignmentDetails.invoiceNo,
                    ConsignmentDetails.policyNumber,
                    ConsignmentDetails.policyIssueDate,
                    ConsignmentDetails.policyEndDate,
                    ConsignmentDetails.voyageStartDate,
                    ConsignmentDetails.voyageEndDate
                ],
                chainId: options.channel_id,
                txId: tx_id
            };
            return channel.sendTransactionProposal(request);
        })
        .then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            var header = results[2];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
                isProposalGood = true;
                console.log('transaction proposal was good');
            } else {
                console.error('transaction proposal was bad');
            }
            if (isProposalGood) {
                console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message -' +
                        ' "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal,
                    header: header
                };
                // set the transaction listener and set a timeout of 30sec if the transaction
                // did not get committed within the timeout period, fail the test
                var transactionID = tx_id.getTransactionID();
                var eventPromises = [];
                let eh = client.newEventHub();
                eh.setPeerAddr(options.event_url);
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            console.error('The transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            console.log('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
                var sendPromise = channel.sendTransaction(request);
                return Promise
                    .all([sendPromise].concat(eventPromises))
                    .then((results) => {
                        console.log(' event promise all complete and testing complete');
                        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                    })
                    .catch((err) => {
                        console.error('Failed to send transaction and get notifications within the timeout period.');
                        return 'Failed to send transaction and get notifications within the timeout period.';
                    });
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is no' +
                        't 200. exiting...');
                return 'Failed to send Proposal or receive valid response. Response null or status is no' +
                    't 200. exiting...';
            }
        }, (err) => {
            console.error('Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err;
        })
        .then((response) => {
            if (response.status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
                return tx_id.getTransactionID();
            } else {
                console.error('Failed to order the transaction. Error code: ' + response.status);
                return 'Failed to order the transaction. Error code: ' + response.status;
            }
        }, (err) => {
            console.error('Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err;
        });
}

function notify_Claim(params) {
    var ClaimDetails;
    console.log("calling SDK for notify claim");
    return Promise
        .resolve()
        .then(() => {

            console.log("Create a client and set the wallet location");
            client = new hfc();
            return hfc.newDefaultKeyValueStore({path: options.wallet_path});
        })
        .then((wallet) => {
            console.log("Set wallet path, and associate user ", options.user_id, " with application");
            client.setStateStore(wallet);
            return client.getUserContext(options.user_id, true);
        })
        .then((user) => {
            console.log("Check user is enrolled, and set a query URL in the network");
            if (user === undefined || user.isEnrolled() === false) {
                console.error("User not defined, or not enrolled - error");
            }
            channel = client.newChannel(options.channel_id);
            var peerObj = client.newPeer(options.peer_url);
            channel.addPeer(peerObj);
            channel.addOrderer(client.newOrderer(options.orderer_url));
            targets.push(peerObj);
            return;
        })
        .then(() => {
            ClaimDetails = params.ClaimDetails;
            tx_id = client.newTransactionID();
            console.log("Assigning transaction_id: ", tx_id._transaction_id);
            // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black',
            // 'Tom'], changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'], send
            // proposal to endorser

            var request = {
                targets: targets,
                chaincodeId: options.chaincode_id,
                fcn: 'notifyClaim',
                args: [
                    ClaimDetails.policyno, ClaimDetails.claim_no, ClaimDetails.claim_title, ClaimDetails.claim_damagedetails, ClaimDetails.userid
                ],
                chainId: options.channel_id,
                txId: tx_id
            };
            return channel.sendTransactionProposal(request);
        })
        .then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            var header = results[2];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
                isProposalGood = true;
                console.log('transaction proposal was good');
            } else {
                console.error('transaction proposal was bad');
            }
            if (isProposalGood) {
                console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message -' +
                        ' "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal,
                    header: header
                };
                // set the transaction listener and set a timeout of 30sec if the transaction
                // did not get committed within the timeout period, fail the test
                var transactionID = tx_id.getTransactionID();
                var eventPromises = [];
                let eh = client.newEventHub();
                eh.setPeerAddr(options.event_url);
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            console.error('The transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            console.log('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
                var sendPromise = channel.sendTransaction(request);
                return Promise
                    .all([sendPromise].concat(eventPromises))
                    .then((results) => {
                        console.log(' event promise all complete and testing complete');
                        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                    })
                    .catch((err) => {
                        console.error('Failed to send transaction and get notifications within the timeout period.');
                        return 'Failed to send transaction and get notifications within the timeout period.';
                    });
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is no' +
                        't 200. exiting...');
                return 'Failed to send Proposal or receive valid response. Response null or status is no' +
                    't 200. exiting...';
            }
        }, (err) => {
            console.error('Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err;
        })
        .then((response) => {
            if (response.status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
                return tx_id.getTransactionID();
            } else {
                console.error('Failed to order the transaction. Error code: ' + response.status);
                return 'Failed to order the transaction. Error code: ' + response.status;
            }
        }, (err) => {
            console.error('Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err;
        });
}

function createClaim(params) {
    var ClaimDetails;
    console.log("calling SDK for create claim");
    return Promise
        .resolve()
        .then(() => {

            console.log("Create a client and set the wallet location");
            client = new hfc();
            return hfc.newDefaultKeyValueStore({path: options.wallet_path});
        })
        .then((wallet) => {
            console.log("Set wallet path, and associate user ", options.user_id, " with application");
            client.setStateStore(wallet);
            return client.getUserContext(options.user_id, true);
        })
        .then((user) => {
            console.log("Check user is enrolled, and set a query URL in the network");
            if (user === undefined || user.isEnrolled() === false) {
                console.error("User not defined, or not enrolled - error");
            }
            channel = client.newChannel(options.channel_id);
            var peerObj = client.newPeer(options.peer_url);
            channel.addPeer(peerObj);
            channel.addOrderer(client.newOrderer(options.orderer_url));
            targets.push(peerObj);
            return;
        })
        .then(() => {
            ClaimDetails = params.ClaimDetails;
            tx_id = client.newTransactionID();
            console.log("Assigning transaction_id: ", tx_id._transaction_id);
            // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black',
            // 'Tom'], changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'], send
            // proposal to endorser

            var request = {
                targets: targets,
                chaincodeId: options.chaincode_id,
                fcn: 'createClaim',
                args: [
                    ClaimDetails.claim_no, ClaimDetails.totaldamagevalue, ClaimDetails.totalclaimvalue, ClaimDetails.publicadjusterid
                ],
                chainId: options.channel_id,
                txId: tx_id
            };
            return channel.sendTransactionProposal(request);
        })
        .then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            var header = results[2];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
                isProposalGood = true;
                console.log('transaction proposal was good');
            } else {
                console.error('transaction proposal was bad');
            }
            if (isProposalGood) {
                console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message -' +
                        ' "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal,
                    header: header
                };
                // set the transaction listener and set a timeout of 30sec if the transaction
                // did not get committed within the timeout period, fail the test
                var transactionID = tx_id.getTransactionID();
                var eventPromises = [];
                let eh = client.newEventHub();
                eh.setPeerAddr(options.event_url);
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            console.error('The transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            console.log('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
                var sendPromise = channel.sendTransaction(request);
                return Promise
                    .all([sendPromise].concat(eventPromises))
                    .then((results) => {
                        console.log(' event promise all complete and testing complete');
                        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                    })
                    .catch((err) => {
                        console.error('Failed to send transaction and get notifications within the timeout period.');
                        return 'Failed to send transaction and get notifications within the timeout period.';
                    });
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is no' +
                        't 200. exiting...');
                return 'Failed to send Proposal or receive valid response. Response null or status is no' +
                    't 200. exiting...';
            }
        }, (err) => {
            console.error('Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err;
        })
        .then((response) => {
            if (response.status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
                return tx_id.getTransactionID();
            } else {
                console.error('Failed to order the transaction. Error code: ' + response.status);
                return 'Failed to order the transaction. Error code: ' + response.status;
            }
        }, (err) => {
            console.error('Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err;
        });
}

function rejectClaim(params) {
    var ClaimDetails;
    console.log("calling SDK for reject claim");
    return Promise
        .resolve()
        .then(() => {

            console.log("Create a client and set the wallet location");
            client = new hfc();
            return hfc.newDefaultKeyValueStore({path: options.wallet_path});
        })
        .then((wallet) => {
            console.log("Set wallet path, and associate user ", options.user_id, " with application");
            client.setStateStore(wallet);
            return client.getUserContext(options.user_id, true);
        })
        .then((user) => {
            console.log("Check user is enrolled, and set a query URL in the network");
            if (user === undefined || user.isEnrolled() === false) {
                console.error("User not defined, or not enrolled - error");
            }
            channel = client.newChannel(options.channel_id);
            var peerObj = client.newPeer(options.peer_url);
            channel.addPeer(peerObj);
            channel.addOrderer(client.newOrderer(options.orderer_url));
            targets.push(peerObj);
            return;
        })
        .then(() => {
            ClaimDetails = params.ClaimDetails;
            tx_id = client.newTransactionID();
            console.log("Assigning transaction_id: ", tx_id._transaction_id);
            // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black',
            // 'Tom'], changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'], send
            // proposal to endorser

            var request = {
                targets: targets,
                chaincodeId: options.chaincode_id,
                fcn: 'rejectClaim',
                args: [ClaimDetails.claim_no],
                chainId: options.channel_id,
                txId: tx_id
            };
            return channel.sendTransactionProposal(request);
        })
        .then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            var header = results[2];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
                isProposalGood = true;
                console.log('transaction proposal was good');
            } else {
                console.error('transaction proposal was bad');
            }
            if (isProposalGood) {
                console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message -' +
                        ' "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal,
                    header: header
                };
                // set the transaction listener and set a timeout of 30sec if the transaction
                // did not get committed within the timeout period, fail the test
                var transactionID = tx_id.getTransactionID();
                var eventPromises = [];
                let eh = client.newEventHub();
                eh.setPeerAddr(options.event_url);
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            console.error('The transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            console.log('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
                var sendPromise = channel.sendTransaction(request);
                return Promise
                    .all([sendPromise].concat(eventPromises))
                    .then((results) => {
                        console.log(' event promise all complete and testing complete');
                        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                    })
                    .catch((err) => {
                        console.error('Failed to send transaction and get notifications within the timeout period.');
                        return 'Failed to send transaction and get notifications within the timeout period.';
                    });
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is no' +
                        't 200. exiting...');
                return 'Failed to send Proposal or receive valid response. Response null or status is no' +
                    't 200. exiting...';
            }
        }, (err) => {
            console.error('Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err;
        })
        .then((response) => {
            if (response.status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
                return tx_id.getTransactionID();
            } else {
                console.error('Failed to order the transaction. Error code: ' + response.status);
                return 'Failed to order the transaction. Error code: ' + response.status;
            }
        }, (err) => {
            console.error('Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err;
        });
}

function examineClaim(params) {
    var ClaimDetails;
    console.log("calling SDK for examine claim");
    return Promise
        .resolve()
        .then(() => {

            console.log("Create a client and set the wallet location");
            client = new hfc();
            return hfc.newDefaultKeyValueStore({path: options.wallet_path});
        })
        .then((wallet) => {
            console.log("Set wallet path, and associate user ", options.user_id, " with application");
            client.setStateStore(wallet);
            return client.getUserContext(options.user_id, true);
        })
        .then((user) => {
            console.log("Check user is enrolled, and set a query URL in the network");
            if (user === undefined || user.isEnrolled() === false) {
                console.error("User not defined, or not enrolled - error");
            }
            channel = client.newChannel(options.channel_id);
            var peerObj = client.newPeer(options.peer_url);
            channel.addPeer(peerObj);
            channel.addOrderer(client.newOrderer(options.orderer_url));
            targets.push(peerObj);
            return;
        })
        .then(() => {
            ClaimDetails = params.ClaimDetails;
            tx_id = client.newTransactionID();
            console.log("Assigning transaction_id: ", tx_id._transaction_id);
            // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black',
            // 'Tom'], changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'], send
            // proposal to endorser

            var request = {
                targets: targets,
                chaincodeId: options.chaincode_id,
                fcn: 'ExamineClaim',
                args: [
                    ClaimDetails.examinerid, ClaimDetails.claim_no, ClaimDetails.assesseddamagevalue, ClaimDetails.assessedclaimvalue
                ],
                chainId: options.channel_id,
                txId: tx_id
            };
            return channel.sendTransactionProposal(request);
        })
        .then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            var header = results[2];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
                isProposalGood = true;
                console.log('transaction proposal was good');
            } else {
                console.error('transaction proposal was bad');
            }
            if (isProposalGood) {
                console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message -' +
                        ' "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal,
                    header: header
                };
                // set the transaction listener and set a timeout of 30sec if the transaction
                // did not get committed within the timeout period, fail the test
                var transactionID = tx_id.getTransactionID();
                var eventPromises = [];
                let eh = client.newEventHub();
                eh.setPeerAddr(options.event_url);
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            console.error('The transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            console.log('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
                var sendPromise = channel.sendTransaction(request);
                return Promise
                    .all([sendPromise].concat(eventPromises))
                    .then((results) => {
                        console.log(' event promise all complete and testing complete');
                        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                    })
                    .catch((err) => {
                        console.error('Failed to send transaction and get notifications within the timeout period.');
                        return 'Failed to send transaction and get notifications within the timeout period.';
                    });
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is no' +
                        't 200. exiting...');
                return 'Failed to send Proposal or receive valid response. Response null or status is no' +
                    't 200. exiting...';
            }
        }, (err) => {
            console.error('Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err;
        })
        .then((response) => {
            if (response.status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
                return tx_id.getTransactionID();
            } else {
                console.error('Failed to order the transaction. Error code: ' + response.status);
                return 'Failed to order the transaction. Error code: ' + response.status;
            }
        }, (err) => {
            console.error('Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err;
        });
}

function negotiateClaim(params) {
    var ClaimDetails;
    console.log("calling SDK for negotiate claim");
    return Promise
        .resolve()
        .then(() => {

            console.log("Create a client and set the wallet location");
            client = new hfc();
            return hfc.newDefaultKeyValueStore({path: options.wallet_path});
        })
        .then((wallet) => {
            console.log("Set wallet path, and associate user ", options.user_id, " with application");
            client.setStateStore(wallet);
            return client.getUserContext(options.user_id, true);
        })
        .then((user) => {
            console.log("Check user is enrolled, and set a query URL in the network");
            if (user === undefined || user.isEnrolled() === false) {
                console.error("User not defined, or not enrolled - error");
            }
            channel = client.newChannel(options.channel_id);
            var peerObj = client.newPeer(options.peer_url);
            channel.addPeer(peerObj);
            channel.addOrderer(client.newOrderer(options.orderer_url));
            targets.push(peerObj);
            return;
        })
        .then(() => {
            ClaimDetails = params.ClaimDetails;
            tx_id = client.newTransactionID();
            console.log("Assigning transaction_id: ", tx_id._transaction_id);
            // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black',
            // 'Tom'], changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'], send
            // proposal to endorser

            var request = {
                targets: targets,
                chaincodeId: options.chaincode_id,
                fcn: 'ClaimNegotiation',
                args: [
                    ClaimDetails.id, ClaimDetails.claim_no, ClaimDetails.negotiationamount, ClaimDetails.asperterm2B
                ],
                chainId: options.channel_id,
                txId: tx_id
            };
            return channel.sendTransactionProposal(request);
        })
        .then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            var header = results[2];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
                isProposalGood = true;
                console.log('transaction proposal was good');
            } else {
                console.error('transaction proposal was bad');
            }
            if (isProposalGood) {
                console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message -' +
                        ' "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal,
                    header: header
                };
                // set the transaction listener and set a timeout of 30sec if the transaction
                // did not get committed within the timeout period, fail the test
                var transactionID = tx_id.getTransactionID();
                var eventPromises = [];
                let eh = client.newEventHub();
                eh.setPeerAddr(options.event_url);
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            console.error('The transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            console.log('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
                var sendPromise = channel.sendTransaction(request);
                return Promise
                    .all([sendPromise].concat(eventPromises))
                    .then((results) => {
                        console.log(' event promise all complete and testing complete');
                        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                    })
                    .catch((err) => {
                        console.error('Failed to send transaction and get notifications within the timeout period.');
                        return 'Failed to send transaction and get notifications within the timeout period.';
                    });
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is no' +
                        't 200. exiting...');
                return 'Failed to send Proposal or receive valid response. Response null or status is no' +
                    't 200. exiting...';
            }
        }, (err) => {
            console.error('Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err;
        })
        .then((response) => {
            if (response.status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
                return tx_id.getTransactionID();
            } else {
                console.error('Failed to order the transaction. Error code: ' + response.status);
                return 'Failed to order the transaction. Error code: ' + response.status;
            }
        }, (err) => {
            console.error('Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err;
        });
}

function approveClaim(params) {
    var ClaimDetails;
    console.log("calling SDK for approve claim");
    return Promise
        .resolve()
        .then(() => {

            console.log("Create a client and set the wallet location");
            client = new hfc();
            return hfc.newDefaultKeyValueStore({path: options.wallet_path});
        })
        .then((wallet) => {
            console.log("Set wallet path, and associate user ", options.user_id, " with application");
            client.setStateStore(wallet);
            return client.getUserContext(options.user_id, true);
        })
        .then((user) => {
            console.log("Check user is enrolled, and set a query URL in the network");
            if (user === undefined || user.isEnrolled() === false) {
                console.error("User not defined, or not enrolled - error");
            }
            channel = client.newChannel(options.channel_id);
            var peerObj = client.newPeer(options.peer_url);
            channel.addPeer(peerObj);
            channel.addOrderer(client.newOrderer(options.orderer_url));
            targets.push(peerObj);
            return;
        })
        .then(() => {
            ClaimDetails = params.ClaimDetails;
            tx_id = client.newTransactionID();
            console.log("Assigning transaction_id: ", tx_id._transaction_id);
            // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black',
            // 'Tom'], changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'], send
            // proposal to endorser

            var request = {
                targets: targets,
                chaincodeId: options.chaincode_id,
                fcn: 'approveClaim',
                args: [ClaimDetails.claim_no],
                chainId: options.channel_id,
                txId: tx_id
            };
            return channel.sendTransactionProposal(request);
        })
        .then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            var header = results[2];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
                isProposalGood = true;
                console.log('transaction proposal was good');
            } else {
                console.error('transaction proposal was bad');
            }
            if (isProposalGood) {
                console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message -' +
                        ' "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal,
                    header: header
                };
                // set the transaction listener and set a timeout of 30sec if the transaction
                // did not get committed within the timeout period, fail the test
                var transactionID = tx_id.getTransactionID();
                var eventPromises = [];
                let eh = client.newEventHub();
                eh.setPeerAddr(options.event_url);
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            console.error('The transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            console.log('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
                var sendPromise = channel.sendTransaction(request);
                return Promise
                    .all([sendPromise].concat(eventPromises))
                    .then((results) => {
                        console.log(' event promise all complete and testing complete');
                        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                    })
                    .catch((err) => {
                        console.error('Failed to send transaction and get notifications within the timeout period.');
                        return 'Failed to send transaction and get notifications within the timeout period.';
                    });
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is no' +
                        't 200. exiting...');
                return 'Failed to send Proposal or receive valid response. Response null or status is no' +
                    't 200. exiting...';
            }
        }, (err) => {
            console.error('Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err;
        })
        .then((response) => {
            if (response.status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
                return tx_id.getTransactionID();
            } else {
                console.error('Failed to order the transaction. Error code: ' + response.status);
                return 'Failed to order the transaction. Error code: ' + response.status;
            }
        }, (err) => {
            console.error('Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err;
        });
}

function settleClaim(params) {
    var ClaimDetails;
    console.log("calling SDK for settle claim");
    return Promise
        .resolve()
        .then(() => {

            console.log("Create a client and set the wallet location");
            client = new hfc();
            return hfc.newDefaultKeyValueStore({path: options.wallet_path});
        })
        .then((wallet) => {
            console.log("Set wallet path, and associate user ", options.user_id, " with application");
            client.setStateStore(wallet);
            return client.getUserContext(options.user_id, true);
        })
        .then((user) => {
            console.log("Check user is enrolled, and set a query URL in the network");
            if (user === undefined || user.isEnrolled() === false) {
                console.error("User not defined, or not enrolled - error");
            }
            channel = client.newChannel(options.channel_id);
            var peerObj = client.newPeer(options.peer_url);
            channel.addPeer(peerObj);
            channel.addOrderer(client.newOrderer(options.orderer_url));
            targets.push(peerObj);
            return;
        })
        .then(() => {
            ClaimDetails = params.ClaimDetails;
            tx_id = client.newTransactionID();
            console.log("Assigning transaction_id: ", tx_id._transaction_id);
            // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black',
            // 'Tom'], changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'], send
            // proposal to endorser

            var request = {
                targets: targets,
                chaincodeId: options.chaincode_id,
                fcn: 'settleClaim',
                args: [ClaimDetails.claim_no],
                chainId: options.channel_id,
                txId: tx_id
            };
            return channel.sendTransactionProposal(request);
        })
        .then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            var header = results[2];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
                isProposalGood = true;
                console.log('transaction proposal was good');
            } else {
                console.error('transaction proposal was bad');
            }
            if (isProposalGood) {
                console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message -' +
                        ' "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal,
                    header: header
                };
                // set the transaction listener and set a timeout of 30sec if the transaction
                // did not get committed within the timeout period, fail the test
                var transactionID = tx_id.getTransactionID();
                var eventPromises = [];
                let eh = client.newEventHub();
                eh.setPeerAddr(options.event_url);
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            console.error('The transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            console.log('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
                var sendPromise = channel.sendTransaction(request);
                return Promise
                    .all([sendPromise].concat(eventPromises))
                    .then((results) => {
                        console.log(' event promise all complete and testing complete');
                        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                    })
                    .catch((err) => {
                        console.error('Failed to send transaction and get notifications within the timeout period.');
                        return 'Failed to send transaction and get notifications within the timeout period.';
                    });
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is no' +
                        't 200. exiting...');
                return 'Failed to send Proposal or receive valid response. Response null or status is no' +
                    't 200. exiting...';
            }
        }, (err) => {
            console.error('Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send proposal due to error: ' + err.stack
                ? err.stack
                : err;
        })
        .then((response) => {
            if (response.status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
                return tx_id.getTransactionID();
            } else {
                console.error('Failed to order the transaction. Error code: ' + response.status);
                return 'Failed to order the transaction. Error code: ' + response.status;
            }
        }, (err) => {
            console.error('Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err);
            return 'Failed to send transaction due to error: ' + err.stack
                ? err.stack
                : err;
        });
}

module.exports = {
    consignmentdetail: consignmentdetail,
    notify_Claim: notify_Claim,
    createClaim: createClaim,
    rejectClaim: rejectClaim,
    examineClaim: examineClaim,
    negotiateClaim: negotiateClaim,
    approveClaim: approveClaim,
    settleClaim: settleClaim

};