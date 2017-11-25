'use strict'

// test dependencies
const dirtyChai = require('dirty-chai')
const chai = require('chai')
chai.use(dirtyChai)
const expect = chai.expect
const proxyquire = require('proxyquire')

// mocks
const mockJwt = {
    'verify': undefined,
    'sign': undefined
}
const mockConfig = {
    'jwt_secret': undefined
}
const mockDatabase = function() {
    return {
        end: function() {}
    }
}
const mockUser = {
    findByEmail: undefined
}
const mockLocalAuth = {
    findByUserId: undefined
}
var isValidPasswordResult = true
const mockUserAuth = class MockUserAuth {
    isValidPassword(password) {
        return isValidPasswordResult
    }
}

const controller = proxyquire('./controller', {
    'jsonwebtoken': mockJwt,
    '../../config/config.json': mockConfig,
    '../../config/database': mockDatabase,
    '../users/user': mockUser,
    '../security/local-auth': mockLocalAuth,
    '../security/user-auth': mockUserAuth
})

// scenarios
describe('Security Controller', () => {
    describe('Structure', () => {
        it('should be a function', () => {
            expect(controller).to.be.a('Function')
        })

        it('should return an object when initialized', () => {
            expect(controller()).to.be.an('Object')
        })
    })

    describe('Functions', () => {
        describe('isValidToken', () => {
            it('should fail if token is undefined', (done) => {
                controller().isValidToken().then(() => {
                    done(new Error('Error should have been thrown'))
                }).catch((e) => {
                    expect(e).to.exist()
                    done()
                })
            })

            it('should fail if an error occurs', (done) => {
                const token = 'fake-token'
                const error = {}
                mockJwt.verify = function(token, secret, next) {
                    next(error, null)
                }

                controller().isValidToken(token).then(() => {
                    done(new Error('Error should have been thrown'))
                }).catch((err) => {
                    expect(err).to.be.equal(error)
                    done()
                })
            })

            it('should succeed if token gets decoded', (done) => {
                const token = 'fake-token'
                const decoded = {}
                mockJwt.verify = function(token, secret, next) {
                    next(null, decoded)
                }

                controller().isValidToken(token).then((result) => {
                    expect(result).to.be.equal(decoded)
                    done()
                }).catch((e) => {
                    done(e)
                })
            })
        })

        describe('getToken', () => {
            const user = { id: 1, username: 'username', email: 'email@example.com' }
            const localAuth = { password: 'password' }
            const token = 'fake-token'

            it('should return a token if successful', (done) => {
                mockUser.findByEmail = function(connection, username) {
                    return Promise.resolve(user)
                }
                mockLocalAuth.findByUserId = function(connection, user) {
                    return Promise.resolve(localAuth)
                }
                mockJwt.sign = function() {
                    return token
                }
                isValidPasswordResult = true

                controller().getToken(user.username, localAuth.password)
                    .then((result) => {
                        expect(result).to.be.equal(token)
                        done()
                    })
                    .catch(() => {
                        done(new Error('Error thrown'))
                    })
            })

            it('fails if no user is found', (done) => {
                mockUser.findByEmail = function(connection, username) {
                    return Promise.resolve(undefined)
                }
                controller().getToken('username', 'password')
                    .then(() => {
                        done(new Error('Error should have been thrown'))
                    })
                    .catch((err) => {
                        expect(err).to.exist()
                        done()
                    })
            })

            it('fails if password is invalid', (done) => {
                mockUser.findByEmail = function(connection, username) {
                    return Promise.resolve(user)
                }
                mockLocalAuth.findByUserId = function(connection, user) {
                    return Promise.resolve(localAuth)
                }
                isValidPasswordResult = false

                controller().getToken(user.username, localAuth.password)
                    .then((result) => {
                        expect(result).to.be.null()
                        done()
                    }).catch((err) => {
                        done(new Error('This block should not be called! ' + err))
                    })
            })
        })
    })
})
