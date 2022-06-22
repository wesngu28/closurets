import { Guild } from 'discord.js';

export const guildCreate = async (guild: Guild) => {
  const channel = guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me!).has('SEND_MESSAGES'));
  if(channel) {
    if(channel?.isText()) {
      channel?.send("What can I get for you, Doc?")
    }
  }
}