'use strict'

const TILES_TABLE = 'tiles'

module.exports = class Tile {
    constructor({
        id = 0,
        userId = 0,
        name = '',
        design = '',
        started = undefined,
        created_at = undefined,
        updated_at = undefined
    } = {}) {
        this.id = id
        this.user_id = userId
        this.name = name
        this.design = design
        this.started = started
        this.created_at = created_at
        this.updated_at = updated_at
    }

    static findTileById(database, tileId) {
        return new Promise((resolve, reject) => {
            database.query(``, [TILES_TABLE, tileId], (err, result) => {
                if (err) {

                }
            })
        })
    }

    static findTilesByUser(database, userId) {

    }
}
