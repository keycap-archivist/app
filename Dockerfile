FROM node:12.16.1 as apibuilder
COPY ./api /project
WORKDIR /project
RUN yarn
RUN yarn build

FROM node:12.16.1 as uibuilder
COPY ./ui /project
WORKDIR /project
RUN yarn
RUN yarn build

FROM node:12.16.1-slim
COPY --from=apibuilder /project/dist/ /server/
COPY --from=apibuilder /project/package*.json /server/
WORKDIR /server/
RUN yarn install --production
COPY --from=uibuilder /project/dist/ /server/public/
EXPOSE 8080

CMD [ "node", "server.js" ]
