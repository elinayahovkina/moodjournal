FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY src ./src
COPY prisma ./prisma
COPY prisma.config.ts ./ 

RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/server.js"]
