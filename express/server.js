const express = require('express');
const fetch = require('node-fetch');
const mongoose = require("mongoose");
const argon2 = require("argon2")
const cron = require('node-cron');
const Joi = require('joi');
const cookieParser = require("cookie-parser");

const { Readable } = require('stream');
const { connectDB } = require("./mongo-db-connect");
const { type } = require('os');
const { normalize } = require('path');

require('dotenv').config();

const app = express();
const port = 3001
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
  connectDB();
  updateEpisodesFromAzuracast();
  updateArtistFromAzuracast();
});


const front_api_link= process.env.FRONTEND_API_ROUTE
const frontend_domain= process.env.FRONTEND_DOMAIN

function URLize(input){
  return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_")
}

/////////////////////// AZURACAST ///////////////////////

const api_key = process.env.AZURACAST_PODCASTS_API_KEY
const azuracast_server = process.env.AZURACAST_SERVER_API_ROUTE
const station_shortcode = process.env.AZURACAST_STATION_SHORTCODE


// Template requête GET à Azuracast
async function get_request(address, req , method="GET") {
  try {
	const response = await fetch(address, {
	  method: method,
	  headers: { Authorization: `Bearer ${api_key}` },
	});

	const isJson = response.headers
	  .get("content-type")
	  ?.includes("application/json");

	if (!response.ok) {
	  const errorBody = isJson ? await response.json() : await response.text();
	  return { code: response.status, type: "Error", log: errorBody };
	}

	const data = isJson ? await response.json() : await response.text();
	return { code: 200, type: "Success", log: data };

  } catch (error) {
	return { code: 500, type: "Internal Server Error", log: error.message };
  }
}

// Template requête GET Media à Azuracast
async function getMediaRequest(media_url,res){
  const actual = await fetch(media_url, {
	  headers: {
		"Authorization": `Bearer ${api_key}`
	  }
	});

	actual.headers.forEach((value, name) => res.setHeader(name, value));
	if (typeof actual.body.pipe === 'function') {
	  actual.body.pipe(res);
	} else {
	  Readable.fromWeb(actual.body).pipe(res);
	}
  
}

/////////////////////// MONGODB UTILS ///////////////////////

/*cron.schedule('0 * * * *', async () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await Authtoken.deleteMany({ timestamp: { $lt: oneWeekAgo } });
});*/

// MongoDB schemas

/*const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  roles: { type: [String], default: ["user"] },
  c_timestamp: {type: Date, required: false}
}));*/

const Artist = mongoose.model("Artist", new mongoose.Schema({
  artist_name: { type: String, required: true, unique: false }, // Nom d'affichage
  artiste_unique_name: { type: String, required: true, unique: true }, //Nom unique en minuscule
  artist_id_azuracast:{ type: String, required: true, unique: true },
  cover: { type: String}, //lien de l'image de la photo de profil de l'artiste
  banner: { type: String}, //lien de l'image de la bannière de l'artiste
  desc: { type: String}, //description
  desc_short: { type: String},//description raccourcie azuracast
  link: { type: String}, //lien de la page
  external_links:[{ type: String}], //liens externes artiste
  lang: { type: String}, 
  c_timestamp: {type: Date, required: false}, //timestamp de création
  owned_by:{type: String}, //Userid auquel l'artiste est relié 
  dj_sets:{type:String},
  published_episodes:{type:Number},
  enabled:{type: Boolean}, 
  published:{type: Boolean},
}));

const Episode = mongoose.model("Episode", new mongoose.Schema({
  artist_name: { type: String, required: true}, // Nom d'affichage
  artiste_unique_name: { type: String, required: true}, //Nom unique en minuscule
  artist_id_azuracast:{ type: String, required: true},
  episode_name: { type: String, required: true}, // Nom d'affichage
  episode_unique_name: { type: String, required: true}, //Nom unique en minuscule
  episode_id_azuracast:{ type: String, required: true, unique: true },
  cover: { type: String}, //lien de l'image de la photo de profil de l'artiste
  banner: { type: String}, //lien de l'image de la bannière de l'artiste
  desc: { type: String}, //description
  desc_short: { type: String},//description raccourcie azuracast
  c_timestamp: {type: Date, required: true}, //timestamp de création
  p_timestamp: {type: Date, required: true},
  owned_by: {type: String}, //Userid auquel l'artiste est relié 
  has_media: {type: Boolean},
  media: { type: String},
  length:{ type:Number},
  published:{type: Boolean},
}));

