'use strict'

const express = require('express')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')
const helmet = require('helmet')
const morgan = require('morgan')

const logging = require('./logging')
const security = require('./security')()
const config = require('../config/config.json')

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 4040

// config ===============================
require('../config/passport')(passport, logging);

app.use(helmet())
app.use(cookieParser())
app.use(morgan('common'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

app.use(session({
  secret: config.session_secret ,
  resave: true,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// routes ===============================
require('./routes.js')(app, passport, security, logging)

// launch ===============================
app.listen(port, (err) => {
  if(err) {
    logging.error("Encountered error on startup:", err)
  }

  logging.info("Server running on port", port);
})
