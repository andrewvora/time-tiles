'use strict'

// test modules
const dirtyChai = require('dirty-chai')
const chai = require('chai')
chai.use(dirtyChai)
const expect = chai.expect
const proxyquire = require('proxyquire')

// mocked dependencies
function isValidJson(json) {
    try {
        JSON.parse(json)
    } catch (e) {
        return false
    }

    return true
}

const mockLogging = {
    warn: function() {}
}
const mockDatabase = function() {
    return {
        end: function() {}
    }
}
const mockUserAuth = {
    generateHash: undefined
}
const mockLocalAuth = {
    save: undefined
}
const mockUser = {
    findByEmail: undefined,
    findByUsername: undefined,
    save: undefined
}

const Controller = proxyquire('./controller', {
    '../logging': mockLogging,
    '../../config/database': mockDatabase,
    '../security/user-auth': mockUserAuth,
    '../security/local-auth': mockLocalAuth,
    '../users/user': mockUser
})

// scenarios
describe('Registration Controller', () => {
    describe('Structure', () => {
        it('returns a function that returns an object', () => {
            expect(typeof Controller).to.be.equal('function')
            expect(typeof Controller()).to.be.equal('object')
        })
    })

    describe('Functions', () => {
        describe('register', () => {
            const controller = Controller()

            it('checks that email is valid', (done) => {
                controller.register('andy', 'invalidEmail.com', 'password')
                    .then(() => {
                        done(new Error('Registration should not have been successful'))
                    })
                    .catch((e) => {
                        expect(isValidJson(e.message)).to.be.true()
                        done()
                    })
            })

            it('checks that email is unique', (done) => {
                mockUser.findByEmail = (db, email) => {
                    return Promise.resolve({})
                }

                controller.register('andy', 'email@email.com', 'password')
                    .then(() => {
                        done(new Error('Registration should not have been successful'))
                    })
                    .catch((e) => {
                        expect(e).to.exist()
                        done()
                    })
            })

            it('checks that username is valid', (done) => {
                controller.register('and', 'email@email.com', 'password')
                    .then(() => {
                        done(new Error('Registration should not have been successful'))
                    })
                    .catch((e) => {
                        expect(isValidJson(e.message)).to.be.true()
                        done()
                    })
            })

            it('checks that username is unique', (done) => {
                mockUser.findByEmail = () => { return Promise.resolve(undefined) }
                mockUser.findByUsername = () => { return Promise.resolve({}) }

                controller.register('andy', 'email@email.com', 'password')
                    .then(() => {
                        done(new Error('Registration should not have been successful'))
                    })
                    .catch((e) => {
                        expect(e).to.exist()
                        done()
                    })
            })

            it('checks that password is valid', (done) => {
                controller.register('andy', 'email@email.com', 'pass')
                    .then(() => {
                        done(new Error('Registration should not have been successful'))
                    })
                    .catch((e) => {
                        expect(e).to.exist()
                        expect(isValidJson(e.message)).to.be.true()
                        done()
                    })
            })
        })

        describe('handleRegistration', () => {
            const controller = Controller()

            it('checks that username is present', () => {
                const request = {
                    body: { username: undefined, password: '', email: '' }
                }
                const response = {
                    setHeader: function() {},
                    status: function(status) {
                        expect(status).to.equal(400)

                        return {
                            send: function(a) {
                                expect(a).to.exist()
                                expect(a).to.be.instanceof(Object)
                            }
                        }
                    }
                }

                controller.handleRegistration(request, response)
            })

            it('checks that email is present', () => {
                const request = {
                    body: { username: '', password: '', email: undefined }
                }
                const response = {
                    setHeader: function() {},
                    status: function(status) {
                        expect(status).to.equal(400)

                        return {
                            send: function(a) {
                                expect(a).to.exist()
                                expect(a).to.be.instanceof(Object)
                            }
                        }
                    }
                }

                controller.handleRegistration(request, response)
            })

            it('checks that password is present', () => {
                const request = {
                    body: { username: '', password: undefined, email: '' }
                }
                const response = {
                    setHeader: function() {},
                    status: function(status) {
                        expect(status).to.equal(400)

                        return {
                            send: function(a) {
                                expect(a).to.exist()
                                expect(a).to.be.instanceof(Object)
                            }
                        }
                    }
                }

                controller.handleRegistration(request, response)
            })
        })
    })
})
