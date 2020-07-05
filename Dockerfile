ARG NODEVERSION=14.5.0
ARG VUE_APP_REVISION

FROM node:${NODEVERSION}-slim as apibuilder
COPY ./packages/api /project
WORKDIR /project
RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN yarn
RUN yarn build

FROM node:${NODEVERSION}-slim as uibuilder
ENV VUE_APP_REVISION=${NODEVERSION}
COPY ./packages/ui /project
WORKDIR /project
RUN yarn
RUN yarn build

FROM node:${NODEVERSION}-slim
COPY --from=apibuilder /project/dist/ /server/
COPY --from=apibuilder /project/package.json /server/
COPY --from=apibuilder /project/yarn.lock /server/
COPY --from=uibuilder /project/dist/ /server/public/
WORKDIR /server/
RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN yarn install --production

CMD [ "node", "server.js" ]
