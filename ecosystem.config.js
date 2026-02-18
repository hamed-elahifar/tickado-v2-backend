module.exports = {
  apps: [
    {
      name: 'Tickado new',
      script: 'dist/main.js',
      interpreter: 'bun',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
