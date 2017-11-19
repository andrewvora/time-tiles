'use strict'

const tiles = require('./tiles')()

/**
 * @param app - the global instance of Express
 * @param registration - global registration instance for the app
 * @param security - the global security instance for the app
 * @param tiles - the global tiles instance for the app
 * @param logging - the global logging instance for the app
 */
module.exports = function(app, registration, security, logging) {
    // home ==============================
    app.get('/', (request, response) => {
        response.render('index.ejs')
    })

    // api ==============================a
    // auth
    app.post('/api/v1/register', registration.handleRegistration)
    app.post('/api/v1/authenticate', security.handleAuthentication)

    // tiles
    app.get('/api/v1/tiles', security.handleTokenValidation, tiles.handleGetTiles)
    app.get('/api/v1/tiles/:id', security.handleTokenValidation, tiles.handleGetTileById)
    app.post('/api/v1/tiles', security.handleTokenValidation, tiles.handlePostTile)
    app.put('/api/v1/tiles/:id', security.handleTokenValidation, tiles.handlePutTile)
    app.delete('/api/v1/tiles/:id', security.handleTokenValidation, tiles.handleDeleteTile)
}
