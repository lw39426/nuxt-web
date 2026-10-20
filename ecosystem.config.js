/**
 * PM2 进程管理配置（生产环境）
 *
 * 部署方式：软链发布 + 秒级回滚
 * - 应用根目录: /data/www/nuxt-web/
 * - 当前版本:   /data/www/nuxt-web/current -> releases/<时间戳>/
 * - 历史版本:   /data/www/nuxt-web/releases/ (保留最近 5 版)
 *
 * 部署流程：
 * 1. CI 构建产物 rsync 到 /data/www/nuxt-web/releases/<时间戳>/
 * 2. ln -sfn /data/www/nuxt-web/current /data/www/nuxt-web/releases/<时间戳>
 * 3. pm2 reload ecosystem.config.js --update-env
 * 4. curl 健康检查（验证 X-Data-Source: backend）
 */

module.exports = {
  apps: [
    {
      name: 'NuxtWeb',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max',
      // 指向软链，pm2 reload 时自动解析到新版本
      // 注意：releases/<时间戳>/ 下直接是 .output 的内容（server/public/nitro.json）
      script: '/data/www/nuxt-web/current/server/index.mjs',
      cwd: '/data/www/nuxt-web/current',

      // 日志配置
      out_file: '/data/www/nuxt-web/logs/out.log',
      error_file: '/data/www/nuxt-web/logs/error.log',
      merge_logs: true,
      time: true,

      // 环境变量（生产环境）
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: 3000,
        NITRO_HOST: '127.0.0.1',

        // BFF 后端地址（同机直连 Flask）
        NUXT_API_SECRET_BASE: 'http://127.0.0.1:5050/api/v1',

        // Mock 开关：生产环境必须 false
        NUXT_PUBLIC_USE_MOCK: 'false',

        // 站点域名（SEO / canonical / sitemap）
        NUXT_PUBLIC_SITE_URL: 'https://www.lyoo.cloud',

        // API 超时（毫秒）
        NUXT_API_TIMEOUT: '8000'
      }
    }
  ]
}
