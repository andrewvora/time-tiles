'use strict'

/**
 * @param app - the global instance of Express
 * @param passport - the global instance of Passport
 * @param security - the global security instance for the app
 * @param logging - the global logging instance for the app
 */
module.exports = function(app, passport, security, logging) {
   // home ==============================
   app.get('/', (request, response) => {
      response.render('index.ejs', {
         'user': request.user
      })
   })

   // login ==============================
   app.get('/login', (request, response) => {
      if (request.isAuthenticated()) {
         response.redirect('/')
      } else {
         response.render('login.ejs', {
            message: request.flash('loginMessage')
         })
      }
   })

   app.get('/signup', (request, response) => {
      if (request.isAuthenticated()) {
         response.redirect('/')
      } else {
         response.render('signup.ejs', {
            message: request.flash('signupMessage')
         })
      }
   })

   app.post('/signup', passport.authenticate('local-signup', {
      successRedirect: '/',
      failureRedirect: '/signup',
      failureFlash: true
   }))

   app.post('/login', passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
   }))

   app.get('/logout', (request, response) => {
      request.logout()
      response.redirect('/')
   })

   function isLoggedIn(request, response, next) {
      if(request.isAuthenticated()) {
         return next();
      }

      response.redirect('/')
   }

   // api ==============================
   app.post('/api/v1/authenticate', (request, response) => {
      response.setHeader('Content-Type', 'application/json')

      security.getToken(request.body.username, request.body.password)
         .then((token) => {
            response.send({
               token: token
            })
         }).catch((e) => {
            const errorResponse = JSON.stringify({
               message: e.toString()
            })

            response.status(403).send(errorResponse)
         })
   })

   app.get('/api/v1/tiles', hasValidToken, (request, response) => {
      // TODO: actually send back user's tiles
      response.send(request)
   })

   app.get('/api/v1/tiles/:id', hasValidToken, (request, response) => {
      // TODO: actually send back user's tiles
      response.send(request)
   })

   function hasValidToken(request, response, next) {
      // TODO: do token authentication
      return next()
   }
}
