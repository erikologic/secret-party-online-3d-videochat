# Get some sw
```
sudo apt install -y coturn git tmux nginx snapd
sudo service coturn stop
```

# Configure duckdns with external IP
https://www.duckdns.org/domains

# Check GCP firewall and DuckDNS are ok
From another machine:
```
curl http://${EXTERNAL_IP}/
curl http://secret-party.duckdns.org/
```

# Configure nginx
```
sudo unlink /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-enabled/default
```

# Restart nginx - check is running
```
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

# Configure Lets Encrypt certs
```
sudo snap install core
sudo snap refresh core
sudo snap install hello-world
sudo apt-get remove certbot
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot certonly --nginx
sudo systemctl restart nginx
```

# Start a python test server on port 8080
```
echo "Hello, world." > index.html
python -m SimpleHTTPServer 8080
```

# Check the HTTPS server and reverse proxy are ok
From another machine:
```
curl https://secret-party.duckdns.org/
```

# Get the project
```
mv secret-party-gh* .ssh/
chmod go-r .ssh/secret-party-gh*
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/secret-party-gh
ssh -T git@github.com
git clone git@github.com:mrenrich84/secret-party-online-3d-videochat.git
```

# Get node
```
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash 
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install --lts
```

# Run the servers
```
cd secret-party-online-3d-videochat
npm run build && npm run start

cd turnserver
sudo ./start-up.sh
```

# Run the app
Go to https://secret-party.duckdns.org/