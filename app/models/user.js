'use strict'

const USERS_TABLE = "users"

module.exports = class User {
   constructor({ id = 0, username = "", email = ""} = {}) {
      this.id = id
      this.username = username
      this.email = email
      this.created_at = null
   }

   static findByUsername(database, username) {
      return new Promise((resolve, reject) => {
         database.query(`SELECT * FROM ?? WHERE username=? LIMIT 1`, [USERS_TABLE, username], (err, result) => {
            if(err) {
               reject(err)
            } else {
               const createdUser = result[0] ? new User(result[0]) : undefined
               resolve(createdUser)
            }
         })
      })
   }

   static findById(database, id) {
      return new Promise((resolve, reject) => {
         database.query(`SELECT * FROM ?? WHERE id=? LIMIT 1`, [USERS_TABLE, id], (err, result) => {
            if(err) {
               reject(err)
            } else {
               const createdUser = result[0] ? new User(result[0]) : undefined
               resolve(createdUser)
            }
         })
      })
   }

   static findByEmail(database, email) {
      return new Promise((resolve, reject) => {
         database.query(`SELECT * FROM ?? WHERE email=?`, [USERS_TABLE, email], (err, result) => {
            if(err) {
               reject(err)
            } else {
               const createdUser = result[0] ? new User(result[0]) : undefined
               resolve(createdUser)
            }
         })
      })
   }

   static save(database, user) {
      return new Promise((resolve, reject) => {
         user.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ')
         database.query(`INSERT INTO ?? SET ?`, [USERS_TABLE, user], (err, result) => {
            if(err) {
               reject(err)
            } else {
               user.id = result.insertId
               resolve(user)
            }
         })
      })
   }
}
