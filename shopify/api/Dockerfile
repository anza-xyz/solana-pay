FROM node:14.18.2-alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY yarn.lock ./
COPY tsoa.json ./
RUN yarn install --silent

# add app
COPY . ./

WORKDIR /pay

COPY ../../js /pay

WORKDIR /app

RUN yarn run build

# start app
CMD ["yarn", "start"]
