const { Router } = require("express");
const router = Router();

const { getApiRequest, getMediaRequest } = require('../utils.js'); 

const { azuracast_values, frontend_values } = require("../../express_utils/env-values-dictionnary.js");

// Azuracast values

const azuracast_server = azuracast_values.server;
const station_shortcode = azuracast_values.station.shortcode;

// Frontend values

const front_api_link = frontend_values.api_route;

////// AZURACAST FETCH //////

//GET - Actuellement joué | GET à Azuracast
router.get("/now_playing", async (req, res) => {
  const response = await getApiRequest(`${azuracast_server}/api/nowplaying_static/${station_shortcode}.json`,req);
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
router.get("/schedule", async (req, res) => {
  const response = await getApiRequest(`${azuracast_server}/api/station/${station_shortcode}/schedule?now=now&rows=48`, req);
  return res.status(response.code).json(response);
});

//GET - Flux audios | GET à Azuracast
router.get("/mountpoints/:mount", async (req, res) => {
  try {
	const { mount } = req.params;

	await getMediaRequest(`${azuracast_server}/listen/tntr/${mount}`,res,req);

  } catch (error) {
	console.error(error);
	res.status(500).json({code: 500,type: "Internal Server Error",log: error.message});
  }
});

////// ARTISTS ROUTES //////

const artists_routes = require("./artists.js");
router.use(`/artists`, artists_routes)

////// EPISODES (SETS) ROUTES //////

const sets_routes = require("./sets.js");
router.use(`/sets`, sets_routes)

module.exports = router