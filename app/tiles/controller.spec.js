'use strict'

// test modules
const dirtyChai = require('dirty-chai')
const chai = require('chai')
chai.use(dirtyChai)
const expect = chai.expect
const proxyquire = require('proxyquire')

// mocked dependencies
const mockTile = {}
const mockDatabase = function() {
    return {
        end: function() {}
    }
}

const Controller = proxyquire('./controller', {
    './tile': mockTile,
    '../../config/database': mockDatabase
})

// scenarios
describe('Tiles Controller', () => {
    describe('Structure', () => {
        it('returns a function that returns an object', () => {
            expect(Controller).to.be.instanceof(Function)
            expect(Controller()).to.be.instanceof(Object)
        })
    })

    describe('Functions', () => {
        const controller = Controller()
        const request = {
            params: {}
        }
        const response = {
            status: undefined,
            send: undefined
        }

        describe('handleGetTileById', () => {
            it('requires an ID', (done) => {
                request.params.id = undefined
                response.send = (body) => {
                    expect(body).to.be.undefined()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(400)
                    return {
                        send: response.send
                    }
                }
                controller.handleGetTileById(request, response)
            })

            it('requires a valid user', (done) => {
                request.params.id = 1
                request.user = undefined
                response.send = (body) => {
                    expect(body).to.be.undefined()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(403)
                    return {
                        send: response.send
                    }
                }
                controller.handleGetTileById(request, response)
            })

            it('sends a 500 in the event of an error during fetch', (done) => {
                mockTile.findTileById = () => {
                    return Promise.reject(new Error())
                }
                request.params.id = 1
                request.user = { id: 1 }
                response.send = (body) => {
                    expect(body).to.exist()
                    expect(body.message).to.exist()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(500)
                    return {
                        send: response.send
                    }
                }
                controller.handleGetTileById(request, response)
            })

            it('sends a 404 if a tile was not find', (done) => {
                mockTile.findTileById = () => {
                    return undefined
                }
                request.params.id = 1
                request.user = { id: 1 }
                response.send = (body) => {
                    expect(body).to.be.undefined()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(404)
                    return {
                        send: response.send
                    }
                }
                controller.handleGetTileById(request, response)
            })

            it('returns a tile if it exists', (done) => {
                const tile = { id: 2 }
                mockTile.findTileById = () => {
                    return tile
                }
                request.params.id = 1
                request.user = { id: 1 }
                response.send = (body) => {
                    expect(body).to.exist()
                    expect(body).to.equal(tile)
                    expect(body.id).to.equal(tile.id)
                    done()
                }
                controller.handleGetTileById(request, response)
            })
        })

        describe('handleGetTiles', () => {
            it('returns a 403 when no user is provided', (done) => {
                request.user = undefined
                response.send = (body) => {
                    expect(body).to.be.undefined()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(403)
                    return {
                        send: response.send
                    }
                }
                controller.handleGetTiles(request, response)
            })

            it('returns a 404 when an error occurs', (done) => {
                const errorMsg = 'error'
                request.user = { id: 1 }
                mockTile.findTilesByUser = (db, userId) => {
                    return Promise.reject(new Error(errorMsg))
                }
                response.send = (body) => {
                    expect(body.message).to.equal(errorMsg)
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(404)
                    return {
                        send: response.send
                    }
                }
                controller.handleGetTiles(request, response)
            })

            it('returns an array if successful', (done) => {
                request.user = { id: 1 }
                mockTile.findTilesByUser = (db, userId) => {
                    return []
                }
                response.send = (body) => {
                    expect(body).to.be.instanceof(Array)
                    done()
                }
                controller.handleGetTiles(request, response)
            })
        })

        describe('handlePostTile', () => {
            it('returns a 403 when no user is provided', (done) => {
                request.user = undefined
                request.body = undefined
                response.send = (body) => {
                    expect(body).to.be.undefined()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(403)
                    return {
                        send: response.send
                    }
                }
                controller.handlePostTile(request, response)
            })

            it('returns a 201 if tile is successfully created', (done) => {
                const body = {}
                request.user = { id: 1 }
                request.body = body
                response.send = (body) => {
                    expect(body).to.be.instanceof(FakeTile)
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(201)
                    return {
                        send: response.send
                    }
                }
                const FakeTile = class FakeTile {
                    constructor(param) {
                        this.param = {}
                    }
                    static save(db, tile) {
                        return tile
                    }
                }
                const inst = proxyquire('./controller', {
                    './tile': FakeTile,
                    '../../config/database': mockDatabase
                })()
                inst.handlePostTile(request, response)
            })

            it('returns a 400 if an error occurs', (done) => {
                const body = {}
                const msg = 'error'
                request.user = { id: 1 }
                request.body = body
                response.send = (body) => {
                    expect(body.message).to.equal(msg)
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(400)
                    return {
                        send: response.send
                    }
                }
                const FakeTile = class FakeTile {
                    constructor(param) {
                        this.param = {}
                    }
                    static save(db, tile) {
                        return Promise.reject(new Error(msg))
                    }
                }
                const inst = proxyquire('./controller', {
                    './tile': FakeTile,
                    '../../config/database': mockDatabase
                })()
                inst.handlePostTile(request, response)
            })
        })

        describe('handlePutTile', () => {
            it('returns a 403 when no user is provided', (done) => {
                request.user = undefined
                response.send = (body) => {
                    expect(body).to.be.undefined()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(403)
                    return {
                        send: response.send
                    }
                }
                controller.handlePutTile(request, response)
            })

            it('returns a 400 when no id is provided', (done) => {
                request.user = { id: 1 }
                request.params = {}
                response.send = (body) => {
                    expect(body).to.be.undefined()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(400)
                    return {
                        send: response.send
                    }
                }
                controller.handlePutTile(request, response)
            })

            it('only updates the name, design, and start date', (done) => {
                request.user = { id: 1 }
                request.params = { id: 2 }
                request.body = {
                    name: 'coolio',
                    design: '#000',
                    started: new Date(),
                    updated_at: new Date()
                }
                mockTile.save = (db, tile) => {
                    return tile
                }
                response.status = (status) => {
                    expect(status).to.equal(200)
                    return {
                        send: response.send
                    }
                }
                response.send = (body) => {
                    expect(body.name).to.equal(request.body.name)
                    expect(body.design).to.equal(request.body.design)
                    expect(body.started).to.equal(request.body.started)
                    expect(body.updated_at).to.be.undefined()
                    done()
                }
                controller.handlePutTile(request, response)
            })

            it('does not update any if they are undefined', (done) => {
                request.user = { id: 1 }
                request.params = { id: 2 }
                request.body = {
                    name: undefined,
                    design: undefined,
                    started: undefined
                }
                mockTile.save = (db, tile) => {
                    return tile
                }
                response.send = (body) => {
                    expect(body.name).to.equal(request.body.name)
                    expect(body.design).to.equal(request.body.design)
                    expect(body.started).to.equal(request.body.started)
                    expect(body.updated_at).to.be.undefined()
                    done()
                }
                controller.handlePutTile(request, response)
            })
        })

        describe('handleDeleteTile', () => {
            it('returns a 403 when no user is provided', (done) => {
                request.user = undefined
                response.send = (body) => {
                    expect(body).to.be.undefined()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(403)
                    return {
                        send: response.send
                    }
                }
                controller.handleDeleteTile(request, response)
            })

            it('returns a 400 when no id is provided', (done) => {
                request.user = { id: 1 }
                request.params = {}
                response.send = (body) => {
                    expect(body).to.be.undefined()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(400)
                    return {
                        send: response.send
                    }
                }
                controller.handleDeleteTile(request, response)
            })

            it('returns a 400 if an exception occurs', (done) => {
                const msg = 'error'
                request.user = { id: 1 }
                request.params = { id: 2 }
                response.send = (body) => {
                    expect(body.message).to.equal(msg)
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(400)
                    return {
                        send: response.send
                    }
                }
                mockTile.deleteTile = () => {
                    return Promise.reject(new Error(msg))
                }
                controller.handleDeleteTile(request, response)
            })

            it('returns a 204 if successful', (done) => {
                request.user = { id: 1 }
                request.params = { id: 2 }
                response.send = (body) => {
                    expect(body.deleted).to.be.true()
                    done()
                }
                response.status = (status) => {
                    expect(status).to.equal(204)
                    return {
                        send: response.send
                    }
                }
                mockTile.deleteTile = () => {
                    return true
                }
                controller.handleDeleteTile(request, response)
            })
        })
    })
})
