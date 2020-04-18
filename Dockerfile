FROM node:12.16.1-slim
COPY packages/api/dist/ /server/
COPY packages/ui/dist/ /server/public/
WORKDIR /server/

CMD [ "node", "server.js" ]
