FROM node AS buildStage

COPY . .

RUN npm i

RUN npm run build

FROM node

COPY --from=buildStage /dist /dist

COPY --from=buildStage /node_modules /node_modules

EXPOSE 3000

ENV NODE_ENV="prod"

CMD ["node", "dist/main"]