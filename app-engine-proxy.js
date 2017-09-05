var fs = require('fs');
var url = require('url');
var httpProxy = require('http-proxy');

var respond = function(status, msg, res){
  res.writeHead(status, {'content-type': 'text/plain'});
  res.write(msg);
  res.end();
}

var getHTTPSOptions = function() {
  return JSON.parse(fs.readFileSync('config.json', 'utf8')).keyCert;
}

var httpsOptions = {
  key: fs.readFileSync(getHTTPSOptions().key),
  cert: fs.readFileSync(getHTTPSOptions().cert)
}
var proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function (proxyReq, req, res) {
});

proxy.on('proxyRes', function (proxyRes, req, res) {
});

// var server = http.createServer(function(req, res) {
var server = https.createServer(httpsOptions, function(req, res) {
  if(req.url == '/health-check') {
    return respond(200, '', res);
  }

  if(!req.headers['x-target']) {
    return respond(400, 'required header "X-Target" not found', res);
  }

  if(req.headers['x-forwarded-for']) {
    var xForwardedFor = req.headers['x-forwarded-for'].split(',');
    if(xForwardedFor && xForwardedFor.length) {
      // https://cloud.google.com/compute/docs/load-balancing/http/#target_proxies
      req.headers['x-forwarded-for'] = xForwardedFor.pop();
    }
  }

  var target = req.headers['x-target'];
  var proxyURL = url.parse(target);
  var host = proxyURL.host;
  var protocol = proxyURL.protocol;
  var agent = (protocol == 'https:' ? https.globalAgent:http.globalAgent);
  req.url = '';

  proxy.web(req, res, {
    target: target,
    agent: agent,
    headers: {
        host: host
    }
  });
});

// server.listen(8585);
server.listen(443);
