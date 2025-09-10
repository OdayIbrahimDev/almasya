module.exports = {
  apps: [{
    name: 'almasya-web',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
