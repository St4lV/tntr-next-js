require('dotenv').config();
var mariadb = require('mariadb');


var pool = 
	mariadb.createPool({
		host: process.env.MARIADB_SERVER, 
		port: process.env.MARIADB_SERVER_PORT,
		user: process.env.MARIADB_USER, 
		password: MARIADB_USER_PASSWORD,
		database: MARIADB_DATABASE
	});

 module.exports = Object.freeze({
	pool: pool
});