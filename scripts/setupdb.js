'use strict'

const mysql = require('mysql')

const DB_NAME = process.env.TT_DB_NAME
const USERS_TABLE = 'users'
const LOGIN_TABLE = 'login'
const GOOGLE_LOGIN_TABLE = 'google_login'
const FACEBOOK_LOGIN_TABLE = 'facebook_login'
const TILES_TABLE = 'tiles'

function setUpDatabase(done) {
    // create the connection
    const connection = mysql.createConnection({
        host: process.env.TT_DB_HOST,
        user: process.env.TT_DB_USER,
        password: process.env.TT_DB_PASSWORD
    })

    // create tables
    connection.connect()
    connection.query('CREATE DATABASE IF NOT EXISTS ??', DB_NAME, (err) => {
        if (err) {
            console.log('Failed to create database:\n', err)
        } else {
            changeToDatabase(connection, () => {
                connection.end()
                done()
            })
        }
    })
}

function changeToDatabase(connection, done) {
    connection.query('USE ??', DB_NAME, (err) => {
        if (err) {
            console.log('Failed to switch to database:\n', err)
        } else {
            createTables(connection, done)
        }
    })
}

function createTables(connection, done) {
    createUserTable(connection, done)
}

function createUserTable(connection, done) {
    const createUserTable = `
        CREATE TABLE IF NOT EXISTS ?? (
          id INT AUTO_INCREMENT,
          username VARCHAR(255) UNIQUE,
          email VARCHAR(255),
          created_at TIMESTAMP,
          PRIMARY KEY(id)
        )`
    connection.query(createUserTable, USERS_TABLE, (err) => {
        if (err) {
            console.log('Failed to create %s table:\n%s', USERS_TABLE, err)
            done()
            return
        }
        createLocalLoginTable(connection, done)
    })
}

function createLocalLoginTable(connection, done) {
    const query = `
        CREATE TABLE IF NOT EXISTS ?? (
          id INT AUTO_INCREMENT,
          user_id INT,
          password VARCHAR(255),
          PRIMARY KEY(id),
          FOREIGN KEY(user_id) REFERENCES ??(id) ON DELETE CASCADE
        )`
    connection.query(query, [LOGIN_TABLE, USERS_TABLE], (err) => {
        if (err) {
            console.log('Failed to create %s table:\n%s', LOGIN_TABLE, err)
            done()
            return
        }
        createGoogleLoginTable(connection, done)
    })
}

function createGoogleLoginTable(connection, done) {
    const query = `CREATE TABLE IF NOT EXISTS ?? (
        id INT AUTO_INCREMENT,
        user_id INT,
        token VARCHAR(255),
        email VARCHAR(255),
        name VARCHAR(255),
        PRIMARY KEY(id),
        FOREIGN KEY(user_id) REFERENCES ??(id) ON DELETE CASCADE
      )`
    connection.query(query, [GOOGLE_LOGIN_TABLE, USERS_TABLE], (err) => {
        if (err) {
            console.log('Failed to create %s table:\n%s', GOOGLE_LOGIN_TABLE, err)
            done()
            return
        }
        createFacebookLoginTable(connection, done)
    })
}

function createFacebookLoginTable(connection, done) {
    const query = `CREATE TABLE IF NOT EXISTS ?? (
        id INT AUTO_INCREMENT,
        user_id INT,
        token VARCHAR(255),
        email VARCHAR(255),
        name VARCHAR(255),
        PRIMARY KEY(id),
        FOREIGN KEY(user_id) REFERENCES ??(id) ON DELETE CASCADE
      )`

    connection.query(query, [FACEBOOK_LOGIN_TABLE, USERS_TABLE], (err) => {
        if (err) {
            console.log('Failed to create %s table:\n%s', FACEBOOK_LOGIN_TABLE, err)
            done()
            return
        }
        createTilesTable(connection, done)
    })
}

function createTilesTable(connection, done) {
    const query = `
        CREATE TABLE IF NOT EXISTS ?? (
          id INT AUTO_INCREMENT,
          user_id INT,
          name VARCHAR(255),
          design INT,
          started TIMESTAMP,
          created_at TIMESTAMP,
          updated_at TIMESTAMP,
          PRIMARY KEY(id),
          FOREIGN KEY(user_id) REFERENCES ??(id) ON DELETE CASCADE
        )`
    connection.query(query, [TILES_TABLE, USERS_TABLE], (err) => {
        if (err) {
            console.log('Failed to create %s table:\n%s', TILES_TABLE, err)
        } else {
            console.log('Successfully created tables!')
        }
        done()
    })
}

(function run() {
    setUpDatabase(() => {
        console.log('Execution finished. Terminating...\n')
    })
})()
