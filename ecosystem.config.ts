export default {
  apps: [
    {
      name: 'Tickado V2',
      script: 'src/main.ts',
      interpreter: 'bun',
      // args: 'start', // args are not needed if running the file directly
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