//MongoDB update de la liste des artistes

async function updateArtistFromAzuracast(){
  const response = await get_request(`${azuracast_server}/api/station/${station_shortcode}/podcasts`);
  
  if (response.code!=200){return};
  
  const artists_raw_data=response.log

  for (i of artists_raw_data){

	const ep_nb = await Episode.find({artist_id_azuracast:i.id,published:true})
	await Artist.findOneAndUpdate(
	  { artist_id_azuracast: i.id },
	  {
		artist_name: i.author,
		artiste_unique_name: URLize(i.title),
		artist_id_azuracast:i.id,
		cover: `${front_api_link}/radio/artists/${URLize(i.title)}/cover`,
		banner: "",
		desc: i.description,
		desc_short: i.description_short,
		link: `${frontend_domain}/sets/${URLize(i.title)}`,
		external_links:(i.branding_config.public_custom_html ?? "").split("\n"),
		lang: i.language,
		dj_sets:`${front_api_link}/radio/artists/${URLize(i.title)}/sets`,
		//c_timestamp:oldest_set_timestamp,
		published_episodes:ep_nb.length,
		enabled:i.is_enabled, 
		published:i.is_published,
	  },
	  { upsert: true, new: true, setDefaultsOnInsert: true }
	);
  };
};

async function updateEpisodesFromAzuracast() {

  const response = await get_request(`${azuracast_server}/api/station/${station_shortcode}/podcasts`);

  if (response.code!=200){return};

  for (let i of response.log){
	if (i.is_published){
	  const artist_sets_response = await get_request(`${azuracast_server}/api/station/${station_shortcode}/podcast/${i.id}/episodes`);
	  if (artist_sets_response.log.length>0){
		
		for (let j of artist_sets_response.log){
		  if(j.has_media){
			await Episode.findOneAndUpdate(
			  { episode_id_azuracast: j.id },
			  {
				artist_name:i.author,
				artiste_unique_name: URLize(i.title),
				artist_id_azuracast:i.id,
				episode_name: j.title, // Nom d'affichage
				episode_unique_name: URLize(j.title),
				episode_id_azuracast:j.id,
				cover: `${front_api_link}/radio/artists/${URLize(i.title)}/${URLize(j.title)}/cover`,
				banner: "", //lien de l'image de la bannière de l'artiste
				desc: j.description, //description
				desc_short: j.description_short,//description raccourcie azuracast
				length:j.media?.length ? j.media : "",
				c_timestamp: new Date(j.created_at * 1000), //timestamp de création
				p_timestamp: new Date(j.publish_at * 1000),
				owned_by:"", //Userid auquel l'artiste est relié 
				has_media:j.has_media,
				media:`${front_api_link}/radio/artists/${URLize(i.title)}/${URLize(j.title)}.mp3`,
				length:j.media.length,
				published:j.is_published,
			  },
			  { upsert: true, new: true, setDefaultsOnInsert: true }
			);
		  };
		};
	  };
	};
  };
};

/*const Password = mongoose.model("Password", new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  password_hash: { type: String, required: true }
}));

const Authtoken = mongoose.model("Authtoken", new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  useragent: {type: String, required: true},
  timestamp: { type: Date, required: true}
}));

const AuthLog = mongoose.model("AuthLog", new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  log: [{
	timestamp: { type: Date, default: Date.now },
	action: { type: String, enum: ["LOGIN_SUCCESS", "LOGIN_FAILED"], required: true },
	ip: { type: String, required: true },
	useragent: { type: String },
  }]
}));*/

// JOI SCHEMAS :

const minUsernameChar = 6
const maxUsernameChar = 20
const maxEmailChar = 30

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(minUsernameChar).max(maxUsernameChar).required(),
  email: Joi.string().email().max(maxEmailChar).required(),
  password: Joi.string().min(8).regex(/[A-Z]/, 'need-upper-case').regex(/[a-z]/, 'need-lower-case').regex(/[^\w]/, 'need-special character').regex(/[0-9]/, "need-number").required(),
});

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(minUsernameChar).max(maxUsernameChar).required(),
  password: Joi.string().min(8).required(),
});

