/**
 * @param app - the global instance of Express
 * @param passport - the global instance of Passport
 */
module.exports = function(app, passport) {
   // home ==============================
   app.get('/', (request, response) => {
      response.render('index.ejs', {
         'user': request.user
      })
   })

   // login ==============================
   app.get('/login', (request, response) => {
      response.render('login.ejs', {
         message: request.flash('loginMessage')
      })
   })

   app.get('/signup', (request, response) => {
      response.render('signup.ejs', {
         message: request.flash('signupMessage')
      })
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
   app.get('/v1/tiles', isAuthorized, (request, response) => {
      response.send(request)
   })

   app.get('/v1/tiles/:id', isAuthorized, (request, response) => {
      response.send(request)
   })

   function isAuthorized(request, response, next) {
      return next()
   }
}
