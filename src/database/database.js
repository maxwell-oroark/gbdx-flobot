
'use strict'

const config = require('../config')
const pgp = require('pg-promise')();
const request = require('request');
const DATABASE_URL = config('DATABASE_URL')
const db = pgp(DATABASE_URL);
const jwt = require('jsonwebtoken');
const gbdx = require('./gbdx.js');

const getUserGbdxAuthInfo = function(slackName) {
    return db.oneOrNone("select * from user_token where slack_name=$1", [slackName])
        .then(function (data) {
            if (!data) return null;

            return {
                accessToken: data.gbdx_access_token,
                refreshToken: data.gbdx_refresh_token,
                apiKey: data.gbdx_api_key
            }
        })
}

const saveUserGbdxAuthInfo = function(slackName, newAuthInfo) {
    return getUserGbdxAuthInfo(slackName)
        .then((authInfo) => {
            if (authInfo) {
                return updateUserGbdxAuthInfo(slackName, newAuthInfo);
            } else {
                return insertUserGbdxAuthInfo(slackName, newAuthInfo);
            }
        })
}

const updateUserGbdxAuthInfo = function(slackName, newAuthInfo) {
    return db.any(
        `update user_token set gbdx_access_token=$1, gbdx_refresh_token=$2 where slack_name=$3`, [newAuthInfo.access_token, newAuthInfo.refresh_token, slackName]
    )
}

const insertUserGbdxAuthInfo = function(slackName, newAuthInfo) {
    return db.any(
        `insert into user_token (slack_name, gbdx_access_token, gbdx_refresh_token, gbdx_api_key) values ($1,$2,$3,$4)`, [slackName, newAuthInfo.access_token, newAuthInfo.refresh_token, newAuthInfo.apiKey]
    )
}


// const getGbdxAccessToken = function(slackName) {
//     return new Promise((resolve, reject) => {
//         resolve(config('GBDX_ACCESS_TOKEN'));
//     });
// }

const getGbdxAccessToken = function(slackName) {
    //first, see if there is a valid access_token already cached in the database
    return getUserGbdxAuthInfo(slackName)
        .then((authInfo) => {
            if (!authInfo) {
                return Promise.reject(new Error("Must login"))
            }

            let payload = jwt.decode(authInfo.accessToken);

            if (typeof payload.exp !== 'undefined') {
                if (typeof payload.exp !== 'number') {
                    return Promise.reject(new Error('invalid exp value'));
                }
                if (Math.floor(Date.now() / 1000) >= payload.exp + (0)) {
                    if (authInfo.refreshToken) {
                        return gbdx.refreshTokenLogin(authInfo.refreshToken)
                            .then((newAuthInfo) => {
                                return saveUserGbdxAuthInfo(slackName, newAuthInfo)
                                    .then(() => {
                                        return newAuthInfo.access_token;
                                    });
                            })
                            .catch((err) => {
                                return Promise.reject(new Error("Must login - refresh token failed"))
                            })
                    }
                    return Promise.reject(new TokenExpiredError('jwt expired', new Date(payload.exp * 1000)));
                } else {
                    return authInfo.accessToken;
                }
            }

        });
}

const getWorkflowForSlackUser = function(slackName, workflowId) {
    return getGbdxAccessToken(slackName)
        .then((access_token) => {
            if (!access_token) return Promise.reject(new Error('Could not login to GBDX'));

            return gbdx.getWorkflow(access_token, workflowId);
        })
}

const getWorkflowsForSlackUser = function(slackName) {
    return getGbdxAccessToken(slackName)
        .then((access_token) => {
            if (!access_token) return Promise.reject(new Error('Could not login to GBDX'));

            return gbdx.getWorkflows(access_token);
        })
}

const loginSlackUserToGbdx = function(slackName, gbdxUserName, gbdxPassword, gbdxApiKey) {
    return getUserGbdxAuthInfo(slackName)
        .then((existingAuthInfo) => {
            let apiKey = (existingAuthInfo && existingAuthInfo.apiKey) || gbdxApiKey;

            if (!apiKey) return Promise.reject(new Error('must provide api key'));

            return gbdx.passwordLogin(apiKey, gbdxUserName, gbdxPassword)
                .then((authInfo) => {
                    if (!authInfo) return Promise.reject(new Error('gdbx login failed'));

                    authInfo.apiKey = gbdxApiKey;
                    return saveUserGbdxAuthInfo(slackName, authInfo)
                        .then(() => authInfo)
                })
        })
}

module.exports = {
    getWorkflowForSlackUser,
    getWorkflowsForSlackUser,
    loginSlackUserToGbdx
}
