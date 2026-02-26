module.exports = {
  apps: [
    {
      name: 'NuxtWeb',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        NITRO_PORT: 3000,
        NITRO_HOST: '127.0.0.1'
      }
    }
  ]
}
