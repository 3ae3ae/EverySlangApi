FROM node AS base

COPY . .

RUN npm i

FROM node AS buildStage

ENV NODE_ENV=prod

COPY . .

COPY --from=base /node_modules /node_modules

RUN npm run build

FROM node AS prod

EXPOSE 3000

COPY --from=buildStage /dist /dist

COPY --from=buildStage /node_modules /node_modules

CMD ["node", "dist/main"]

FROM node as dev

ENV NODE_ENV=dev

EXPOSE 3000

COPY --from=base . .

CMD ["npm", "run", "start:dev"]