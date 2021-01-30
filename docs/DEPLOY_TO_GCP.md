# DEPLOY TO GCP

### Create a GCP Compute Engine VM instance
[Create a GCP Compute Engine VM instance](https://cloud.google.com/compute/docs/instances/create-start-instance):
 - based on Debian Buster,
 - with the firewall open to HTTPS connections.  

[Add firewall rules](https://cloud.google.com/vpc/docs/using-firewalls) to open access to the TURN server ports:
```
all TCP & UDP
3478 and 3479 (standard listening-port and alternative listening port)
5349 and 5350 (standard tls-listening-port and alternative tls-listening-port)
49152 - 65535 (standard relay ports)
```

### Get the tools
[SSH into the VM](https://cloud.google.com/compute/docs/instances/connecting-to-instance) and then
```
sudo apt install -y coturn git tmux nginx snapd
sudo service coturn stop
sudo systemctl coturn disable
```

### Register the external IP with DNSs
E.g. create a subdomain in DuckDNS: https://www.duckdns.org/domains  
You can get the VM external IP with 
```
curl http://metadata/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip  -H "Metadata-Flavor: Google"
```

### Check GCP firewall and DNSs are ok
From your local machine:
```
curl http://${EXTERNAL_IP}/
curl http://YOUR_REGISTERED_URL/
```

### Configure Lets Encrypt certs
```
sudo snap install core
sudo snap refresh core
sudo snap install hello-world
sudo apt-get remove certbot
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot certonly --nginx # Follow the instructions
```
Note the location of your Lets Encrypt certificate - you'll need them in the next step   

### Configure nginx
```
sudo unlink /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-enabled/default
```
Copy & paste from the nginx configuration in this repo  
Change the configuration according to your needs  

### Restart nginx
```
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

### Start a python test server on port 8080
```
echo "Hello, world." > index.html
python -m SimpleHTTPServer 8080
```

### Check the nginx reverse proxy is working fine
From your local machine:
```
curl https://YOUR_REGISTERED_URL/
```

### Get the project
```
git clone https://github.com/mrenrich84/secret-party-online-3d-videochat.git
cd secret-party-online-3d-videochat
```

### Get node
```
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash 
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  ## This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  ## This loads nvm bash_completion
nvm install --lts
```
You might need to log out and log in again at this stage

### Update the codebase with your registered URL
```
# obviously replace your.registered.url.com with the URL you have registered
grep -rl YOUR_REGISTERED_URL src --exclude-dir=.git | xargs sed -i '' 's/YOUR_REGISTERED_URL/your.registered.url/g'
```

### Run the servers
```
tmux
npm run build && npm run start
```
Create another pane in tmux with `ctrl+b` and `%` then
```
cd turnserver
sudo ./start-up.sh
```

### Enter the app
In Chrome, navigate to your registered URL