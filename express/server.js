const express = require('express');

const { connectDB } = require ("./express_utils/mongo-db-connect");
const { updateArtistFromAzuracast, updateEpisodesFromAzuracast } = require("./azuracast/utils");

const { express_values } = require("./express_utils/env-values-dictionnary");

const app = express();
const port = express_values.port
app.use(express.json());
app.set('trust proxy', true);

app.listen(port, () => {
	console.log(`Server is running on port ${port}.`);
	connectDB();
	updateMongoDBFromAzuracast();
});

/////////////////////// TEST / DEBUG ///////////////////////

function updateMongoDBFromAzuracast(){
	updateEpisodesFromAzuracast();
	updateArtistFromAzuracast();
}

app.get("/update-mongo-db", async (req, res) => {
	
	updateMongoDBFromAzuracast();
	
	return res.status(200).json({code:200,type:"Success",log:"Updated"});
});

/////////////////////// AZURACAST ///////////////////////

const azuracast_routes =require("./azuracast/routes/main");

app.use(`${express_values.public_route}/radio/`, azuracast_routes)

