// Discord.JS will deprecate messageCreate events soon

import { Message } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';

export const messageCreate: DiscordEvent = {
  name: 'messageCreate',
  async execute(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (message.content.toLowerCase().includes('arknights')) {
      if (message.member) {
        message.reply(`Dokutah ${message.member.user.username}`);
      }
    }
  },
};
