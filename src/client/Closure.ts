import DiscordJS from 'discord.js';
import { Command } from '../types/Command';

export class Closure extends DiscordJS.Client {
  commands: DiscordJS.Collection<string, any>;

  runDate: string;

  cooldown: Set<String>;

  constructor(
    commands: DiscordJS.Collection<string, Command>,
    runDate: string,
    cooldown: Set<string>
  ) {
    super({
      intents: [
        DiscordJS.Intents.FLAGS.GUILDS,
        DiscordJS.Intents.FLAGS.GUILD_MEMBERS,
        DiscordJS.Intents.FLAGS.GUILD_MESSAGES,
      ],
    });
    this.commands = commands;
    this.runDate = runDate;
    this.cooldown = cooldown;
  }
}
