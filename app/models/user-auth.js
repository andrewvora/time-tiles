'use strict'

const bcrypt = require('bcrypt-nodejs')

module.exports = class UserAuth {
  constructor() {
    this.facebook = null
    this.local = null
    this.google = null
  }

  static generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
  }

  isValidPassword(password) {
    return bcrypt.compareSync(password, this.local.password);
  }
}
