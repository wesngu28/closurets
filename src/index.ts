import dotenv from 'dotenv';
import { Closure } from './client/Closure';
import { databaseConnect } from './models/connect';
import { eventHandler } from './client/eventHandler';
import { commandHandler, deployCommands } from './client/commandHandler';

dotenv.config();

databaseConnect();
const client = new Closure();

async function buildClient(bot: Closure) {
  await eventHandler(bot);
  await commandHandler(bot);
  await deployCommands();
  bot.login(process.env.TOKEN);
}

buildClient(client);
