FROM node:lts-alpine AS build

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN apk add --no-cache openssl

RUN npm install  --silent && mv node_modules ../

COPY . .

RUN npx prisma generate

RUN chown -R node /usr/src/app

USER node

RUN npm run build

FROM node:lts-alpine AS production

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN apk add --no-cache openssl

RUN npm install --production --omit=dev --silent && mv node_modules ../

COPY --from=build /usr/src/app/dist ./dist

COPY --from=build /usr/src/app/prisma ./prisma

RUN npx prisma generate

EXPOSE 8080

CMD [ "node", "./dist/main" ]