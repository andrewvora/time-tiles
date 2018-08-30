'use strict'

// test dependencies
const dirtyChai = require('dirty-chai')
const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(dirtyChai)
chai.use(chaiHttp)
const expect = chai.expect

// scenarios
// only run integration tests in test environments
const config = require('../config/config.json')
if (config['mysql'].type === 'test') {
    const database = require('../config/database')
    const proxyquire = require('proxyquire')
    const server = proxyquire('../app', {
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
                        done(err)
                    })
                    connection.end()
                }
            })
        })

        describe('Tile Routes', () => {
            let createdTile
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

                        createdTile = response.body
                        done(err)
                    })
            })

            it('supports updating tiles', (done) => {
                const putBody = {
                    name: 'updated tile',
                    design: '#FFF',
                    started: 'some-timestamp'
                }

                chai.request(server)
                    .put('/api/v1/tiles/' + createdTile.id)
                    .set('Authorization', token)
                    .send(putBody)
                    .end((err, response) => {
                        expect(response).to.have.status(200)
                        expect(response.body).to.be.instanceof(Object)
                        done(err)
                    })
            })

            it('supports retrieving tiles', (done) => {
                chai.request(server)
                    .get('/api/v1/tiles')
                    .set('Authorization', token)
                    .send()
                    .end((err, response) => {
                        expect(response).to.have.status(200)
                        done(err)
                    })
            })

            it('supports deleting tiles', (done) => {
                chai.request(server)
                    .delete('/api/v1/tiles/' + createdTile.id)
                    .set('Authorization', token)
                    .send()
                    .end((err, response) => {
                        expect(response).to.have.status(204)
                        done(err)
                    })
            })
        })

        describe('Documentation', (done) => {
            it('returns an HTML page at the root route', () => {
                chai.request(server)
                    .get('/')
                    .send()
                    .end((err, response) => {
                        expect(response).to.have.status(200)
                        done(err)
                    })
            })
        })
    })
} else {
    expect.fail()
}
