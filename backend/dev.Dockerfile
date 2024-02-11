# This dockerfile is meant to be used in a development to enable hot reloading

FROM node:18-alpine

WORKDIR /backend

COPY ./ ./


RUN npm install

RUN chmod +x startup.sh

EXPOSE 3000

CMD ["npm", "run", "start:dev"]