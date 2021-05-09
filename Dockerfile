FROM node:14.15.1-slim as apibuilder
COPY ./ /project
WORKDIR /project
RUN yarn
RUN yarn build

FROM node:14.15.1-slim
RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
COPY --from=apibuilder /project/dist/ /server/dist/
COPY --from=apibuilder /project/package.json /server/
COPY --from=apibuilder /project/yarn.lock /server/
WORKDIR /server/
RUN yarn install --production

CMD [ "node", "dist/server.js" ]
