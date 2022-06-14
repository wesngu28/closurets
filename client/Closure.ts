import DiscordJS from 'discord.js';
import fs from 'fs';
import path from 'node:path';

export class Closure extends DiscordJS.Client {
  public commands: DiscordJS.Collection<string, any>;

  constructor() {
    super({intents: [DiscordJS.Intents.FLAGS.GUILDS, DiscordJS.Intents.FLAGS.GUILD_MEMBERS, DiscordJS.Intents.FLAGS.GUILD_MESSAGES]});
    this.commands = new DiscordJS.Collection();
  }

  start() {
    this.commandHandler();
    this.eventHandler();
    this.login(process.env.TOKEN);
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

  async eventHandler() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      if (event.once) {
        this.once(event.name, (...args) => event.execute(...args));
      } else {
        this.on(event.name, (...args) => event.execute(...args));
      }
    }
  }

}