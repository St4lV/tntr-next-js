const { Router } = require("express");
const router = Router();

const { Episode } = require("../mongo-db-schemas.js");

const { episodeTemplate } = require('../utils.js');

//GET - Derniers sets publiés | Query à MongoDB

router.get("/latests", async (req, res) => {
  try{
	const episodes_list = await Episode.find({published:true,has_media:true});
	let artists_sets=[];
	for (let i of episodes_list){
	  artists_sets.push(episodeTemplate(i));
	};

	//Décroissant puis 10 premiers
	let latest_10_podcasts= artists_sets.sort((a, b) => b.release_date - a.release_date).slice(0,10);
	
	
	return res.status(200).json({code:200,type:"Success",log:latest_10_podcasts});

	} catch (error) {
	  return { code: 500, type: "Internal Server Error", log: error.message };
	}
});

module.exports = router