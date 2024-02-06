# This dockerfile is meant to be used in a development to enable hot reloading

FROM node:18-alpine

WORKDIR /backend

COPY ./ ./

RUN npm install

EXPOSE 3000

RUN npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate

CMD ["npm", "run", "dev"]