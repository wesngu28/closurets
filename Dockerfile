FROM node:alpine as development

WORKDIR /closure

COPY package*.json ./

RUN npm install

COPY . .

FROM development as production

COPY tsconfig*.json ./

RUN npm run build

RUN npm prune --production