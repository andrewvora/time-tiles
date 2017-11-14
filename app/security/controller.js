'use strict'

const config = require('../../config/config.json')
const jwt = require('jsonwebtoken')
const database = require('../../config/database')

const User = require('../users/user')
const LocalAuth = require('../security/local-auth')
const UserAuth = require('../security/user-auth')

async function findUser(connection, username) {
    return User.findByEmail(connection, username)
}

async function findLocalAuth(connection, user) {
    return LocalAuth.findByUserId(connection, user.id)
}

async function validateLocalAuth(password, localAuth) {
    const userAuth = new UserAuth({ local: localAuth })
    return userAuth.isValidPassword(password)
}

async function getToken(username, password) {
    const connection = database()
    var result = null

    try {
        const user = await findUser(connection, username)
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

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.jwt_secret, (err, decoded) => {
            if (err) {
                reject(err)
            } else {
                resolve(decoded)
            }
        })
    })
}

async function checkToken(token) {
    if (!token) {
        return false
    }
    return verifyToken(token)
}

module.exports = function() {
    return {
        /**
       * {done} takes a boolean value - true if valid.
       */
        isValidToken: checkToken,

        /**
       * @return a generated JWT token with the user embedded
       */
        getToken: getToken
    }
}
