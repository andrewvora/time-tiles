'use strict'

const config = require('../../config/config.json')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt-nodejs')
const database = require('../../config/database')

const User = require('../models/user')
const LocalAuth = require('../models/local-auth')
const UserAuth = require('../models/user-auth')

function findUser(username) {
   return new Promise((resolve, reject) => {
      const connection = database()
      User.findByEmail(connection, username, (err, result) => {
         connection.end()

         if (err) {
            reject(err)
         } else {
            resolve(result)
         }
      })
   })
}

function findLocalAuth(user) {
   return new Promise((resolve, reject) => {
      const connection = database()
      LocalAuth.findByUserId(connection, user.id, (err, result) => {
         connection.end()

         if (err || !result) {
            reject(err)
         } else {
            resolve(result)
         }
      })
   })
}

function validateLocalAuth(password, localAuth) {
   return new Promise((resolve, reject) => {
      const userAuth = new UserAuth()
      userAuth.local = localAuth;

      if (userAuth.isValidPassword(password)) {
         resolve(true)
      } else {
         reject(false)
      }
   })
}

async function getToken(username, password) {
   const user = await findUser(username)
   const localAuth = await findLocalAuth(user)
   const valid = await validateLocalAuth(password, localAuth)

   const kosherUser = {
      id: user.id,
      username: user.username,
      email: user.email
   }

   if (valid) {
      return jwt.sign(kosherUser, config.jwt_secret, {
         expiresIn: '24h' // expires in 24 hours
      })
   } else {
      return null
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

   return await verifyToken(token)
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