const userSelfModifyDataSchema = Joi.object({
  username: Joi.string().alphanum().required(),
  new_username: Joi.string().alphanum().min(minUsernameChar).max(maxUsernameChar).required(),
  new_email: Joi.string().email().max(maxEmailChar).required(),

});

const userSelfModifyPasswordSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  new_password: Joi.string().min(8).regex(/[A-Z]/, 'need-upper-case').regex(/[a-z]/, 'need-lower-case').regex(/[^\w]/, 'need-special character').regex(/[0-9]/, "need-number").required(),
});

/////////////////////// ENDPOINTS API ///////////////////////

app.get("/update", async (req, res) => {
	
	updateArtistFromAzuracast();
	updateEpisodesFromAzuracast();

	return res.status(200).json({code:200,type:"Success",log:"Updated"});
});

/// AZURACAST UTILS ///

//GET - Actuellement joué | GET à Azuracast
app.get("/api/v1/radio/now_playing", async (req, res) => {
  const response = await get_request(`${azuracast_server}/api/nowplaying_static/${station_shortcode}.json`,req);
  if (response.code!=200){return res.status(response.code).json(response)};
  const response_log=response.log
  let result={
	station:{
	  name:response_log.station.name,
	  description:response_log.station.description,
	  mounts:[],
	  listen_url:`${front_api_link}/radio/mountpoints/tntr128.mp3`,
	},
	listeners:response_log.listeners,
	live:response_log.live,
	now_playing:response_log.now_playing,
	playing_next:response_log.playing_next,
	song_history:response_log.song_history
  }
  for (let i of response_log.station.mounts){
	result.station.mounts.push({name:i.name,url:`${front_api_link}/radio/mountpoints/${(i.path).split("/")[1]}`,bitrate:i.bitrate})
  }

  res.status(response.code).json({code:response.code,type:response.type,log:result});
});

//POST - Planning | GET à Azuracast
app.get("/api/v1/radio/schedule", async (req, res) => {
  const response = await get_request(`${azuracast_server}/api/station/${station_shortcode}/schedule?now=now&rows=48`, req);
  return res.status(response.code).json(response);
});

//GET - Flux audios | GET à Azuracast
app.get("/api/v1/radio/mountpoints/:mount", async (req, res) => {
  try {
	const { mount } = req.params;

	await getMediaRequest(`${azuracast_server}/listen/tntr/${mount}`,res);

  } catch (error) {
	console.error(error);
	res.status(500).json({code: 500,type: "Internal Server Error",log: error.message});
  }
});

/**************/
/// ARTISTES ///
/**************/

function artist_template(i,ep_nb){
  	return {
		title:i.artist_name,
		title_min:i.artiste_unique_name,
		cover:i.cover,
		desc:i.desc,
		desc_short:i.desc_short,
		link:i.link,
		external_links:i.external_links,
		lang:i.lang,
		episodes:i.dj_sets,
		episodes_nb:i.published_episodes,
		c_timestamp:Date.parse(i.c_timestamp)
	}
}

//GET - Artistes | Query à MongoDB
app.get("/api/v1/radio/artists", async (req, res) => {

  const artists_list = await Artist.find({published:true,enabled:true});
	let artists_sets=[];
	for (let i of artists_list){
		artists_sets.push(artist_template(i));
	};
  
  const artist_response={code:200,type:"Success",log:artists_sets}

  return res.status(artist_response.code).json(artist_response);
});

//GET - Derniers artistes publiés | Query à MongoDB
app.get("/api/v1/radio/artists/latests", async (req, res) => {
	
	try{

		const artists_list = await Artist.find({published:true,enabled:true});
		let artists_sets=[];
		for (let i of artists_list){
			
			artists_sets.push(artist_template(i));
		};
		
		//Décroissant puis 10 premiers
		let latest_10_artists= artists_sets.sort((a, b) => b.c_timestamp - a.c_timestamp).slice(0,10);
		
		return res.status(200).json({code:200,type:"Success",log:latest_10_artists});
	  
	} catch (error) {
	  return { code: 500, type: "Internal Server Error", log: error.message };
	}
});

