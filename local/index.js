'use strict';

var nodeStatic = require('node-static');
var https = require('https');
const fs = require('fs');

var fileServer = new nodeStatic.Server();
var app = https.createServer({
  key: fs.readFileSync(`cert/key.pem`),
  cert: fs.readFileSync(`cert/cert.pem`),
  passphrase: "password"
}, function(req, res) {
  fileServer.serve(req, res);
}).listen(443);
