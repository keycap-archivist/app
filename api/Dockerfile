FROM node:12.16.1 as builder
COPY ./ /project
WORKDIR /project
RUN yarn
RUN yarn build

FROM node:12.16.1
COPY --from=builder /project/dist/ /server/
WORKDIR /server/
RUN ls
EXPOSE 80
ENV LISTEN_PORT=80

CMD [ "node", "server.js" ]
