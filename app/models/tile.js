'use strict'

const TILES_TABLE = "tiles"

module.exports = class Tile {
   constructor() {
      this.id = 0;
      this.user_id = 0;
      this.name = "";
      this.design = "";
      this.started = "";
      this.created_at = "";
      this.updated_at = "";
   }

   static findTileById(database, tileId) {
      return new Promise((resolve, reject) => {
         database.query(``, [TILES_TABLE, tileId], (err, result) => {
            if (err) {
               return
            }
         })
      })
   }

   static findTilesByUser(database, userId) {

   }
}
