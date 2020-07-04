FROM node:14.5.0-slim
COPY packages/api/dist/ /server/
COPY packages/ui/dist/ /server/public/
WORKDIR /server/

CMD [ "node", "server.js" ]
