'use strict'

const LOGIN_TABLE = 'login'

module.exports = class LocalAuth {
   constructor() {
      this.id = 0
      this.user_id = 0
      this.password = ""
   }

   static findByUserId(database, userId, done) {
      database.query(`SELECT * FROM ?? WHERE user_id=? LIMIT 1`, [LOGIN_TABLE, userId], (err, results) => {
         if(err) {
            console.log(err)
            done(err)
         } else {
            done(err, results[0])
         }
      })
   }

   static save(database, userAuth, done) {
      database.query(`INSERT INTO ?? SET ?`, [LOGIN_TABLE, userAuth], (err, results) => {
         if(err) {
            console.log(err)
            done(err)
         } else {
            userAuth.id = results.insertId
            done(err, userAuth)
         }
      })
   }
}
