#!/bin/sh
### find the GCP VM external ip
EXTERNAL_IP=$(curl http://metadata/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip  -H "Metadata-Flavor: Google")

turnserver -c turnserver.conf --external-ip="${EXTERNAL_IP}"
