# Tirnatek Radio v.3.0 ( W.I.P )

## [Azuracast](https://github.com/AzuraCast/AzuraCast) Proxy layer suite in Javascript dedicated to [Tirnatek Radio](https://www.tirnatek.fr) organization.

This projet is composed of :

- **NextJS** : React based frontend, proxy backend to express via [next.config.mjs](https://github.com/St4lV/tntr-next-js/blob/main/nextjs/next.config.mjs);
- **ExpressJS** : HTTP server, used here as an API in order to proxy all elements of Azuracast needed in this project, handle both MongoDB and MariaDB database to upgrade data transmission speed to frontend.
- **DiscordJS** : Javascript Lib to make discord bot, deserve utils using **Express** API;
- **MongoDB** : Used here to map Podcasts Authors and Episodes, as the default Azuracast API force to use an API Key to use them publicly and some data are not supported natively and take a lot of requests in order to get the information;
  - (Installed on the server where this suite is running indepently from this project, may provide an installation script or a docker container built-in this suite in the future)
- **MariaDB** : Handle user accounts & permissions management; 
  - (Installed on the server where this suite is running indepently from this project, may provide an installation script or a docker container built-in this suite in the future)

This projet is an upgraded rework of the following project : [docker-react-azuracast-web-interface](https://github.com/St4lV/docker-react-azuracast-web-interface)
