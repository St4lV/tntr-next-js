const express = require('express');
const fetch = require('node-fetch');
const mongoose = require("mongoose");
const argon2 = require("argon2")
const cron = require('node-cron');
const Joi = require('joi');
const cookieParser = require("cookie-parser");

const { Readable } = require('stream');
const { connectDB } = require("./mongo-db-connect");

require('dotenv').config();

const app = express();
const port = 3001
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});


const front_api_link= process.env.FRONTEND_API_ROUTE

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

cron.schedule('0 * * * *', async () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await Authtoken.deleteMany({ timestamp: { $lt: oneWeekAgo } });
});

// MongoDB schemas

const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  roles: { type: [String], default: ["user"] },
  c_timestamp: {type: Date, required: false}
}));

const Password = mongoose.model("Password", new mongoose.Schema({
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
}));

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
app.post("/api/v1/radio/schedule", async (req, res) => {
  const response = await get_request(`${azuracast_server}/api/station/${station_shortcode}/schedule?now=now&rows=48`, req);
  const {entries} = req.body
  let max_entries = entries
  if (response.log.length<=entries){
    max_entries=response.log.length
  }
  const slicedArray = response.log.slice(0, entries);
  response.log=slicedArray
  return res.status(response.code).json(response);
});

//GET - Artistes | GET à Azuracast
app.get("/api/v1/radio/artists", async (req, res) => {
  const response = await get_request(`${azuracast_server}/api/station/${station_shortcode}/podcasts`, req);
  
  if (response.code!=200){return res.status(response.code).json(response)};
  
  const artists_raw_data=response.log
  let artists_data=[]

  for (i of artists_raw_data){
    if (i.is_enabled && i.is_published){
      const artist ={
      title:i.author,
      title_min:i.title,
      cover:`${front_api_link}/radio/artists/${i.id}/cover`,
      desc:i.description,
      desc_short:i.description_short,
      link:i.link,
      external_links:(i.branding_config.public_custom_html ?? "").split("\n"),
      lang:i.language,
      episodes_nb:i.episodes
      };
      artists_data.push(artist)
    };
  };
  
  const artist_response={code:200,type:"Success",log:artists_data}

  return res.status(artist_response.code).json(artist_response);
});

//GET - Derniers sets publiés | GET à Azuracast
app.get("/api/v1/radio/sets/latests", async (req, res) => {
  try{

    //Récupération des podcasts
    
    const response = await get_request(`${azuracast_server}/api/station/${station_shortcode}/podcasts`, req);

    if (response.code!=200){return res.status(response.code).json(response)};

    let artists_sets=[];
    for (let i of response.log){
      if (i.is_published){
        const artist_sets_response = await get_request(`${azuracast_server}/api/station/${station_shortcode}/podcast/${i.id}/episodes`, req);
        if (artist_sets_response.log.length>0){
          let published_podcasts=[]

          for (let j of artist_sets_response.log){
            if (j.is_published && j.has_media){
              published_podcasts.push(j)
            }
          }

          for (let j of published_podcasts){
            artists_sets.push({
              artist:i.title,
              title:j.title,
              duration:j.media.length,
              cover:`${front_api_link}/radio/artists/${i.id}/${j.id}/cover`,
              media:`${j.links.download}?refresh=0`,
              release_date:j.publish_at
            });
          };
        };
      };
    };
    
    //Décroissant puis 10 premiers
    let latest_10_podcasts= artists_sets.sort((a, b) => b.release_date - a.release_date).slice(0,10);
    
    
    return res.status(200).json({code:200,type:"Success",log:latest_10_podcasts});

    } catch (error) {
      return { code: 500, type: "Internal Server Error", log: error.message };
    }
});

//GET - Derniers artistes publiés | GET à Azuracast
app.get("/api/v1/radio/artists/latests", async (req, res) => {
  try{

    //Récupération des podcasts
    
    const response = await get_request(`${azuracast_server}/api/station/${station_shortcode}/podcasts`, req);

    if (response.code!=200){return res.status(response.code).json(response)};

    let artists_sets=[];
    for (let i of response.log){
      if (i.is_published){
        const artist_sets_response = await get_request(`${azuracast_server}/api/station/${station_shortcode}/podcast/${i.id}/episodes`, req);
        if (artist_sets_response.log.length>0){

          artists_sets.push({
            title:i.author,
            title_min:i.title,
            desc:i.description,
            desc_short:i.description_short,
            cover:`${front_api_link}/radio/artists/${i.id}/cover`,
            oldest_set_timestamp:artist_sets_response.log.slice(-1)[0].created_at});
        };
      };
    };

    //Décroissant puis 10 premiers
    let latest_10_artists= artists_sets.sort((a, b) => b.oldest_set_timestamp - a.oldest_set_timestamp).slice(0,10);
    

    return res.status(200).json({code:200,type:"Success",log:latest_10_artists});

    } catch (error) {
      return { code: 500, type: "Internal Server Error", log: error.message };
    }
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

//GET - Images des artistes | GET à Azuracast
app.get("/api/v1/radio/artists/:artist_id/cover", async (req, res) => {
  try {
    const { artist_id } = req.params;

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

//GET - Images des sets | GET à Azuracast
app.get("/api/v1/radio/artists/:artist_id/:episode_id/cover", async (req, res) => {
  try {
    const { artist_id,episode_id } = req.params;

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

