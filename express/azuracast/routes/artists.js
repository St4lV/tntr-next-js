const { Router } = require("express");
const router = Router();

const { Episode, Artist } = require("../mongo-db-schemas.js");

const { getApiRequest, getMediaRequest, artistTemplate, episodeTemplate } = require('../utils.js');

const { azuracast_values } = require("../../express_utils/env-values-dictionnary.js");

// Azuracast values

const azuracast_server = azuracast_values.server;
const api_key = azuracast_values.api_key;
const station_shortcode = azuracast_values.station.shortcode;

//GET - Artistes | Query à MongoDB
// Retournes la liste de tous les artistes disponibles aux utilisateurs

router.get("/", async (req, res) => {

  const artists_list = await Artist.find({published:true,enabled:true});
	let artists_sets=[];
	for (let i of artists_list){
		artists_sets.push(artistTemplate(i));
	};
  
  const artist_response={code:200,type:"Success",log:artists_sets}

  return res.status(artist_response.code).json(artist_response);
});

//GET - Derniers artistes publiés | Query à MongoDB
router.get("/latests", async (req, res) => {
	
	try{

		const artists_list = await Artist.find({published:true,enabled:true});
		let artists_sets=[];
		for (let i of artists_list){
			
			artists_sets.push(artistTemplate(i));
		};
		
		//Décroissant puis 10 premiers
		let latest_10_artists= artists_sets.sort((a, b) => b.c_timestamp - a.c_timestamp).slice(0,10);
		
		return res.status(200).json({code:200,type:"Success",log:latest_10_artists});
	  
	} catch (error) {
	  return { code: 500, type: "Internal Server Error", log: error.message };
	}
});

//GET - Images des artistes | GET à Azuracast
router.get("/:artist_name/cover", async (req, res) => {
  try {
	const { artist_name } = req.params;

	const artist=await Artist.findOne({artiste_unique_name:artist_name});
	const artist_id=artist.artist_id_azuracast;

	const response = await getApiRequest(
	  `${azuracast_server}/api/station/${station_shortcode}/podcast/${artist_id}`
	);

	if (response.code !== 200) {
	  return res.status(response.code).json(response);
	}

	await getMediaRequest(response.log.art,res,req);

  } catch (error) {
	console.error(error);
	res.status(500).json({code: 500,type: "Internal Server Error",log: error.message});
  }
});

//GET - Sets des artistes | Query à MongoDB
router.get("/:artist_name/sets", async (req, res) => {
  try {
	const { artist_name } = req.params;

	const artist=await Artist.findOne({artiste_unique_name:artist_name});
	const artist_id=artist.artist_id_azuracast;

	const episodes_list= await Episode.find({artist_id_azuracast:artist_id,published:true})

	let artists_sets=[];
	for (let i of episodes_list){
	  artists_sets.push(episodeTemplate(i));
	};

	artists_sets.sort((a, b) => b.release_date - a.release_date)

	return res.status(200).json({code:200,type:"Success",log:artists_sets});
  } catch (error) {
	console.error(error);
	res.status(500).json({code: 500,type: "Internal Server Error",log: error.message});
  }
});

//GET - Images des sets | GET à Azuracast

router.get("/:artist_name/:episode_name/cover", async (req, res) => {
  try {
	const { artist_name,episode_name } = req.params;

	const artist=await Artist.findOne({artiste_unique_name:artist_name});
	const artist_id=artist.artist_id_azuracast;

	const episode=await Episode.findOne({episode_unique_name:episode_name});
	const episode_id=episode.episode_id_azuracast;

	const response = await getApiRequest(
	  `${azuracast_server}/api/station/${station_shortcode}/podcast/${artist_id}/episode/${episode_id}`,
	  req
	);

	if (response.code !== 200) {
	  return res.status(response.code).json(response);
	}

	await getMediaRequest(response.log.art,res,req);

  } catch (error) {
	console.error(error);
	res.status(500).json({code: 500,type: "Internal Server Error",log: error.message});
  }
});

//GET - Images des sets | GET à Azuracast

router.get("/:artist_name/:episode_name.mp3", async (req, res) => {
  try {
	const { artist_name,episode_name } = req.params;

	const artist=await Artist.findOne({artiste_unique_name:artist_name});
	const artist_id=artist.artist_id_azuracast;

	const episode=await Episode.findOne({episode_unique_name:episode_name});
	const episode_id=episode.episode_id_azuracast;

	await getMediaRequest(`${azuracast_server}/api/station/${station_shortcode}/public/podcast/${artist_id}/episode/${episode_id}/download.mp3?refresh=0`,res,req);

  } catch (error) {
	console.error(error);
	res.status(500).json({code: 500,type: "Internal Server Error",log: error.message});
  }
});

module.exports = router