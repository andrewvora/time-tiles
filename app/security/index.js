'use strict'

const controller = require('./controller.js')

module.exports = function(config, logging) {
    return controller(config, logging)
}
