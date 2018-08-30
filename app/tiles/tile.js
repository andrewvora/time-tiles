'use strict'

const TILES_TABLE = 'tiles'

module.exports = class Tile {
    constructor({
        id = 0,
        user_id = 0,
        name = '',
        design = '',
        started = undefined,
        created_at = undefined,
        updated_at = undefined
    } = {}) {
        this.id = id
        this.user_id = user_id
        this.name = name
        this.design = design
        this.started = started
        this.created_at = created_at
        this.updated_at = updated_at
    }

    static findTileById(database, tileId, userId) {
        return new Promise((resolve, reject) => {
            const queryArgs = [TILES_TABLE, tileId, userId]
            database.query(`SELECT * FROM ?? WHERE id=? AND user_id=?`, queryArgs, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    const tile = result ? new Tile(result[0]) : undefined
                    resolve(tile)
                }
            })
        })
    }

    static findTilesByUser(database, userId) {
        return new Promise((resolve, reject) => {
            database.query(`SELECT * FROM ?? where user_id=?`, [TILES_TABLE, userId], (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    const tiles = []
                    if (result) {
                        result.forEach((item) => {
                            const tile = new Tile(item)
                            tiles.push(tile)
                        })
                    }

                    resolve(tiles)
                }
            })
        })
    }

    static deleteTile(database, tileId, userId) {
        return new Promise((resolve, reject) => {
            const queryArgs = [TILES_TABLE, tileId, userId]
            database.query(`DELETE FROM ?? WHERE id=?`, queryArgs, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result > 0)
                }
            })
        })
    }

    static save(database, tile) {
        let saveNewRecord = function(resolve, reject) {
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
            tile.created_at = now
            tile.updated_at = now

            database.query(`INSERT INTO ?? SET ?`, [TILES_TABLE, tile], (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    tile.id = result.insertId
                    resolve(tile)
                }
            })
        }

        let updateRecord = function(resolve, reject) {
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
            const fieldsToUpdate = {
                name: tile.name,
                design: tile.design,
                started: tile.started,
                updated_at: now
            }

            const queryArgs = [TILES_TABLE, fieldsToUpdate, tile.id]
            database.query(`UPDATE ?? SET ? WHERE id=?`, queryArgs, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result && result.affectedRows === 1 ? tile : {})
                }
            })
        }

        return new Promise((resolve, reject) => {
            if (tile) {
                if (tile.id && tile.id !== 0) {
                    updateRecord(resolve, reject)
                } else {
                    saveNewRecord(resolve, reject)
                }
            } else {
                reject(new Error('tile is undefined'))
            }
        })
    }
}
