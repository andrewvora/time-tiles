'use strict'

const logging = require('../app/logging')
const LocalStrategy = require('passport-local')
const UserAuth = require('../app/models/user-auth')
const LocalAuth = require('../app/models/local-auth')
const User = require('../app/models/user')
const database = require('./database')

async function findUserByEmail(connection, email) {
   return await User.findByEmail(connection, email)
}

async function findUserByUsername(connection, username) {
   return await User.findByUsername(connection, username)
}

async function saveUser(connection, user) {
   return await User.save(connection, user)
}

async function saveLocalAuth(connection, localAuth) {
   return await LocalAuth.save(connection, localAuth)
}

async function findLocalAuth(connection, user) {
   return await LocalAuth.findByUserId(connection, user.id)
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

   const user = new User({
      email: email,
      username: username,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
   })

   const savedUser = await saveUser(connection, user)
   if (!savedUser || !savedUser.id) {
      return Promise.reject('Could not create account.')
   }

   const localAuth = new LocalAuth({
      user_id: savedUser.id,
      password: UserAuth.generateHash(password)
   })

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
            console.log('user:', user)
            done(null, user)
         }).catch((error) => {
            console.log('error:', error)
            done(null, null, request.flash('signupMessage', error))
         }).then(() => {
            console.log("ending connection")
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
            console.log("Logged in!")
         }).catch(() => {
            const message = "Invalid email or password!"
            done(null, null, request.flash('loginMessage', message))
         }).then(() => {
            connection.end()
         })
      })
   }))
}
