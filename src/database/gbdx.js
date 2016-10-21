
'use strict'

const config = require('../config')
const request = require('request');

const passwordLogin = function(apiKey, userName, password) {
    return new Promise((resolve, reject) => {
        let options = {
            url: `https://geobigdata.io/auth/v1/oauth/token/`,
            headers: {
                'Authorization':`Basic ${apiKey}`,
            },
            method: 'POST',
            json: {
                "grant_type": "password",
                "username": userName,
                "password": password
            }
        }

        let callback = function (error, response, body) {
            if (error) reject(error);

            resolve({
                access_token: body.access_token,
                refresh_token: body.refresh_token
            });
        }

        request(options,callback)
    });
}

const refreshTokenLogin = function(apiKey, refreshToken) {
    return new Promise((resolve, reject) => {
        let options = {
            url: `https://geobigdata.io/auth/v1/oauth/token/`,
            headers: {
                'Authorization':`Basic ${apiKey}`,
            },
            method: 'POST',
            json: {
                "grant_type": "refresh_token",
                "refresh_token": refreshToken,
            }
        }

        let callback = function (error, response, body) {
            if (error) reject(error);

            resolve({
                access_token: body.access_token,
                refresh_token: body.refresh_token
            });
        }

        request(options,callback)
    });
}

const getWorkflow = function(access_token, id) {
    return new Promise((resolve, reject) => {
        let options = {
            url: `https://geobigdata.io/workflows/v1/workflows/${id}`,
            json: true,
            headers: {
                'Authorization':`Bearer ${access_token}`,
                'Content-Type': 'application/json',
            }
        }

        let callback = function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log(body);
                resolve(body);
                return;
            }

            reject(body);
            return;
        }

        request(options,callback)
    });
}

const getWorkflows = function(access_token) {
    return new Promise((resolve, reject) => {
        let options = {
            url: `https://geobigdata.io/workflows/v1/workflows`,
            json: true,
            headers: {
                'Authorization':`Bearer ${access_token}`,
                'Content-Type': 'application/json',
            }
        }

        let callback = function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log(body);
                resolve(body);
                return;
            }

            reject(body);
            return;
        }

        request(options,callback)
    });
}

module.exports = {
    getWorkflow,
    getWorkflows,
    passwordLogin,
    refreshTokenLogin
}
