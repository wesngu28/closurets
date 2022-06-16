// Discord.JS will deprecate messageCreate events soon

import { Message } from "discord.js";

export const messageCreate = async (message: Message) => {
  if (message.author.bot) {
    return;
  }
  if (message.content.toLowerCase().includes("arknights")) {
    if(message.member) {
      message.reply(`Dokutah ${message.member.user.username}!`);
    }
  }
};