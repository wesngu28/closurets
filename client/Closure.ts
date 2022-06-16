import DiscordJS from 'discord.js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
dotenv.config({ path: path.resolve(__dirname, './.env') });

export class Closure extends DiscordJS.Client {
  public commands: DiscordJS.Collection<string, any>;

  constructor() {
    super({intents: [DiscordJS.Intents.FLAGS.GUILDS, DiscordJS.Intents.FLAGS.GUILD_MEMBERS, DiscordJS.Intents.FLAGS.GUILD_MESSAGES]});
    this.commands = new DiscordJS.Collection();
  }

  async commandHandler() {
    this.commands = new DiscordJS.Collection();
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      this.commands.set(command.data.name, command);
    }
  }

  async deployCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter((file:any) => file.endsWith('.ts'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      commands.push(command.data.toJSON());
    }

    console.log(process.env.TOKEN);

    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN!);

    rest.put(Routes.applicationCommands(process.env.CID!), { body: commands })
      .then(() => console.log('Successfully registered application commands.'))
      .catch(console.error);
  }

}