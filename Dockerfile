FROM node:14-alpine3.12

WORKDIR /app
COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . /app

CMD ["/app/entrypoint.sh"]
