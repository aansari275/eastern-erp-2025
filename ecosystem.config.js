// PM2 Process Manager Configuration for Eastern ERP
module.exports = {
  apps: [
    {
      name: 'eastern-erp-dev',
      script: 'server/index.ts',
      interpreter: 'tsx',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        FRONTEND_PORT: 3000
      },
      watch: ['server', 'shared'],
      ignore_watch: ['node_modules', 'dist', 'uploads', 'attached_assets'],
      watch_options: {
        followSymlinks: false
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true,
      kill_timeout: 3000,
      restart_delay: 1000
    }
  ]
};