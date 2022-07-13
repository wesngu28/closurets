import { MessageEmbed } from 'discord.js';

export interface EmbedInformation {
  title: string;
  name: string;
  iconURL: string;
  description: string;
  thumbnail: string;
  image: string;
  id: string;
  publishedAt: string;
}

export interface AnnouncementEmbed {
  content: string;
  embeds: MessageEmbed[];
  publishedDate: string;
}
