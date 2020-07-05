ARG VUE_APP_REVISION

FROM docker.pkg.github.com/keycap-archivist/app/base:latest as apibuilder
COPY ./packages/api /project
WORKDIR /project
RUN yarn
RUN yarn build

FROM docker.pkg.github.com/keycap-archivist/app/base:latest as uibuilder
ENV VUE_APP_REVISION=${VUE_APP_REVISION}
COPY ./packages/ui /project
WORKDIR /project
RUN yarn
RUN yarn build

FROM docker.pkg.github.com/keycap-archivist/app/base:latest
COPY --from=apibuilder /project/dist/ /server/
COPY --from=apibuilder /project/package.json /server/
COPY --from=apibuilder /project/yarn.lock /server/
COPY --from=uibuilder /project/dist/ /server/public/
WORKDIR /server/
RUN yarn install --production

CMD [ "node", "server.js" ]
