/**
 * looks for a config.json file and builds the HTTPSOptions
 * for client and server.
 * {
 *   "key": path to private key,
 *   "cert": path to certificate,
 *   "ca": path to certificate authority chain
 * }
 * 
 * @return {Object}
 */
function buildFromFiles() {
    var fs = require('fs');

    var getHTTPSOptions = function () {
        return JSON.parse(fs.readFileSync('config.json', 'utf8')).keyCert;
    }

    return {
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
async function buildFromSecretManager() {
    var secretManager = require('./secret-manager');

    let keyPromise = secretManager.getProxyClientPrivateKey().then(key => key);
    let certPromise = secretManager.getProxyClientCRT().then(cert => cert );
    let caPromise = secretManager.getProxyClientCA().then(ca => [ca] );

    let certParts = await Promise.all([keyPromise, certPromise, caPromise]);

    return  {
      key: certParts[0],
      cert: certParts[1],
      ca: certParts[2]
    }
}

module.exports = {
    buildFromFiles: buildFromFiles,
    buildFromSecretManager: buildFromSecretManager
}