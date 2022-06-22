import { MessageEmbed, GuildMember } from 'discord.js';
import Welcome from '../models/Welcome';

export const guildMemberAdd = async(member: GuildMember) => {
  const guilded = await Welcome.findOne(({ _id: member.guild.id }));
  if(guilded !== null) {
    const welcomeImage = guilded!.image
    const welcomeEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Welcome')
      .setAuthor({
        name: member.guild.name,
        iconURL: member.guild.iconURL()!,
        url: `https://discord.com/channels/${member.guild.id}`
      })
      .setDescription(`Hello ${member.user.toString()}, welcome to ${member.guild.name}`)
      .setThumbnail(member.user.avatarURL()!)
      .setImage(welcomeImage!)
      .setTimestamp();
    const channel = member.guild.channels.cache.get(guilded!.channelID);
    if(channel?.isText()) {
      channel?.send({
        embeds: [welcomeEmbed]
        })
    }
  }
}