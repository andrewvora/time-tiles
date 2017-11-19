'use strict'

const logging = require('../logging')
const database = require('../../config/database')

const UserAuth = require('../security/user-auth')
const LocalAuth = require('../security/local-auth')
const User = require('../users/user')

function handleRegistrationRoute(request, response) {
    response.setHeader('Content-Type', 'application/json')

    const username = request.body.username
    const email = request.body.email
    const password = request.body.password

    if (username && email && password) {
        register(username, email, password)
            .then((user) => {
                response.status(201).send()
            }).catch((e) => {
                const body = { message: e.toString() }
                response.status(400).send(body)
            })
    } else {
        const body = { message: 'Bad request. Check documentation for an example request.' }
        response.status(400).send(body)
    }
}

async function register(username, email, password) {
    const connection = database()
    let user
    try {
        user = await registerUser(connection, username, email, password)
        connection.end()
    } catch (error) {
        connection.end()
        logging.warn(error)
        throw new Error(error.message)
    }

    return user
}

async function registerUser(connection, username, email, password) {
    const userByEmail = await findUserByEmail(connection, email)
    if (userByEmail) {
        return Promise.reject(new Error('That email is already taken.'))
    }

    const userByUsername = await findUserByUsername(connection, username)
    if (userByUsername) {
        return Promise.reject(new Error('That username is already taken.'))
    }

    const user = new User({
        email: email,
        username: username,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    })

    const savedUser = await saveUser(connection, user)
    if (!savedUser || !savedUser.id) {
        return Promise.reject(new Error('Could not create account.'))
    }

    const localAuth = new LocalAuth({
        user_id: savedUser.id,
        password: UserAuth.generateHash(password)
    })

    const savedLocalAuth = await saveLocalAuth(connection, localAuth)
    if (!savedLocalAuth || !savedLocalAuth.id) {
        logging.warn('Problem saving account with email ' + email)
        return Promise.reject(new Error('Could not create account.'))
    }

    return savedUser
}

async function findUserByEmail(connection, email) {
    return User.findByEmail(connection, email)
}

async function findUserByUsername(connection, username) {
    return User.findByUsername(connection, username)
}

async function saveUser(connection, user) {
    return User.save(connection, user)
}

async function saveLocalAuth(connection, localAuth) {
    return LocalAuth.save(connection, localAuth)
}

module.exports = function() {
    return {
        register: register,
        handleRegistration: handleRegistrationRoute
    }
}
