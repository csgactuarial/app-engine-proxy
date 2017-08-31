# App Engine Proxy

1) clone
2) npm install
3) sudo nodejs app-engine-proxy.js

# Daemonize and auto restart in case of process failure
npm install pm2
pm2 start app-engine-proxy.js
pm2 startup ubuntu
pm2 save
