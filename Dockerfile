FROM node:12.16.1-slim
COPY api/dist/ /server/
COPY ui/dist/ /server/public/
WORKDIR /server/

CMD [ "node", "server.js" ]
