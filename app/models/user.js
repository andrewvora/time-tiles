'use strict'

const USERS_TABLE = "users"

module.exports = class User {
   constructor() {
      this.id = 0
      this.username = ""
      this.email = ""
      this.created_at = null
   }

   static findByUsername(database, username, next) {
      database.query(`SELECT * FROM ?? WHERE username=? LIMIT 1`, [USERS_TABLE, username], (err, result) => {
         if(err) {
            console.log(err)
            next(err)
         } else {
            next(err, result[0])
         }
      })
   }

   static findById(database, id, next) {
      database.query(`SELECT * FROM ?? WHERE id=? LIMIT 1`, [USERS_TABLE, id], (err, result) => {
         if(err) {
            console.log(err)
            next(err)
         } else {
            next(err, result[0])
         }
      })
   }

   static findByEmail(database, email, next) {
      database.query(`SELECT * FROM ?? WHERE email=?`, [USERS_TABLE, email], (err, result) => {
         if(err) {
            console.log(err)
            next(err)
         } else {
            next(err, result[0])
         }
      })
   }

   static save(database, user, next) {
      database.query(`INSERT INTO ?? SET ?`, [USERS_TABLE, user], (err, results) => {
         if(err) {
            console.log(err)
            next(err)
         } else {
            user.id = results.insertId
            next(err, user)
         }
      })
   }
}
