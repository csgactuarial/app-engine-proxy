var https = require('https');
var url = require('url');
var httpProxy = require('http-proxy');
var httpsOptionsClient = require('./https-options')

/**
 * Starts the proxy server, requires httpsOptions
 */
function startServer(httpsOptions) {
  var respond = function (status, msg, res) {
    res.writeHead(status, { 'content-type': 'text/plain' });
    res.write(msg);
    res.end();
  }

  var proxy = httpProxy.createProxyServer({ ssl: httpsOptions });

  var server = https.createServer(httpsOptions, function (req, res) {
    if (req.url == '/health-check') {
      return respond(200, '', res);
    }

    if (!req.headers['x-target']) {
      return respond(400, 'required header "X-Target" not found', res);
    }

    var target = req.headers['x-target'];
    var targetUrl = url.parse(target);

    // https://github.com/http-party/node-http-proxy/blob/master/lib/http-proxy/index.js#L65
    // force client cert for client ssl cert authentication
    if (req.headers['x-send-client-cert'] === 'true') {
      targetUrl.key = httpsOptions.key;
      targetUrl.cert = httpsOptions.cert;
    }

    var host = targetUrl.host;
    var protocol = targetUrl.protocol;
    var agent = (protocol == 'https:' ? https.globalAgent : http.globalAgent);
    req.url = '';

    proxy.web(req, res, {
      target: targetUrl,
      changeOrigin: true,
      agent: agent,
      headers: {
        host: host
      }
    });

  });

  server.listen(443);
}

httpsOptionsClient.buildFromSecretManager().then(httpsOptions => {
  startServer(httpsOptions);
});
