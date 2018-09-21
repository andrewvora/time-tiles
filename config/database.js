'use strict'

const mysql = require('mysql')
const connection = function() {
    console.log(process.env.TT_DB_HOST,
        process.env.TT_DB_USER,
        process.env.TT_DB_PASSWORD,
        process.env.TT_DB_NAME)
    return mysql.createConnection({
        host: process.env.TT_DB_HOST,
        user: process.env.TT_DB_USER,
        password: process.env.TT_DB_PASSWORD,
        database: process.env.TT_DB_NAME
    })
}

module.exports = connection
