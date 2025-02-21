FROM node:lts-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

RUN apk add --no-cache openssl

RUN npm install --silent

RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:lts-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

RUN apk add --no-cache openssl

RUN npm install --production --silent

RUN npx prisma generate

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/src/main.js"]