# Dev
FROM node:10-alpine as dev

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ./package*.json yarn.lock ./

USER node

RUN yarn --pure-lockfile

COPY --chown=node:node . .

RUN yarn build


# Release
FROM node:10-alpine as release

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ./package*.json yarn.lock ./

COPY --chown=node:node  . .

USER node

RUN yarn --production

COPY --chown=node:node  --from=dev /home/node/app/dist ./dist
