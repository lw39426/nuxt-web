FROM node:20-alpine

WORKDIR /app

# 复制构建产物 (确保先执行了 pnpm run build)
COPY .output ./.output

EXPOSE 3000

ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
