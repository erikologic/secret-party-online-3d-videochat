#!/usr/bin/env bash
set -exo pipefail

if [[ -z "$DUCKDNS_DOMAIN" ]]; then
    echo "Must provide your created DUCKDNS_DOMAIN as environment var" 1>&2
    exit 1
fi

if [[ -z "$DUCKDNS_TOKEN" ]]; then
    echo "Must provide your DUCKDNS_TOKEN as environment var" 1>&2
    exit 1
fi

sudo amazon-linux-extras install -y docker
sudo yum update -y
sudo yum -y install git
sudo service docker start

#find external IP
export EXTERNAL_IP="$(curl http://169.254.169.254/latest/meta-data/public-ipv4)"

# expect OK from DuckDNS
DUCKDNS_REGISTRATION=$(curl "https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=")
if [[ ! $DUCKDNS_REGISTRATION = "OK" ]]; then
    echo "DuckDNS registration failed" 1>&2
    exit 1
fi

git clone https://github.com/mrenrich84/secret-party-online-3d-videochat ~/app
cd  ~/app/docker-compose
./prepare-docker-compose.sh
