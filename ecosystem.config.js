require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'tickado-v2',
      script: 'dist/main.js',
      interpreter: 'node',
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'production',
      },
      instances: 1, //'max',
      exec_mode: 'fork', // 'fork' or 'cluster'
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
};
