# App Engine Proxy

**App Engine Proxy** is a Node.js proxy server that uses [node-http-proxy](https://github.com/nodejitsu/node-http-proxy) to modify and proxy URL Fetch requests.  This solution was inspired by an integration with a third party that requires a dedicated IP for their firewall.

### Install
1) clone
2) cd app-engine-proxy
3) npm install
4) sudo nodejs app-engine-proxy.js

### Daemonize and auto restart in case of process failure
1) npm install pm2
2) pm2 start app-engine-proxy.js
3) pm2 startup ubuntu
4) pm2 save

### Usage
````
GET / HTTP/1.1
Host: proxy.example.com
X-Target: https://csgapi.appspot.com/v1/med_supp/open/companies.json
Cache-Control: no-cache
````
The main thing to notice here is the "X-Target" header.  This is the URI you wish to reach.

#### CURL
````
curl https://csgapi.appspot.com/v1/med_supp/open/companies.json -x https://proxy.example.com
````
#### Python (App Engine)
````
url = 'https://csgapi.appspot.com/v1/med_supp/open/companies.json'

headers = {
    'X-Target': url,
}

response = urlfetch.fetch('http://proxy.example.com', headers=headers)
print(response.status_code)
print(response.content)

````
