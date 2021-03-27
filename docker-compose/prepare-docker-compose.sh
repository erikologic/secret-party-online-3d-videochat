#!/usr/bin/env bash
set -exo pipefail

if [[ -z "$URL" ]]; then
    echo "Must provide the application URL as environment var" 1>&2
    exit 1
fi

if [[ -z "$EMAIL" ]]; then
    echo "Must provide the HTTPS certificates owner EMAIL as environment var" 1>&2
    exit 1
fi

if [[ -z "$EXTERNAL_IP" ]]; then
    echo "Must provide the instance EXTERNAL_IP as environment var" 1>&2
    exit 1
fi

if [[ ! -d "/etc/letsencrypt" ]]; then
    echo "Installing letsencrypt certs"
    sudo docker run --rm --name certbot -p 80:80        \
       -v "/etc/letsencrypt:/etc/letsencrypt"               \
       -v "/var/lib/letsencrypt:/var/lib/letsencrypt"       \
       certbot/certbot certonly -n --standalone --agree-tos \
       --email "$EMAIL"                                       \
       --domains "$URL"
fi

# prepare the nginx reverse proxy configuration
sed -i "s/YOUR_REGISTERED_URL/$URL/g" ../nginx/default
sed -i "s/localhost/app/g" ../nginx/default

# install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.28.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/bin/docker-compose
sudo chmod +x /usr/bin/docker-compose

sudo --preserve-env=URL,EXTERNAL_IP docker-compose up
