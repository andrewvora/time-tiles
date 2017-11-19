'use strict'

const Tile = require('./tile')
const database = require('../../config/database')

function handleGetTileByIdRoute(request, response) {
    const tileId = request.params.id

    getTileById(tileId)
        .then((tile) => {
            response.send(tile)
        })
        .catch((err) => {
            const msg = { message: err.message }
            response.status(404).send(msg)
        })
}

async function getTileById(id) {
    const connection = database()

    try {
        const tile = await Tile.findTileById(connection, id)
        return tile
    } catch (err) {
        return Promise.reject(err)
    } finally {
        connection.end()
    }
}

function handleGetTilesRoute(request, response) {
    const user = request.user

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
        return Tile.findTilesByUser(connection, userId)
    } catch (err) {
        return Promise.reject(err)
    } finally {
        connection.end()
    }
}

function handlePostTileRoute(request, response) {
    // TODO: use only certain input from request
    const tile = new Tile(request.body)
    const user = request.user

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
    const tileId = request.params.id
    const tile = new Tile(request.body)
    tile.id = tileId

    updateTile(tile)
        .then((updatedTile) => {
            response.send(updatedTile)
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

    deleteTile(tileId)
        .then((success) => {
            const body = { deleted: success }
            response.status(204).send(body)
        })
        .catch((err) => {
            const msg = { message: err.message }
            response.status(400).send(msg)
        })
}

async function deleteTile(id) {
    const connection = database()
    try {
        return Tile.deleteTile(connection, id)
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
