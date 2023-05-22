# Closure - Discord Bot

Visit [here](https://closurets.vercel.app/) for documentation.

> A multifunctional discord bot offering simple utilities and commands like Arknights operator quick information and youtuber live status.

### Usage
Bot was self-hosted but I decided to move it to the cloud to reduce power use. If you want to self host move the files in the docker folder to the root and use docker-compose.prod.

### Notes
This is a personal project for both fun and to get more familiar with TypeScript interfaces and typings. It began in Javascript and was converted to Typescript. I initially used Puppeteer before transitioning to Playwright for the smaller package size and newer features, but using a browser automation tool to scrape was very heavy on memory and caused execution times to increase, which made me scrap it and just use node-html-parser to scrape the pages directly. This let me limit the use of the youtube API and is also quite performant.

For the landing page, I wanted to use Svelte but the simplicity it required made me opt for no framework.

The technologies and skills involved in this are similar to the ones I used in RhodesAPI as they were developed simultaenously.

Used Technologies: Visual Studio Code, Typescript, Sass, Node.js, MongoDB, Redis, Docker, Discord.js, Github Actions, Vercel
