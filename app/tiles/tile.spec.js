'use strict'

const dirtyChai = require('dirty-chai')
const chai = require('chai')
chai.use(dirtyChai)
const expect = chai.expect
const proxyquire = require('proxyquire')

const Tile = proxyquire('./tile', {})

const mockDatabase = {
    query: undefined
}

describe('Tile', () => {
    describe('Structure', () => {
        it('should be a class', () => {
            expect(Tile).to.be.a('Function')
            expect(new Tile()).to.be.an.instanceof(Object)
        })

        it('has a constructor that can set all fields', () => {
            const id = 1
            const user_id = 2
            const name = 'fake tile'
            const design = '#000'
            const started = new Date()
            const created_at = new Date()
            const updated_at = new Date()
            const tile = new Tile({
                id: id,
                user_id: user_id,
                name: name,
                design: design,
                started: started,
                created_at: created_at,
                updated_at: updated_at
            })
            expect(tile.id).to.be.equal(id)
            expect(tile.user_id).to.be.equal(user_id)
            expect(tile.name).to.be.equal(name)
            expect(tile.design).to.be.equal(design)
            expect(tile.started).to.be.equal(started)
            expect(tile.created_at).to.be.equal(created_at)
            expect(tile.updated_at).to.equal(updated_at)
        })

        it('has a constructor that has default parameters', () => {
            const tile = new Tile()
            expect(tile).to.exist() // should reach this point without errors
        })
    })

    describe('Functions', () => {
        describe('findTileById', () => {
            it('fails if an error occurs', (done) => {
                mockDatabase.query = (query, args, callback) => {
                    callback(new Error(), undefined)
                }

                Tile.findTileById(mockDatabase, 1, 1)
                    .then(() => {
                        done(new Error('Error should have been thrown'))
                    })
                    .catch((err) => {
                        expect(err).to.exist()
                        done()
                    })
            })

            it('handles an undefined result', (done) => {
                mockDatabase.query = (query, args, callback) => {
                    callback(null, undefined)
                }

                Tile.findTileById(mockDatabase, 1, 1)
                    .then((result) => {
                        expect(result).to.be.undefined()
                        done()
                    })
                    .catch((e) => { done(e) })
            })

            it('binds result if defined', (done) => {
                const tile = { id: 1, user_id: 1, name: 'fake tile', design: '#000000' }
                mockDatabase.query = (query, args, callback) => {
                    callback(null, [tile])
                }

                Tile.findTileById(mockDatabase, 1, 1)
                    .then((result) => {
                        expect(result).to.be.instanceof(Tile)
                        expect(result).to.exist()
                        expect(result.id).to.equal(tile.id)
                        expect(result.user_id).to.equal(tile.user_id)
                        expect(result.name).to.equal(tile.name)
                        expect(result.design).to.equal(tile.design)
                        done()
                    })
                    .catch((e) => { done(e) })
            })
        })

        describe('findTilesByUser', () => {
            it('fails if an error occurs', (done) => {
                mockDatabase.query = (query, args, callback) => {
                    callback(new Error(), undefined)
                }

                Tile.findTilesByUser(mockDatabase, 1)
                    .then(() => {
                        done(new Error('Error should have been thrown'))
                    })
                    .catch((err) => {
                        expect(err).to.exist()
                        done()
                    })
            })

            it('returns an empty array if undefined is returned', (done) => {
                mockDatabase.query = (query, args, callback) => {
                    callback(null, undefined)
                }

                Tile.findTilesByUser(mockDatabase, 1)
                    .then((result) => {
                        expect(result).to.be.instanceof(Array)
                        expect(result.length).to.equal(0)
                        done()
                    })
                    .catch((e) => { done(e) })
            })

            it('binds all results', (done) => {
                const tile1 = { id: 1, user_id: 1, name: 'fake tile 1', design: '#000000' }
                const tile2 = { id: 2, user_id: 1, name: 'fake tile 2', design: '#AA0000' }
                const tile3 = { id: 3, user_id: 1, name: 'fake tile 3', design: '#00FF00' }
                const tiles = [tile1, tile2, tile3]
                mockDatabase.query = (query, args, callback) => {
                    callback(null, tiles)
                }

                Tile.findTilesByUser(mockDatabase, 1)
                    .then((results) => {
                        results.forEach((tile, i) => {
                            expect(tile).to.be.instanceof(Tile)
                            expect(tile).to.exist()
                            expect(tile.id).to.equal(tiles[i].id)
                            expect(tile.user_id).to.equal(tiles[i].user_id)
                            expect(tile.name).to.equal(tiles[i].name)
                            expect(tile.design).to.equal(tiles[i].design)
                        })
                        done()
                    })
                    .catch((e) => { done(e) })
            })
        })

        describe('deleteTile', () => {
            it('fails if there is an error', () => {
                mockDatabase.query = (query, args, callback) => {
                    callback(new Error(), undefined)
                }

                Tile.deleteTile(mockDatabase, 1, 1)
                    .then(() => { expect(true).to.be.false() })
                    .catch((err) => {
                        expect(err).to.exist()
                    })
            })

            it('returns true if result is non-zero', () => {
                mockDatabase.query = (query, args, callback) => {
                    callback(new Error(), 1)
                }

                Tile.deleteTile(mockDatabase, 1, 1)
                    .then((result) => {
                        expect(result).to.be.true()
                    })
                    .catch(() => {})
            })

            it('returns false if result is zero', (done) => {
                mockDatabase.query = (query, args, callback) => {
                    callback(null, 0)
                }

                Tile.deleteTile(mockDatabase, 1, 1)
                    .then((result) => {
                        expect(result).to.be.false()
                        done()
                    })
                    .catch((e) => { done(e) })
            })
        })

        describe('save', () => {
            it('inserts new record if ID is undefined', (done) => {
                const id = 1
                const tile = {}
                mockDatabase.query = (query, args, callback) => {
                    expect(query).to.include('INSERT')
                    expect(args[1]).to.equal(tile)
                    callback(null, { insertId: id })
                }

                Tile.save(mockDatabase, tile)
                    .then((result) => {
                        expect(result.id).to.exist()
                        expect(result.id).to.equal(1)
                        done()
                    })
                    .catch((e) => {
                        done(e)
                    })
            })

            it('handles errors during insert', (done) => {
                const tile = {}
                mockDatabase.query = (query, args, callback) => {
                    expect(query).to.include('INSERT')
                    callback(new Error(), undefined)
                }

                Tile.save(mockDatabase, tile)
                    .then((result) => {
                        done(new Error('Error should have been thrown'))
                    })
                    .catch((err) => {
                        expect(err).to.exist()
                        done()
                    })
            })

            it('updates existing record if ID is defined', (done) => {
                const tile = { id: 1 }
                mockDatabase.query = (query, args, callback) => {
                    expect(query).to.include('UPDATE')
                    expect(args[1]).to.exist()
                    callback(null, { affectedRows: 1 })
                }

                Tile.save(mockDatabase, tile)
                    .then((result) => {
                        expect(result).to.exist()
                        done()
                    })
                    .catch((e) => { done(e) })
            })

            it('handles errors during update', (done) => {
                const tile = { id: 1 }
                mockDatabase.query = (query, args, callback) => {
                    expect(query).to.include('UPDATE')
                    callback(new Error(), undefined)
                }

                Tile.save(mockDatabase, tile)
                    .then((result) => {
                        done(new Error('Error should have been thrown'))
                    })
                    .catch((err) => {
                        expect(err).to.exist()
                        done()
                    })
            })

            it('fails if given tile is undefined', (done) => {
                Tile.save(mockDatabase, undefined)
                    .then((result) => {
                        done(new Error('Error should have been thrown'))
                    })
                    .catch((err) => {
                        expect(err).to.exist()
                        done()
                    })
            })
        })
    })
})
