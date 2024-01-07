FROM node:18-alpine AS build

WORKDIR /app
COPY . .
RUN yarn

ARG NODE_ENV
RUN yarn build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/yarn.lock ./

ARG NODE_ENV
RUN yarn

EXPOSE 7001

CMD ["yarn", "online"]