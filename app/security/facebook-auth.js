'use strict'

module.exports = class FacebookAuth {
    constructor({ id = 0 } = {}) {
        this.id = id
        this.user_id = 0
        this.token = ''
        this.email = ''
        this.name = ''
    }
}
