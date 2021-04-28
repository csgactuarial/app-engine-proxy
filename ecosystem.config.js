module.exports = {
    apps : [{
      script: '/home/tcross/app-engine-proxy/app-engine-proxy.js',
      instances: 4,
      autorestart: true,
      cron_restart: "*/10 * * * *"
    }]
  };