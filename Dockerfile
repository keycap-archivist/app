FROM node:14.5.0-slim
COPY packages/api/dist/ /server/
COPY packages/ui/dist/ /server/public/
WORKDIR /server/
RUN apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
CMD [ "node", "server.js" ]
