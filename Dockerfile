FROM node:16

WORKDIR /closure

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm prune --production

CMD ["npm", "start"]