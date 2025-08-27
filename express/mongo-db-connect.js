require('dotenv').config();
const mongoose = require('mongoose');

// CONNECT
const connectDB = async () => {
	try {
		await mongoose.connect(`mongodb://${process.env.MONGODB_SERVER}/${process.env.MONGO_DATABASE}`);
		console.log("MongoDB connected!");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1);
	}
};

// EXPORT
module.exports = { connectDB };
