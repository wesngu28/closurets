import dotenv from 'dotenv';
import DiscordJS from 'discord.js';
import { Closure } from './client/Closure';
import { databaseConnect } from './models/connect';
import { eventHandler } from './client/eventHandler';
import { commandHandler, deployCommands } from './client/commandHandler';
import { Command } from './types/Command';
import { RedisClient } from './models/redis';

dotenv.config();

databaseConnect();
const client = new Closure(
  new DiscordJS.Collection<string, Command>(),
  new Date(Date.now()).toISOString(),
  new Set<string>()
);

async function buildClient(bot: Closure) {
  await eventHandler(bot);
  await commandHandler(bot);
  await deployCommands();
  await RedisClient.init();
  bot.login(process.env.TOKEN);
}

buildClient(client);
