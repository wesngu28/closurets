import { Guild } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';

export const guildCreate: DiscordEvent = {
  name: 'guildCreate',
  async execute(guild: Guild): Promise<void> {
    const findChannel = guild.channels.cache.find(
      channel =>
        channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me!).has('SEND_MESSAGES')
    );
    if (findChannel && findChannel.isText()) {
      findChannel.send('What can I get for you, Doc?');
    }
  },
};
