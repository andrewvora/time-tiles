'use strict'

const bcrypt = require('bcrypt-nodejs')

module.exports = class UserAuth {

  constructor({ facebook = null, local = null, google = null } = {}) {
    this.facebook = facebook
    this.local = local
    this.google = google
  }

  static generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
  }

  isValidPassword(password) {
    return bcrypt.compareSync(password, this.local.password);
  }
}
