FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY tsconfig.json ./
RUN npm run build

ENV SMS_FLORIN_API_KEY=""

CMD ["node", "dist/index.js"]
