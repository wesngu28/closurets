import { MessageEmbed, GuildMember } from 'discord.js';
import welcomeModel from '../models/welcomeModel';
import { DiscordEvent } from '../types/DiscordEvent';

export const guildMemberAdd: DiscordEvent = {
  name: 'guildMemberAdd',
  async execute(member: GuildMember): Promise<void> {
    const guilded = await welcomeModel.findOne({ _id: member.guild.id });
    if (guilded) {
      const welcomeEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Welcome')
        .setAuthor({
          name: member.guild.name,
          iconURL: member.guild.iconURL()!,
          url: `https://discord.com/channels/${member.guild.id}`,
        })
        .setDescription(`Hello ${member.user.toString()}, welcome to ${member.guild.name}`)
        .setThumbnail(member.user.avatarURL()!)
        .setImage(guilded.image)
        .setTimestamp();
      const channel = member.guild.channels.cache.get(guilded!.channelID);
      if (channel && channel.isText()) {
        channel.send({ embeds: [welcomeEmbed] });
      }
    }
  },
};
