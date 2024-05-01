FROM node AS base

COPY . .

RUN npm i

FROM node AS buildStage

COPY . .

COPY --from=base /node_modules /node_modules

ENV NODE_ENV=prod

RUN npm run build

FROM node AS prod

COPY --from=buildStage /dist /dist

COPY --from=buildStage /node_modules /node_modules

EXPOSE 3000

CMD ["node", "dist/main"]

FROM node as dev

COPY --from=base . .

ENV NODE_ENV=dev

EXPOSE 3000

CMD ["npm", "run", "start:dev"]