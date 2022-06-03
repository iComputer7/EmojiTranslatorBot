FROM node:alpine AS build

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY . /usr/src/bot/
RUN npm install
RUN npx tsc

FROM node:alpine

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY --from=build /usr/src/bot/node_modules /usr/src/bot/node_modules
COPY --from=build /usr/src/bot/build /usr/src/bot/build

CMD ["node", "build/index.js"]
