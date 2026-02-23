module.exports = {
  apps: [
    {
      name: 'Tickado V2',
      script: 'dist/main.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'dev',
      },
    },
  ],
};
