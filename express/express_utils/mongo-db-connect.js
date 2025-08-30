const { connect } = require('mongoose');
const { mongo_db_values } = require("./env-values-dictionnary.js");

const server = mongo_db_values.server;
const port = mongo_db_values.port;
const database= mongo_db_values.database;

// CONNECT
const connectDB = async () => {
	try {
		await connect(`mongodb://${server+':'+port}/${database}`);
		console.log("MongoDB connected!");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1);
	}
};

module.exports = { connectDB };
