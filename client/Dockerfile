FROM node:10.24.1-alpine AS node

WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY yarn.lock ./
RUN yarn config set registry https://registry.npmmirror.com/
RUN yarn

COPY . .

ARG NODE_ENV
ARG VUE_APP_API_IP
ARG VUE_APP_API_PORT
RUN yarn build

FROM nginx:1.24.0-alpine

COPY --from=node /app/dist /usr/share/nginx/html
