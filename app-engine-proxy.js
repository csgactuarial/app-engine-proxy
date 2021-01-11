var https = require('https');
var url = require('url');
var httpProxy = require('http-proxy');
var secretManager = require('./secret-manager');

var httpsOptions = {
  key: null,
  cert: null,
  ca: null
}

/**
 * looks for a config.json file and builds the HTTPSOptions
 * for client and server.
 * {
 *   "key": path to private key,
 *   "cert": path to certificate,
 *   "ca": path to certificate authority chain
 * }
 */
function buildHTTPSOptionsFromFiles() {
  var getHTTPSOptions = function() {
    return JSON.parse(fs.readFileSync('config.json', 'utf8')).keyCert;
  }
  
  var httpsOptions = {
    key: fs.readFileSync(getHTTPSOptions().key),
    cert: fs.readFileSync(getHTTPSOptions().cert),
    ca: fs.readFileSync(getHTTPSOptions().ca)
  }
}

/**
 * Builds the HTTPS Options for server and cleint SSL
 * Uses google cloud secret manager
 * 
 * @return {Promise[undefined, undefined, undefined]}
 */
async function buildHTTPSOptionsFromSecretManager() {
  let p1 = secretManager.getProxyClientPrivateKey().then(key => { httpsOptions.key = key });
  let p2 = secretManager.getProxyClientCRT().then(cert => { httpsOptions.cert = cert });
  let p3 = secretManager.getProxyClientCA().then(ca => { httpsOptions.ca = [ca] });

  return Promise.all([p1, p2, p3]);
}

/**
 * Starts the proxy server, requires httpsOptions
 */
function startServer() {
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
    if(req.headers['x-send-client-cert'] === 'true') {
      targetUrl.key = httpsOptions.key;
      targetUrl.cert = httpsOptions.cert;
    }

    proxy.web(req, res, {
      target: targetUrl,
      changeOrigin: true,
    });

  });

  server.listen(443);
}

buildHTTPSOptionsFromSecretManager().then((values) => startServer());