// Setting up the mysql database & connection and ORM (sequelize)

// 1) Database creation & Table schemas

const mysql = require('mysql');
const crypto = require('crypto');
const axios = require('axios');
const _ = require('lodash');
const Avatars = require('@dicebear/avatars').default;
const sprites = require('@dicebear/avatars-jdenticon-sprites').default;
require('dotenv').config();


let options = {};
let avatars = new Avatars(sprites(options));
// Create connection to the database //
const connection = mysql.createConnection({
  // host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Connect to the database //
connection.connect((err) => {
  if (!err) {
    console.log('Houston, we have a db connection');
  } else {
    console.error('There was a problem connecting to the db. Error: ', err);
  }
});

module.exports.connection = connection;

module.exports.insertUser = (username, password) => {
  module.exports.selectAllUsers((err, users) => {
    if (err) {
      callback(err, null);
    } else {
      if (!_.includes(_.map(users, user => user.username), username)) {
        const salt = crypto.randomBytes(16).toString('hex');
        const avatar = avatars.create(username);
        const q = [username, crypto.pbkdf2Sync(password, salt, 1012, 50, 'sha512').toString('hex'), salt, avatar];
        connection.query('INSERT INTO Users (username, password, salt, avatar) VALUES (?, ?, ?, ?)', q, (err2, res) => {
          if (err2) {
            callback(err2, null);
          } else {
            console.log(res);
            // callback(null, res);
          }
        });
      } else {

      }
    }
  });
};

module.exports.selectAllUsers = (callback) => {
  connection.query('SELECT * FROM Users', (err, users) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, users);
    }
  })
};

module.exports.selectUserByUsername = (username, callback) => {
  connection.query(`SELECT * FROM Users WHERE username = '${username}'`, (err, user) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, user);
    }
  })
};


