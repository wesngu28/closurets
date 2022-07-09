FROM mcr.microsoft.com/playwright:focal as development

WORKDIR /closure

COPY package*.json ./

RUN npm install
RUN npx playwright install

COPY . .

FROM development as production

COPY tsconfig*.json ./

RUN npm run build

RUN npm prune --production