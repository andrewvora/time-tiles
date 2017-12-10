'use strict'

// test dependencies
const dirtyChai = require('dirty-chai')
const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(dirtyChai)
chai.use(chaiHttp)
const expect = chai.expect

const config = require('../config/config.json')
if (config['mysql'].type === 'test') {
    const database = require('../config/database')
    const proxyquire = require('proxyquire')
    const server = proxyquire('../app/server', {
        'morgan': () => { return require('morgan')('tiny', { skip: () => { return true } }) }
    })

    describe('Time Tiles Server', () => {
        beforeEach((done) => {
            const connection = database()
            connection.query(`DELETE FROM ?? WHERE 1=1`, ['tiles'], (err, results) => {
                if (err) {
                    connection.end()
                    done(err)
                } else {
                    connection.query(`DELETE FROM ?? WHERE 1=1`, ['users'], (err, results) => {
                        if (err) {
                            done(err)
                        } else {
                            done()
                        }
                    })
                    connection.end()
                }
            })
        })

        describe('Tile Routes', () => {
            let token
            const user = {
                name: 'tester',
                password: 'testy123',
                email: 'tester@example.com'
            }
            beforeEach((done) => {
                const registrationController = require('../app/registration')
                const securityController = require('../app/security')
                registrationController().register(user.name, user.email, user.password)
                    .then((res) => {
                        securityController().getToken(user.email, user.password)
                            .then((res) => {
                                token = res
                                done()
                            })
                            .catch((err) => {
                                done(err)
                            })
                    })
                    .catch((err) => {
                        done(err)
                    })
            })

            it('supports creating new tiles', (done) => {
                const postBody = {
                    name: 'test tile',
                    design: '#000'
                }
                chai.request(server)
                    .post('/api/v1/tiles')
                    .set('Authorization', token)
                    .send(postBody)
                    .end((err, response) => {
                        expect(response).to.have.status(201)
                        expect(response.body).to.be.instanceof(Object)
                        expect(response.body.name).to.equal(postBody.name)
                        expect(response.body.design).to.equal(postBody.design)
                        expect(response.body.started).to.equal(postBody.started)
                        done(err)
                    })
            })

            it('supports updating tiles', () => {

            })

            it('supports deleting tiles', () => {

            })

            it('supports retrieving tiles', () => {

            })
        })

        describe('Authentication Routes', () => {
            it('can create new accounts', () => {

            })

            it('gives tokens to authenticated requests', () => {

            })
        })

        describe('Documentation', () => {
            it('returns an HTML page at the root route', () => {

            })
        })
    })
} else {
    expect.fail()
}
