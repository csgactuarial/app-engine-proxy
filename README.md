# App Engine Proxy

1) clone
2) npm install
3) sudo nodejs app-engine-proxy.js

# Daemonize and auto restart in case of process failure
1) npm install pm2
2) pm2 start app-engine-proxy.js
3) pm2 startup ubuntu
4) pm2 save
