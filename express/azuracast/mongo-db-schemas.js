const mongoose = require("mongoose");

const artist_schema = mongoose.model("Artist", new mongoose.Schema({
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

const episode_schema = mongoose.model("Episode", new mongoose.Schema({
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

const Artist = mongoose.models.Artist || mongoose.model("Artist", artist_schema);
const Episode = mongoose.models.Episode || mongoose.model("Episode", episode_schema);

module.exports = { Episode , Artist };