import { ChannelType, Guild, PermissionsBitField } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';

export const guildCreate: DiscordEvent = {
  name: 'guildCreate',
  async execute(guild: Guild): Promise<void> {
    const findChannel = guild.channels.cache.find(
      channel =>
        channel.type === ChannelType.GuildText && channel.permissionsFor(guild.members.me!).has(PermissionsBitField.Flags.SendMessages)
    );
    if (findChannel && findChannel.type === ChannelType.GuildText) {
      findChannel.send('What can I get for you, Doc?');
    }
  },
};
