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

app.use(`${express_values.public_route}/radio/`, azuracast_routes);

///////////////////////// USERS /////////////////////////

const users_routes =require("./users/routes/main");

//app.use(`${express_values.public_route}/users/`, users_routes);

/////////////////////// INTERNAL ////////////////////////

const internal_routes =require("./internal/routes/main");

//app.use(`/internal/`, internal_routes);

//////////////////////// UTILS //////////////////////////

app.get(`${express_values.public_route}/sitemap.xml`, async (req, res) => {
    let response = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url>\n<loc>https://www.tirnatek.fr/</loc>\n<priority>1.0</priority>\n</url>\n<url>\n<loc>https://www.tirnatek.fr/sets</loc>\n<priority>0.9</priority>\n</url>';
    const url = `http://localhost:3001${express_values.public_route}/radio/artists/`;
    try {
        const result = await fetch(url);
        const data = await result.json()
        for (let i of data.log){
            console.log(i.title_min)
            const artist_page_url = `https://www.tirnatek.fr/sets/${i.title_min}`;
            response+=`<url>\n<loc>${artist_page_url}</loc>\n</url>`;
            const episode_result = await fetch(url+i.title_min+"/sets/");
            const episode_data = await episode_result.json();
            console.log(episode_data.log);
            for (let j of episode_data.log){
                const episode_page_url = artist_page_url+"/"+j.title_unique_name
                response+=`<url>\n<loc>${episode_page_url}</loc>\n</url>`;
            }
        }
        response+='</urlset>'
    } catch (error){
		res.status(500).json({code:500,type:'Internal server error.'})
    }
    
	res.setHeader("Content-Type", "application/xml");
    res.status(200).send(response)
});