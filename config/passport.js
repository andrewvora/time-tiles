'use strict'

const logging = require('../app/logging')
const LocalStrategy = require('passport-local')
const UserAuth = require('../app/models/user-auth')
const LocalAuth = require('../app/models/local-auth')
const User = require('../app/models/user')
const database = require('./database')

const USERS_TABLE = "users"

module.exports = function(passport) {
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
      const connection = database()
      const next = (err, response, flash) => {
         connection.end()
         done(err, response, flash)
      }

      process.nextTick(() => {
         const username = request.body.username

         User.findByEmail(connection, email, (err, user) => {
            if(err) {
               return next(err)
            } else if(user) {
               return next(null, false, request.flash('signupMessage', 'That email is already taken'))
            } else {
               User.findByUsername(connection, username, (err, user) => {
                  if(err) {
                     return next(err)
                  } else if(user) {
                     return next(null, false, request.flash('signupMessage', 'That username is already taken'))
                  } else {
                     const user = new User()
                     user.email = email
                     user.username = username
                     user.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ')

                     // const connection = database()
                     User.save(connection, user, (err, user) => {
                        if(err) {
                            return next(err)
                        }

                        const localAuth = new LocalAuth()
                        localAuth.user_id = user.id
                        localAuth.password = UserAuth.generateHash(password)

                        // const connection = database()
                        LocalAuth.save(connection, localAuth, (err, result) => {
                           if(err) {
                              return next(err)
                           }

                           next(null, user)
                        })
                     })
                  }
               })
            }
         })
      })
   })) // end passport-use

   passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
   }, (request, email, password, done) => {
      const connection = database()
      const next = (err, response, flash) => {
         connection.end()
         done(err, response, flash)
      }

      process.nextTick(() => {
         User.findByEmail(connection, email, (err, user) => {
            if(err) {
               return next(err)
            }
            if(!user) {
               next(null, false, request.flash('loginMessage', "Hmm, we don't seem to recognize that email"))
            }

            LocalAuth.findByUserId(connection, user.id, (err, auth) => {
               if(err) {
                  return next(err)
               }

               if(!auth) {
                  const message = "Hmm, seems you don't have an account with us. Try Google or Facebook login."
                  next(null, false, request.flash('loginMessage', message))
               }

               const userAuth = new UserAuth()
               userAuth.local = auth
               if(userAuth.isValidPassword(password)) {
                  next(null, user)
               } else {
                  next(null, false, request.flash('loginMessage', "Incorrect email or password."))
               }
            })
         })
      })
   }))
}
