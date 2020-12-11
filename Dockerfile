FROM docker.pkg.github.com/keycap-archivist/app/base:latest as apibuilder
COPY ./ /project
WORKDIR /project
RUN yarn
RUN yarn build

FROM docker.pkg.github.com/keycap-archivist/app/base:latest
COPY --from=apibuilder /project/dist/ /server/dist/
COPY --from=apibuilder /project/package.json /server/
COPY --from=apibuilder /project/yarn.lock /server/
WORKDIR /server/
RUN yarn install --production

CMD [ "node", "dist/server.js" ]
