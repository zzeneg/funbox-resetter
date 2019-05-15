FROM node:alpine

WORKDIR /funbox

COPY . .

RUN apk add --no-cache --virtual .build-deps make gcc g++ python && \
  npm i && \
  npm run build-ts && \
  apk del .build-deps && \
  npm prune --production

CMD ["npm", "run", "serve"]



