import { MessageEmbed, GuildMember, TextChannel, WelcomeChannel } from 'discord.js';
import config from '../config/config.json';

export const guildMemberAdd = async(member: GuildMember) => {
  let welcomeImage = config.guild.welcome_img!;
  if(welcomeImage === '') {
    welcomeImage = config.default.welcome_img;
  }
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
    .setImage(welcomeImage)
    .setTimestamp();
  let welcome: string = '';
  if (config.guild.welcome_channel) {
    welcome = config.guild.welcome_channel;
  } else {
    welcome = config.default.welcome_channel;
  }
  const welcomeChannel = member.guild.channels.cache.get(welcome)!;
  if(welcomeChannel?.isText()) {
    welcomeChannel.send({
      embeds: [welcomeEmbed]
      });
  }
}