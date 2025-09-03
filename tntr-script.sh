#!/bin/bash

case "$1" in
  config)
    case "$2" in
      reset)
        rm -f ./discordjs/.env
        rm -f ./express/.env
        echo "Config reset"
        ;;
      express)
        case "$3" in
          reset)
            rm -f ./express/.env
            echo "Express config reset"
            ;;
          *)
            read -p "Express port (default 3001): " express_port
            read -p "Express public route (default /api/v1): " express_route

            read -p "Azuracast API key: " azuracast_key
            read -p "Azuracast server API route: " azuracast_route
            read -p "Azuracast station shortcode: " azuracast_shortcode

            read -p "Frontend API route (default /api/v1): " frontend_route
            read -p "Frontend domain (https://...): " frontend_domain
            
            read -p "MongoDB server address: " mongodb_server
            read -p "MongoDB port (default 27017): " mongodb_port
            read -p "MongoDB database name: " mongodb_db
            read -p "MariaDB server address: " mariadb_server
            read -p "MariaDB port (default 3306): " mariadb_port
            read -p "MariaDB user: " mariadb_user
            read -p "MariaDB password: " mariadb_password
            read -p "MariaDB database name: " mariadb_db

            express_port=${express_port:-3001}
            express_route=${express_route:-"/api/v1"}
            frontend_route=${frontend_route:-"/api/v1"}
            mongodb_port=${mongodb_port:-27017}
            mariadb_port=${mariadb_port:-3306}

            mkdir -p ./express
            cat > ./express/.env <<EOF
# EXPRESS VALUES
EXPRESS_PORT=$express_port
EXPRESS_PUBLIC_ROUTE=$express_route

# AZURACAST INFOS
AZURACAST_PODCASTS_API_KEY="$azuracast_key"
AZURACAST_SERVER_API_ROUTE="$azuracast_route"
AZURACAST_STATION_SHORTCODE="$azuracast_shortcode"

# FRONTEND INFOS
FRONTEND_API_ROUTE=$frontend_route
FRONTEND_DOMAIN="$frontend_domain"

# MONGODB INFOS
MONGODB_SERVER="$mongodb_server"
MONGODB_PORT=$mongodb_port
MONGO_DATABASE="$mongodb_db"

# MARIADB INFOS
MARIADB_SERVER="$mariadb_server"
MARIADB_SERVER_PORT=$mariadb_port
MARIADB_USER="$mariadb_user"
MARIADB_USER_PASSWORD="$mariadb_password"
MARIADB_DATABASE="$mariadb_db"
EOF

            echo "Express config saved."
            ;;
        esac
        ;;
      *)
        echo "Usage : $0 config {express|reset}"
        exit 1
        ;;
    esac
    ;;
  update)
    echo "Updating..."
    mv discordjs/.env discordjs/.env.bak
    mv express/.env express/.env.bak
    mv nextjs/.env nextjs/.env.bak
    mv nextjs/public/sitemap.xml nextjs/public/sitemap.xml.bak
    mv nextjs/public/robots.txt nextjs/public/robots.txt.bak
    mv nextjs/public/.htaccess nextjs/public/.htaccess.bak
    find . -type f ! -name "*.bak" -delete
    curl -L -o tntr_app.zip https://github.com/St4lV/tntr-next-js/archive/refs/heads/main.zip
    unzip tntr_app.zip -d ../
    rm tntr_app.zip
    mv discordjs/.env.bak discordjs/.env
    mv express/.env.bak express/.env
    mv nextjs/.env.bak nextjs/.env
    mv nextjs/public/sitemap.xml.bak nextjs/public/sitemap.xml 
    mv nextjs/public/robots.txt.bak nextjs/public/robots.txt
    mv nextjs/public/.htaccess.bak nextjs/public/.htaccess
    chmod +x tntr-script.sh
    docker compose down
    docker container prune -f
    docker image prune -f
    cd express
    docker build -t tntr_back . # --no-cache
    cd ../nextjs
    docker build -t tntr_front . # --no-cache
    cd ../discordjs
    docker build -t tntr_bot . # --no-cache
    cd ../
    echo "Updated successfully"
    ./tntr-script.sh start
    ;;
  start)
    echo "Starting..."
    docker compose up --detach
    ;;
  stop)
    echo "Stopping..."
    docker compose down
    ;;
  install)
    echo "Installing Tirnatek App.."
    ./tntr-script.sh config express
    cd express
    docker build -t tntr_back .
    cd ../nextjs
    docker build -t tntr_front .
    cd ../discordjs
    docker build -t tntr_bot .
    cd ../
    ./tntr-script.sh start
    ;;
  *)
    echo "Usage : $0 {config|start|stop|install|update}"
    exit 1
    ;;
esac
