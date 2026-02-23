module.exports = {
  apps: [
    {
      name: 'Tickado V2',
      script: 'dist/main.js',
      interpreter: 'bun',
      env: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
};
