# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup
查询进程：
netstat -ano | findstr :3000
netstat -ano | findstr LISTENING | findstr :3000
结束进程：taskkill /PID 进程号 /F
Make sure to install dependencies:

```bash
# npm
npm install
# pnpm
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## 服务器部署指南 (Linux/CentOS/Ubuntu)

本指南适用于 4核 4G 内存服务器的生产环境部署。我们将使用 Node.js + PM2 + Nginx 的组合。

### 1. 环境准备

确保服务器已安装以下软件：
- **Node.js** (推荐 v18 或 v20 LTS 版本)
- **PNPM** (推荐使用 pnpm 管理依赖)
- **Nginx** (用于反向代理)
- **PM2** (用于进程守护)

```bash
# 安装 PM2
npm install pm2 -g
```

### 2. 项目构建

在本地或服务器上进行构建。如果服务器网络较差，建议在本地构建后上传 `.output` 目录。

```bash
# 安装依赖
pnpm install

# 构建生产环境代码
pnpm run build
```

构建完成后，会生成 `.output` 目录，这是 Nuxt 3 的构建产物。

### 3. 部署运行

将 `.output` 目录上传到服务器（如果是在本地构建）。

#### 3.1 上传文件 (命令参考)

**Linux / macOS (使用 rsync):**
```bash
# 替换 ip 和路径
rsync -avz --progress .output/ root@193.112.118.107:/data/www/nuxt-web/.output/
scp package.json ecosystem.config.js root@193.112.118.107:/data/www/nuxt-web/
```

**Windows (PowerShell 使用 scp):**
```powershell
# 替换 ip 和路径
scp -r .output root@193.112.118.107:/data/www/nuxt-web/
scp package.json ecosystem.config.js root@193.112.118.107:/data/www/nuxt-web/
```

#### 3.2 启动服务

##### 使用 Node 直接运行测试
```bash
node .output/server/index.mjs
```
如果看到 `Listening on http://localhost:3000` 说明运行成功。

#### 使用 PM2 守护进程 (推荐)

在项目根目录下创建 `ecosystem.config.js` 文件：

```javascript
module.exports = {
  apps: [
    {
      name: 'NuxtWeb',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max', // 利用 4核 CPU
      script: './.output/server/index.mjs',
      env: {
          NITRO_PORT: 3000,
          NITRO_HOST: '127.0.0.1' // 仅监听本地，配合 Nginx 使用
      }
    }
  ]
}
```

启动服务：
```bash
pm2 start ecosystem.config.js
pm2 save 已保存进程列表（pm2 save）
pm2 startup 已设置开机自启（pm2 startup）
```

### 4. Nginx 配置

配置 Nginx 反向代理到本地 3000 端口。

编辑 Nginx 配置文件 (通常在 `/etc/nginx/conf.d/nuxtweb.conf` 或 `/etc/nginx/sites-available/default`)：

```nginx
server {
    listen 80;
    server_name your_domain.com; # 替换为你的域名或 IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

重启 Nginx：
```bash
nginx -t # 检查配置
systemctl reload nginx
```

### 5. Docker 部署 (可选)

如果你更喜欢使用 Docker，可以创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制构建产物 (确保先执行了 pnpm run build)
COPY .output ./.output

EXPOSE 3000

ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
```

构建并运行：
```bash
docker build -t nuxt-web .
docker run -d -p 3000:3000 --name nuxt-web nuxt-web
```

