'use strict'

const config = require('../../config/config.json')
const jwt = require('jsonwebtoken')
const database = require('../../config/database')

const User = require('../users/user')
const LocalAuth = require('../security/local-auth')
const UserAuth = require('../security/user-auth')

function handleTokenValidation(request, response, next) {
    const token = request.headers.authorization
    verifyToken(token)
        .then((result) => {
            request.user = result
            next()
        }).catch((err) => {
            const msg = { message: err.message }
            response.status(401).send(msg)
        })
}

function handleAuthRoute(request, response) {
    response.setHeader('Content-Type', 'application/json')
    getToken(request.body.username, request.body.password)
        .then((token) => {
            response.send({
                token: token
            })
        }).catch((e) => {
            const errorResponse = { message: e.toString() }
            response.status(403).send(errorResponse)
        })
}

async function getToken(email, password) {
    const connection = database()
    var result = null

    try {
        const user = await findUser(connection, email)
        const localAuth = await findLocalAuth(connection, user)
        const valid = await validateLocalAuth(password, localAuth)

        if (valid) {
            const kosherUser = {
                id: user.id,
                username: user.username,
                email: user.email
            }

            result = jwt.sign(kosherUser, config.jwt_secret, {
                expiresIn: '24h' // expires in 24 hours
            })
        }

        return result
    } catch (error) {
        return Promise.reject(error)
    } finally {
        connection.end()
    }
}

async function findUser(connection, email) {
    return User.findByEmail(connection, email)
}

async function findLocalAuth(connection, user) {
    return LocalAuth.findByUserId(connection, user.id)
}

async function validateLocalAuth(password, localAuth) {
    const userAuth = new UserAuth({ local: localAuth })
    return userAuth.isValidPassword(password)
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        if (!token) {
            reject(new Error('Empty token.'))
        } else {
            jwt.verify(token, config.jwt_secret, (err, decoded) => {
                if (err || !decoded) {
                    reject(err)
                } else {
                    resolve(decoded)
                }
            })
        }
    })
}

module.exports = function() {
    return {
        /**
         * @param token - a JWT token
         * @return a Promise that returns whether the token is valid
         */
        isValidToken: verifyToken,

        /**
         * @param username - the email associated with the account
         * @param password - the password associated with the account
         * @return a Promise that generates a JWT token with the user encoded
         */
        getToken: getToken,

        /**
         * Handles authentication route
         */
        handleAuthentication: handleAuthRoute,

        /**
         * Handles token intercepts
         */
        handleTokenValidation: handleTokenValidation
    }
}
