'use strict'

const logging = require('../app/logging')
const LocalStrategy = require('passport-local')
const UserAuth = require('../app/models/user-auth')
const LocalAuth = require('../app/models/local-auth')
const User = require('../app/models/user')
const database = require('./database')

function findUserByEmail(connection, email) {
   return new Promise((resolve, reject) => {
      User.findByEmail(connection, email, (err, user) => {
         if (err) {
            reject(err)
         } else {
            resolve(user)
         }
      })
   })
}

function findUserByUsername(connection, username) {
   return new Promise((resolve, reject) => {
      User.findByUsername(connection, username, (err, user) => {
         if (err) {
            reject(err)
         } else {
            resolve(user)
         }
      })
   })
}

function saveUser(connection, user) {
   return new Promise((resolve, reject) => {
      User.save(connection, user, (err, user) => {
         if (err) {
            reject(err)
         } else {
            resolve(user)
         }
      })
   })
}

function saveLocalAuth(connection, localAuth) {
   return new Promise((resolve, reject) => {
      LocalAuth.save(connection, localAuth, (err, result) => {
         if (err) {
            reject(err)
         } else {
            resolve(result)
         }
      })
   })
}

function findLocalAuth(connection, user) {
   return new Promise((resolve, reject) => {
      LocalAuth.findByUserId(connection, user.id, (err, auth) => {
         if (err) {
            reject(err)
         } else {
            resolve(auth)
         }
      })
   })
}

async function localSignup(connection, request, email, password) {
   const username = request.body.username
   const userByEmail = await findUserByEmail(connection, email)
   if (userByEmail) {
      return Promise.reject('That email is already taken.')
   }

   const userByUsername = await findUserByUsername(connection, username)
   if (userByUsername) {
      return Promise.reject('That username is already taken.')
   }

   const user = new User()
   user.email = email
   user.username = username
   user.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ')

   const savedUser = await saveUser(connection, user)
   if (!savedUser || !savedUser.id) {
      return Promise.reject('Could not create account.')
   }

   const localAuth = new LocalAuth()
   localAuth.user_id = savedUser.id
   localAuth.password = UserAuth.generateHash(password)

   const savedLocalAuth = await saveLocalAuth(connection, localAuth)
   if (!savedLocalAuth || !savedLocalAuth.id) {
      return Promise.reject('Could not create account.')
   }

   return savedUser
}

async function localLogin(connection, request, email, password, next) {
   const user = await findUserByEmail(connection, email)
   if (!user) {
      return Promise.reject()
   }

   const localAuth = await findLocalAuth(connection, user)
   if (!localAuth) {
      return Promise.reject()
   }

   const userAuth = new UserAuth()
   userAuth.local = localAuth

   if(userAuth.isValidPassword(password)) {
      return user
   } else {
      return Promise.reject()
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
      User.findById(connection, id, (err, user) => {
         next(err, user)
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
         const callback = (err, response, flash) => {
            connection.end()
            done(err, response, flash)
         }

         localSignup(connection, request, email, password).then((user) => {
            console.log('user:', user)
            callback(null, user)
         }).catch((error) => {
            console.log('error:', error)
            callback(null, null, request.flash('signupMessage', error))
         })
      })
   })) // end passport-use

   passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
   }, (request, email, password, done) => {
      const connection = database()
      const callback = (err, response, flash) => {
         connection.end()
         done(err, response, flash)
      }

      process.nextTick(() => {
         localLogin(connection, request, email, password).then((user) => {
            callback(null, user)
         }).catch(() => {
            const message = "Invalid email or password!"
            callback(null, null, request.flash('loginMessage', message))
         })
      })
   }))
}
