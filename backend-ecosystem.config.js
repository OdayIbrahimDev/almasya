module.exports = {
  apps: [{
    name: 'almasya-api',
    script: 'src/server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    }
  }]
};
