require('dotenv').config();

// Values from .env file

const express_values = {
    port : process.env.EXPRESS_PORT,
    public_route : process.env.EXPRESS_PUBLIC_ROUTE

}

const azuracast_values = {
    api_key:process.env.AZURACAST_PODCASTS_API_KEY,
    server:process.env.AZURACAST_SERVER,
    station:{
        shortcode:process.env.AZURACAST_STATION_SHORTCODE
    }
}

const frontend_values = {
    api_route:process.env.FRONTEND_API_ROUTE,
    server:process.env.FRONTEND_DOMAIN,
}

const mongo_db_values = {
    server:process.env.MONGODB_SERVER,
    port:process.env.MONGODB_PORT,
    database:process.env.MONGODB_DATABASE,
}

const maria_db_values = {
    server:process.env.MARIADB_SERVER,
    port:process.env.MARIADB_SERVER_PORT,
    database:process.env.MARIADB_USER,
    user:process.env.MARIADB_USER_PASSWORD,
    password:process.env.MARIADB_DATABASE,
}

module.exports = {express_values, azuracast_values, frontend_values, mongo_db_values, maria_db_values}