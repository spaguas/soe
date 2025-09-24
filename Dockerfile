FROM node:21.7.3-alpine as base

WORKDIR /usr/src/app

COPY package*.json /
EXPOSE 20000

FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . /
CMD ["npm", "start"]