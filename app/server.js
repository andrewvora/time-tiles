'use strict'

const express = require('express')
const session = require('express-session')
const helmet = require('helmet')
const morgan = require('morgan')

const logging = require('./logging')
const security = require('./security')()
const registration = require('./registration')()

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 4040
const SESSION_SECRET = process.env.TT_SESSION_SECRET

// config ===============================
app.use(helmet())
app.use(cookieParser())
app.use(morgan('common'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

app.use(session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}))

// routes ===============================
require('./routes.js')(app, registration, security, logging)

// launch ===============================
app.listen(port, (err) => {
    if (err) {
        logging.error('Encountered error on startup:', err)
    }

    logging.info('Server running on port', port)
})

module.exports = app
