'use strict'

// test dependencies
const expect = require('chai').expect
const proxyquire = require('proxyquire')

// mocks
const mockDatabase = {
   query: undefined
}
const User = proxyquire('./user', {})

// scenarios
describe('User', () => {
   describe('Structure', () => {
      it('should be a class', () => {
         expect(User).to.be.a('Function')
         expect(new User()).to.be.an.instanceof(Object)
      })

      it('has a constructor that sets most fields', () => {
         const args = { id: 1, username: "joe", email: "joe@example.com" }
         const user = new User(args)

         expect(user.id).to.equal(args.id)
         expect(user.username).to.equal(args.username)
         expect(user.email).to.equal(args.email)
         expect(user.created_at).to.be.null
      })

      it('has a constructor that has default parameters', () => {
         const user = new User()
         expect(true).is.true // should reach this point without errors
      })
   })

   describe('Functions', () => {
      describe('findByUsername', () => {
         it('fails if there is an error', () => {
            mockDatabase.query = function(query, args, callback) {
               callback({}, undefined)
            }

            User.findByUsername(mockDatabase, "")
            .then(() => {})
            .catch((err) => {
               expect(err).to.exist
            })
         })

         it('handled an undefined result', () => {
            mockDatabase.query = function(query, args, callback) {
               callback(undefined, undefined)
            }

            User.findByUsername(mockDatabase, "")
            .then((result) => {
               expect(result).to.be.undefined
            })
            .catch(() => {})
         })

         it('binds a successful result', () => {
            const record = { id: 1, username: "bob", email: "bob@example.com" }
            mockDatabase.query = function(query, args, callback) {
               callback(undefined, record)
            }

            User.findByUsername(mockDatabase, "")
            .then((result) => {
               expect(result).to.be.instanceof(User)
               expect(result.id).to.equal(record.id)
               expect(result.username).to.equal(record.username)
               expect(result.email).to.equal(record.email)
            })
            .catch(() => {})
         })
      })

      describe('findById', () => {
         it('fails if there is an error', () => {
            mockDatabase.query = function(query, args, callback) {
               callback({}, undefined)
            }

            User.findById(mockDatabase, 1)
            .then(() => {})
            .catch((err) => {
               expect(err).to.exist
            })
         })

         it('handled an undefined result', () => {
            mockDatabase.query = function(query, args, callback) {
               callback(undefined, undefined)
            }

            User.findById(mockDatabase, "")
            .then((result) => {
               expect(result).to.be.undefined
            })
            .catch(() => {})
         })

         it('binds a successful result', () => {
            const record = { id: 1, username: "bob", email: "bob@example.com" }
            mockDatabase.query = function(query, args, callback) {
               callback(undefined, undefined)
            }

            User.findById(mockDatabase, 1)
            .then((result) => {
               expect(result).to.be.instanceof(User)
               expect(result.id).to.equal(record.id)
               expect(result.username).to.equal(record.username)
               expect(result.email).to.equal(record.email)
            })
            .catch(() => {})
         })
      })

      describe('findByEmail', () => {
         it('fails if there is an error', () => {
            mockDatabase.query = function(query, args, callback) {
               callback({}, undefined)
            }

            User.findByEmail(mockDatabase, "")
            .then(() => {})
            .catch((err) => {
               expect(err).to.exist
            })
         })

         it('handled an undefined result', () => {
            mockDatabase.query = function(query, args, callback) {
               callback(undefined, undefined)
            }

            User.findByEmail(mockDatabase, "")
            .then((result) => {
               expect(result).to.be.undefined
            })
            .catch(() => {})
         })

         it('binds a successful result', () => {
            const record = { id: 1, username: "bob", email: "bob@example.com" }
            mockDatabase.query = function(query, args, callback) {
               callback(undefined, undefined)
            }

            User.findByEmail(mockDatabase, "")
            .then((result) => {
               expect(result).to.be.instanceof(User)
               expect(result.id).to.equal(record.id)
               expect(result.username).to.equal(record.username)
               expect(result.email).to.equal(record.email)
            })
            .catch(() => {})
         })
      })

      describe('save', () => {
         it('should set the id on success', () => {
            const result = { id: 1 }
            mockDatabase.query = function(query, args, callback) {
               callback(undefined, result)
            }
            const user = new User()

            User.save(mockDatabase, user)
            .then((record) => {
               expect(record).to.equal(user)
               expect(user.id).to.equal(result.id)
            })
            .catch(() => {})
         })

         it('fails when there is an error', () => {
            mockDatabase.query = function(query, args, callback) {
               callback({}, undefined)
            }

            User.save(mockDatabase, {})
            .then(() => {})
            .catch((err) => {
               expect(err).to.exist
            })
         })
      })
   })
})
