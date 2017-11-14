'use strict'

const LOGIN_TABLE = 'login'

module.exports = class LocalAuth {
   constructor({ id = 0, user_id = 0, password = "" } = {}) {
      this.id = id
      this.user_id = user_id
      this.password = password
   }

   static findByUserId(database, userId) {
      return new Promise((resolve, reject) => {
         database.query(`SELECT * FROM ?? WHERE user_id=? LIMIT 1`, [LOGIN_TABLE, userId], (err, result) => {
            if(err) {
               reject(err)
            } else {
               const createdUserRecord = result[0] ? new LocalAuth(result[0]) : undefined
               resolve(createdUserRecord)
            }
         })
      })
   }

   static save(database, userAuth) {
      return new Promise((resolve, reject) => {
         database.query(`INSERT INTO ?? SET ?`, [LOGIN_TABLE, userAuth], (err, result) => {
            if(err) {
               reject(err)
            } else {
               userAuth.id = result.insertId
               resolve(userAuth)
            }
         })
      })
   }
}
