require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'Tickado V2',
      script: 'dist/main.js',
      interpreter: 'node',
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'production',
      },
      instances: 'max',
      exec_mode: 'cluster', // 'fork' or 'cluster'
      autorestart: true,
      watch: true,
      max_memory_restart: '512M',
    },
  ],
};
