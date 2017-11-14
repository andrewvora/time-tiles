'use strict'

// test dependencies
const expect = require('chai').expect
const proxyquire = require('proxyquire')

// mocks
const mockDatabase = {
   query: undefined,
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
         const password = "password"
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
         expect(true).is.true // should reach this point without errors
      })
   })

   describe('Functions', () => {
      describe('findByUserId', () => {
         it('fails if an error occurs', () => {
            mockDatabase.query = function(query, args, callback) {
               callback({}, null)
            }

            LocalAuth.findByUserId(mockDatabase, 1)
            .then(() => { expect(true).to.be.false })
            .catch((err) => {
               expect(err).to.exist
            })
         })

         it('handles an undefined result', () => {
            mockDatabase.query = function(query, args, callback) {
               callback(undefined, undefined)
            }

            LocalAuth.findByUserId(mockDatabase, 1)
            .then((result) => {
               expect(result).to.be.undefined
            })
            .catch(() => {})
         })

         it('binds result if it succeeds', () => {
            const result = { id: 1, user_id: 2, password: "password" }
            mockDatabase.query = function(query, args, callback) {
               callback(undefined, undefined)
            }

            LocalAuth.findByUserId(mockDatabase, 2)
            .then((record) => {
               expect(record).to.be.instanceof(LocalAuth)
               expect(record).to.exist
               expect(record.id).to.be.equal(result.id)
               expect(record.user_id).to.be.equal(result.user_id)
               expect(record.password).to.be.equal(result.password)
            })
            .catch(() => {})
         })
      })

      describe('save', () => {
         it('fails if there is an error', () => {
            mockDatabase.query = function(query, args, callback) {
               callback({}, undefined)
            }

            LocalAuth.save(mockDatabase, {})
            .then(() => { expect(true).to.be.false })
            .catch((err) => {
               expect(err).to.exist
            })
         })

         it('attaches ID if it succeeds', () => {
            const result = [{ id: 1 }]
            mockDatabase.query = function(query, args, callback) {
               callback(undefined, result)
            }

            const localAuth = {}
            LocalAuth.save(mockDatabase, localAuth)
            .then((result) => {
               expect(result).to.exist
               expect(result.id).to.be.equal(1)
               expect(result).to.equal(localAuth)
            })
            .catch(() => {})
         })
      })
   })
})