//GET - Images des artistes | GET à Azuracast
app.get("/api/v1/radio/artists/:artist_name/cover", async (req, res) => {
  try {
	const { artist_name } = req.params;

	const artist=await Artist.findOne({artiste_unique_name:artist_name});
	const artist_id=artist.artist_id_azuracast;

	const response = await get_request(
	  `${azuracast_server}/api/station/${station_shortcode}/podcast/${artist_id}`,
	  req
	);

	if (response.code !== 200) {
	  return res.status(response.code).json(response);
	}

	await getMediaRequest(response.log.art,res);

  } catch (error) {
	console.error(error);
	res.status(500).json({code: 500,type: "Internal Server Error",log: error.message});
  }
});

//GET - Sets des artistes | Query à MongoDB
app.get("/api/v1/radio/artists/:artist_name/sets", async (req, res) => {
  try {
	const { artist_name } = req.params;

	const artist=await Artist.findOne({artiste_unique_name:artist_name});
	const artist_id=artist.artist_id_azuracast;

	const episodes_list= await Episode.find({artist_id_azuracast:artist_id,published:true})

	let artists_sets=[];
	for (let i of episodes_list){
	  artists_sets.push(episode_template(i));
	};

	artists_sets.sort((a, b) => b.release_date - a.release_date)

	return res.status(200).json({code:200,type:"Success",log:artists_sets});
  } catch (error) {
	console.error(error);
	res.status(500).json({code: 500,type: "Internal Server Error",log: error.message});
  }
});

/**********/
/// SETS ///
/**********/

function episode_template(i){
  return {
		artist:i.artist_name,
		artist_unique_name:i.artiste_unique_name,
		title:i.episode_name,
		title_unique_name:i.episode_unique_name,
		desc:i.desc,
		duration:i.length,
		cover:i.cover,
		banner:i.banner,
		media:i.media,
		release_date:Date.parse(i.p_timestamp)
	  }
}

//GET - Derniers sets publiés | Query à MongoDB
app.get("/api/v1/radio/sets/latests", async (req, res) => {
  try{
	const episodes_list = await Episode.find({published:true,has_media:true});
	let artists_sets=[];
	for (let i of episodes_list){
	  artists_sets.push(episode_template(i));
	};

	//Décroissant puis 10 premiers
	let latest_10_podcasts= artists_sets.sort((a, b) => b.release_date - a.release_date).slice(0,10);
	
	
	return res.status(200).json({code:200,type:"Success",log:latest_10_podcasts});

	} catch (error) {
	  return { code: 500, type: "Internal Server Error", log: error.message };
	}
});

//GET - Images des sets | GET à Azuracast
app.get("/api/v1/radio/artists/:artist_name/:episode_name/cover", async (req, res) => {
  try {
	const { artist_name,episode_name } = req.params;

	const artist=await Artist.findOne({artiste_unique_name:artist_name});
	const artist_id=artist.artist_id_azuracast;

	const episode=await Episode.findOne({episode_unique_name:episode_name});
	const episode_id=episode.episode_id_azuracast;

	const response = await get_request(
	  `${azuracast_server}/api/station/${station_shortcode}/podcast/${artist_id}/episode/${episode_id}`,
	  req
	);

	if (response.code !== 200) {
	  return res.status(response.code).json(response);
	}

	await getMediaRequest(response.log.art,res);

  } catch (error) {
	console.error(error);
	res.status(500).json({code: 500,type: "Internal Server Error",log: error.message});
  }
});

//GET - Images des sets | GET à Azuracast
app.get("/api/v1/radio/artists/:artist_name/:episode_name.mp3", async (req, res) => {
  try {
	const { artist_name,episode_name } = req.params;

	const artist=await Artist.findOne({artiste_unique_name:artist_name});
	const artist_id=artist.artist_id_azuracast;

	const episode=await Episode.findOne({episode_unique_name:episode_name});
	const episode_id=episode.episode_id_azuracast;

	await getMediaRequest(`${azuracast_server}/api/station/${station_shortcode}/public/podcast/${artist_id}/episode/${episode_id}/download.mp3?refresh=0`,res);

  } catch (error) {
	console.error(error);
	res.status(500).json({code: 500,type: "Internal Server Error",log: error.message});
  }
});
