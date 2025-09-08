const { Readable } = require('stream');
const fetch = require('node-fetch');

const { Episode, Artist } = require("./mongo-db-schemas.js");

const { azuracast_values, frontend_values } = require("../express_utils/env-values-dictionnary.js");

// Azuracast values

const azuracast_server = azuracast_values.server;
const api_key = azuracast_values.api_key;
const station_shortcode = azuracast_values.station.shortcode;

// Frontend values

const frontend_domain = frontend_values.server;
const front_api_link = frontend_values.api_route;

const { URLize } = require("../express_utils/utils.js")

async function updateArtistFromAzuracast(){
  const response = await getApiRequest(`${azuracast_server}/api/station/${station_shortcode}/podcasts`);
  
  if (response.code!=200){return};
  
  const artists_raw_data=response.log

  for (let i of artists_raw_data){

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

  const response = await getApiRequest(`${azuracast_server}/api/station/${station_shortcode}/podcasts`);

  if (response.code!=200){return};

  for (let i of response.log){
	if (i.is_published){
	  const artist_sets_response = await getApiRequest(`${azuracast_server}/api/station/${station_shortcode}/podcast/${i.id}/episodes`);
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

// Template requête GET à Azuracast
async function getApiRequest(address) {
  try {
	const response = await fetch(address, {
	  method: "GET",
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
};

// Template requête GET Media à Azuracast
async function getMediaRequest(media_url, res, req) {
	const forwardedHeaders = { ...req.headers };

	forwardedHeaders["x-forwarded-for"] = forwardedHeaders["x-forwarded-for"]?.replace(/::ffff:/g, "");
	delete forwardedHeaders["host"];
	delete forwardedHeaders["connection"];
	delete forwardedHeaders["content-length"];

	if (req.headers.range) {
		forwardedHeaders["range"] = req.headers.range;
	}

	forwardedHeaders["authorization"] = `Bearer ${api_key}`;

	const controller = new AbortController();
	const actual = await fetch(media_url, {
		headers: forwardedHeaders,
		signal: controller.signal,
	});

	res.statusCode = actual.status;

	const hopByHopHeaders = [
		"transfer-encoding",
		"connection",
		"keep-alive",
		"proxy-authenticate",
		"proxy-authorization",
		"te",
		"trailer",
		"upgrade",
	];

	actual.headers.forEach((value, name) => {
		if (!hopByHopHeaders.includes(name.toLowerCase())) {
			res.setHeader(name, value);
		}
	});

	res.on("close", () => {
		if (actual?.body?.destroy) {
			actual.body.destroy();
		}
		controller.abort();
	});

	if (typeof actual.body.pipe === "function") {
		actual.body.pipe(res);
	} else {
		const readable = Readable.fromWeb(actual.body);
		readable.pipe(res);
		res.on('close', () => {
			readable.destroy();
			controller.abort();
		});
	}
}


// Template d'objet Artiste à retourner

function artistTemplate(i){
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
};

// Template d'objet Episode à retourner
function episodeTemplate(i){
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
};

module.exports = {updateArtistFromAzuracast, updateEpisodesFromAzuracast, getApiRequest, getMediaRequest, artistTemplate, episodeTemplate};