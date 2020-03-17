FROM node:12.16.1 as builder
COPY ./ /project
WORKDIR /project
RUN yarn
RUN yarn build

FROM node:12.16.1
COPY --from=builder /project/dist/ /server/
COPY --from=builder /project/package*.json /server/
WORKDIR /server/
RUN yarn install --production
EXPOSE 8080
ENV LISTEN_PORT=8080

CMD [ "node", "server.js" ]

