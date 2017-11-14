'use strict'

module.exports = class GoogleAuth {
    constructor({ id = 0 } = {}) {
        this.id = id
        this.user_id = 0
        this.token = ''
        this.email = ''
        this.name = ''
    }
}
