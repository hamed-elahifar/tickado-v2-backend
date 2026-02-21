export default {
  apps: [
    {
      name: 'Tickado V2',
      script: 'bun',
      args: 'run start',
      interpreter: 'none',
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
