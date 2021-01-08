'use strict';


/**
 * gets the project id of this compute instance
 * @return {string} the project id
 */
async function getProjectId() {
    const { google } = require('googleapis');
    return await google.auth.getProjectId().then(project_id => {
        return project_id;
    });
}

/**
 * gets the value of a secret by key
 * @param {string} projectId - google project id
 * @param {string} secretName - the name of the secret to retrieve
 * @param {string} desiredVersion - specify a version "latest" is default
 */
async function getSecret(projectId, secretName, desiredVersion = 'latest') {
    const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
    const name = 'projects/' + projectId + '/secrets/' + secretName + '/versions/' + desiredVersion;

    const client = new SecretManagerServiceClient();

    const [version] = await client.accessSecretVersion({
        name: name,
    });

    return version.payload.data.toString();
}

/**
 * gets proxy client private key
 * @returns {string} - value of secret
 */
async function getProxyClientPrivateKey() {
    let secretName = 'proxy-client-private-key';
    return await getProjectId().then(
        project_id => getSecret(project_id, secretName)
    );
}

/**
 * gets proxy client certificate
 * @returns {string} - value of secret
 */
async function getProxyClientCRT() {
    let secretName = 'proxy-client-crt';
    return await getProjectId().then(
        project_id => getSecret(project_id, secretName)
    );
}

/**
 * gets proxy client certificate athority
 * @returns {string} - value of secret
 */
async function getProxyClientCA() {
    let secretName = 'proxy-client-ca';
    return await getProjectId().then(
        project_id => getSecret(project_id, secretName)
    );
}

module.exports = {
    getProxyClientPrivateKey: getProxyClientPrivateKey,
    getProxyClientCRT: getProxyClientCRT,
    getProxyClientCA: getProxyClientCA
}