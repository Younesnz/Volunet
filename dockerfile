FROM node:lts-alpine3.18
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY . .
CMD ["yarn","start"]