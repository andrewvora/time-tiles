'use strict'

const logging = require('../app/logging')
const LocalStrategy = require('passport-local')
const UserAuth = require('../app/security/user-auth')
const LocalAuth = require('../app/security/local-auth')
const User = require('../app/users/user')
const database = require('./database')

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

async function findLocalAuth(connection, user) {
    return LocalAuth.findByUserId(connection, user.id)
}

async function localSignup(connection, request, email, password) {
    const username = request.body.username
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
        logging.warn('Passport: problem saving account with email ' + email)
        return Promise.reject(new Error('Could not create account.'))
    }

    return savedUser
}

async function localLogin(connection, request, email, password, next) {
    const user = await findUserByEmail(connection, email)
    if (!user) {
        return Promise.reject(new Error())
    }

    const localAuth = await findLocalAuth(connection, user)
    if (!localAuth) {
        return Promise.reject(new Error())
    }

    const userAuth = new UserAuth()
    userAuth.local = localAuth

    if (userAuth.isValidPassword(password)) {
        return user
    } else {
        return Promise.reject(new Error())
    }
}

module.exports = function(passport, logging) {
    // session serialization logic ======================
    passport.serializeUser((user, next) => {
        next(null, user.id)
    })

    passport.deserializeUser((id, next) => {
        const connection = database()
        connection.connect()
        User.findById(connection, id).then((user) => {
            next(null, user)
        }).catch((err) => {
            next(err)
        })

        connection.end()
    })

    // passport local strategy =======================
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (request, email, password, done) => {
        process.nextTick(() => {
            const connection = database()

            localSignup(connection, request, email, password).then((user) => {
                done(null, user)
            }).catch((error) => {
                done(null, null, request.flash('signupMessage', error.message))
            }).then(() => {
                connection.end()
            })
        })
    })) // end passport-use

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (request, email, password, done) => {
        const connection = database()

        process.nextTick(() => {
            localLogin(connection, request, email, password).then((user) => {
                done(null, user)
            }).catch(() => {
                const message = 'Invalid email or password!'
                done(null, null, request.flash('loginMessage', message))
            }).then(() => {
                connection.end()
            })
        })
    }))
}
