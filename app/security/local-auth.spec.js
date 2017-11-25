'use strict'

// test dependencies
const dirtyChai = require('dirty-chai')
const chai = require('chai')
chai.use(dirtyChai)
const expect = chai.expect
const proxyquire = require('proxyquire')

// mocks
const mockDatabase = {
    query: undefined
}
const LocalAuth = proxyquire('./local-auth', {})

// scenarios
describe('LocalAuth', () => {
    describe('Structure', () => {
        it('should be a class', () => {
            expect(LocalAuth).to.be.a('Function')
            expect(new LocalAuth()).to.be.an.instanceof(Object)
        })

        it('has a constructor that can set all fields', () => {
            const id = 1
            const userId = 2
            const password = 'password'
            const localAuth = new LocalAuth({
                id: id,
                user_id: userId,
                password: password
            })
            expect(localAuth.id).to.be.equal(id)
            expect(localAuth.user_id).to.be.equal(userId)
            expect(localAuth.password).to.be.equal(password)
        })

        it('has a constructor that has default parameters', () => {
            const localAuth = new LocalAuth()
            expect(localAuth).to.exist() // should reach this point without errors
        })
    })

    describe('Functions', () => {
        describe('findByUserId', () => {
            it('fails if an error occurs', (done) => {
                mockDatabase.query = function(query, args, callback) {
                    callback(new Error(), null)
                }

                LocalAuth.findByUserId(mockDatabase, 1)
                    .then(() => {
                        done(new Error('Error should have been thrown'))
                    })
                    .catch((err) => {
                        expect(err).to.exist()
                        done()
                    })
            })

            it('handles an undefined result', (done) => {
                mockDatabase.query = function(query, args, callback) {
                    callback(null, undefined)
                }

                LocalAuth.findByUserId(mockDatabase, 1)
                    .then((result) => {
                        expect(result).to.be.undefined()
                        done()
                    })
                    .catch((e) => {
                        done(e)
                    })
            })

            it('binds result if it succeeds', (done) => {
                const result = { id: 1, user_id: 2, password: 'password' }
                mockDatabase.query = function(query, args, callback) {
                    callback(null, [result])
                }

                LocalAuth.findByUserId(mockDatabase, 2)
                    .then((record) => {
                        expect(record).to.be.instanceof(LocalAuth)
                        expect(record).to.exist()
                        expect(record.id).to.be.equal(result.id)
                        expect(record.user_id).to.be.equal(result.user_id)
                        expect(record.password).to.be.equal(result.password)
                        done()
                    })
                    .catch((e) => {
                        done(e)
                    })
            })
        })

        describe('save', () => {
            it('fails if there is an error', (done) => {
                mockDatabase.query = function(query, args, callback) {
                    callback(new Error(), undefined)
                }

                LocalAuth.save(mockDatabase, {})
                    .then(() => {
                        expect(true).to.be.false()
                        done(new Error('Error should have been thrown'))
                    })
                    .catch((err) => {
                        expect(err).to.exist()
                        done()
                    })
            })

            it('attaches ID if it succeeds', (done) => {
                mockDatabase.query = function(query, args, callback) {
                    callback(null, { insertId: 1 })
                }

                const localAuth = {}
                LocalAuth.save(mockDatabase, localAuth)
                    .then((result) => {
                        expect(result).to.exist()
                        expect(result.id).to.be.equal(1)
                        expect(result).to.equal(localAuth)
                        done()
                    })
                    .catch((e) => {
                        done(e)
                    })
            })
        })
    })
})
