module.exports = {
  apps: [
    {
      name: 'Tickado V2',
      script: 'src/main.ts',
      interpreter: 'bun',
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
