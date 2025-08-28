require('dotenv').config();
const { maria_db_values } = require("./env-values-dictionnary.js");

const { createPool } = require('mariadb');

const server = maria_db_values.server;
const port = maria_db_values.port;
const user = maria_db_values.user;
const password = maria_db_values.password;
const database = maria_db_values.database;

var pool = 
	createPool({
		host: server, 
		port: port,
		user: user, 
		password: password,
		database: database
	});

module.exports = Object.freeze({
	pool: pool
});