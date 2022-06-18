import DiscordJS from 'discord.js';

export class Closure extends DiscordJS.Client {
  public commands: DiscordJS.Collection<string, any>;

  constructor() {
    super({intents: [DiscordJS.Intents.FLAGS.GUILDS, DiscordJS.Intents.FLAGS.GUILD_MEMBERS, DiscordJS.Intents.FLAGS.GUILD_MESSAGES]});
    this.commands = new DiscordJS.Collection();
  }

}