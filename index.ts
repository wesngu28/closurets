import { Closure } from './client/Closure'
import databaseConnect from './models/connect';
import { eventHandler } from './client/eventHandler';
import { commandHandler, deployCommands } from './client/commandHandler';
import dotenv from 'dotenv';
dotenv.config();

databaseConnect();
const client = new Closure;

async function buildClient(client: Closure) {
  await eventHandler(client);
  await commandHandler(client);
  await deployCommands(client);
  client.login(process.env.TOKEN);
}

buildClient(client);