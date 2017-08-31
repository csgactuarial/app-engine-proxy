var https = require('https');
var http  = require('http');
var util  = require('util');
var path  = require('path');
var fs    = require('fs');
var url   = require('url');
var httpProxy = require('http-proxy');

var httpsOpts = {
  key: fs.readFileSync('/path/to/key.pem', 'utf8'),
  cert: fs.readFileSync('/path/to/cert.pem', 'utf8')
};

var proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function (proxyReq, req, res) {
});

proxy.on('proxyRes', function (proxyRes, req, res) {
});

var server = http.createServer(function(req, res) {
  var target = req.headers['x-target'];
  var proxyURL = url.parse(target);
  var host = proxyURL.host;
  var protocol = proxyURL.protocol;
  var agent = (protocol == 'https:' ? https.globalAgent:http.globalAgent);
  req.url = '';

  proxy.web(req, res, {
    ssl: httpsOpts,
    target: target,
    agent: agent,
    headers: {
        host: host
    }
  });
});

server.listen(443);
