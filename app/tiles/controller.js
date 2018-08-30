'use strict'

const Tile = require('./tile')
const database = require('../../config/database')

function handleGetTileByIdRoute(request, response) {
    const tileId = request.params.id
    const user = request.user

    if (!tileId) {
        response.status(400).send()
        return
    }
    if (!user) {
        response.status(403).send()
        return
    }

    getTileById(tileId, user.id)
        .then((tile) => {
            if (tile) {
                response.send(tile)
            } else {
                response.status(404).send()
            }
        })
        .catch((err) => {
            const msg = { message: err.message }
            response.status(500).send(msg)
        })
}

async function getTileById(id, userId) {
    const connection = database()

    try {
        const tile = await Tile.findTileById(connection, id, userId)
        return tile
    } catch (err) {
        return Promise.reject(err)
    } finally {
        connection.end()
    }
}

function handleGetTilesRoute(request, response) {
    const user = request.user

    if (!user) {
        response.status(403).send()
        return
    }

    getTilesForUser(user.id)
        .then((tiles) => {
            response.send(tiles)
        })
        .catch((err) => {
            const msg = { message: err.message }
            response.status(404).send(msg)
        })
}

async function getTilesForUser(userId) {
    const connection = database()

    try {
        return await Tile.findTilesByUser(connection, userId)
    } catch (err) {
        return Promise.reject(err)
    } finally {
        connection.end()
    }
}

function handlePostTileRoute(request, response) {
    const user = request.user

    if (!user) {
        response.status(403).send()
        return
    }

    const tile = new Tile(request.body)
    saveTile(user, tile)
        .then((savedTile) => {
            response.status(201).send(savedTile)
        })
        .catch((err) => {
            const msg = { message: err.message }
            response.status(400).send(msg)
        })
}

async function saveTile(user, tile) {
    const connection = database()
    try {
        tile.user_id = user.id
        const savedTile = await Tile.save(connection, tile)
        return savedTile
    } catch (err) {
        return Promise.reject(err)
    } finally {
        connection.end()
    }
}

function handlePutTileRoute(request, response) {
    const user = request.user
    if (!user) {
        response.status(403).send()
        return
    }

    const tileId = request.params.id
    if (!tileId) {
        response.status(400).send()
        return
    }

    const tile = {
        'id': tileId
    }

    if (request.body.name) {
        tile['name'] = request.body.name
    }
    if (request.body.design) {
        tile['design'] = request.body.design
    }
    if (request.body.started) {
        tile['started'] = request.body.started
    }

    updateTile(tile)
        .then((updatedTile) => {
            response.status(200).send(updatedTile)
        })
        .catch((err) => {
            const msg = { message: err.message }
            response.status(400).send(msg)
        })
}

async function updateTile(tile) {
    const connection = database()

    try {
        return Tile.save(connection, tile)
    } catch (err) {
        return Promise.reject(err)
    } finally {
        connection.end()
    }
}

function handleDeleteTileRoute(request, response) {
    const tileId = request.params.id
    const user = request.user

    if (!user) {
        response.status(403).send()
        return
    }

    if (!tileId) {
        response.status(400).send()
        return
    }

    deleteTile(tileId, user.id)
        .then((success) => {
            const body = { deleted: success }
            response.status(204).send(body)
        })
        .catch((err) => {
            const msg = { message: err.message }
            response.status(400).send(msg)
        })
}

async function deleteTile(id, userId) {
    const connection = database()
    try {
        return Tile.deleteTile(connection, id, userId)
    } catch (err) {
        return Promise.reject(err)
    } finally {
        connection.end()
    }
}

module.exports = function() {
    return {
        handleGetTileById: handleGetTileByIdRoute,
        handleGetTiles: handleGetTilesRoute,
        handlePostTile: handlePostTileRoute,
        handlePutTile: handlePutTileRoute,
        handleDeleteTile: handleDeleteTileRoute
    }
}
